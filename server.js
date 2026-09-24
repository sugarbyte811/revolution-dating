// server.js — serves the static Revolution Profile app and persists
// completed assessments to Postgres. Admin routes (listing profiles,
// generating the private matchmaker report, and the two-person Match Key)
// are gated by a shared-secret x-admin-token header, mirroring the
// candidate-assessment project's admin pattern. There is no per-client
// login; a client only ever sees their own on-screen/emailed dossier.

import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import nodemailer from 'nodemailer';
import { randomUUID, randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

import { score } from './src/scoring.js';
import { clientReport } from './src/report-client.js';
import { matchmakerProfile } from './src/report-matchmaker.js';
import { compareSummary } from './src/compatibility.js';
import { validateIntake } from './src/intake.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(express.static(__dirname));

const { Pool } = pg;
const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
  : null;

const scrypt = promisify(scryptCb);

async function hashPassword(password) {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, 64);
  return `${salt.toString('hex')}:${derived.toString('hex')}`;
}

async function verifyPassword(password, stored) {
  if (!stored || typeof password !== 'string' || !password) return false;
  const [saltHex, hashHex] = stored.split(':');
  if (!saltHex || !hashHex) return false;
  const salt = Buffer.from(saltHex, 'hex');
  const hash = Buffer.from(hashHex, 'hex');
  const derived = await scrypt(password, salt, 64);
  return derived.length === hash.length && timingSafeEqual(derived, hash);
}

async function ensureSchema() {
  if (!pool) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS profiles (
      id UUID PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      intake JSONB NOT NULL,
      answers JSONB NOT NULL,
      notes TEXT NOT NULL DEFAULT '',
      active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  await pool.query(`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notes TEXT NOT NULL DEFAULT '';`);
  await pool.query(`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true;`);

  // Admin password now lives here so the matchmaker can change it from the
  // dashboard herself, without needing Render access. Seeded once from
  // ADMIN_TOKEN (if set) so the existing password keeps working after
  // upgrading; from then on ADMIN_TOKEN is ignored in favor of this table.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admin_auth (
      id INT PRIMARY KEY DEFAULT 1,
      password_hash TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      CHECK (id = 1)
    );
  `);
  const { rows } = await pool.query('SELECT 1 FROM admin_auth WHERE id = 1');
  if (!rows.length && process.env.ADMIN_TOKEN) {
    const hash = await hashPassword(process.env.ADMIN_TOKEN);
    await pool.query(
      'INSERT INTO admin_auth (id, password_hash) VALUES (1, $1) ON CONFLICT (id) DO NOTHING',
      [hash]
    );
  }
}

async function checkAdminPassword(candidate) {
  if (!pool || !candidate) return false;
  const { rows } = await pool.query('SELECT password_hash FROM admin_auth WHERE id = 1');
  if (!rows.length) {
    // Schema not seeded yet (e.g. DATABASE_URL just configured, no ADMIN_TOKEN
    // ever set) - nothing to check against.
    return false;
  }
  return verifyPassword(candidate, rows[0].password_hash);
}

// Admin auth is a single shared password (one matchmaker desk, no per-user
// accounts), hashed and stored in Postgres so it can be changed from the
// dashboard itself. The browser exchanges it for the same value via
// /api/admin/login so the UI can show a real login screen instead of a
// native prompt() - there is no server-side session, the password itself is
// still what gates every subsequent admin request.
async function requireAdmin(req, res, next) {
  if (!pool) return res.status(500).json({ error: 'DATABASE_URL not configured.' });
  const token = req.headers['x-admin-token'];
  const ok = await checkAdminPassword(token);
  if (!ok) return res.status(401).json({ error: 'Missing or invalid x-admin-token.' });
  next();
}

// TEMPORARY diagnostic - reveals no secret values, only booleans. Remove
// once the admin_auth seeding issue is confirmed fixed.
app.get('/api/_diag/admin-auth', async (req, res) => {
  if (!pool) return res.json({ pool: false });
  const hasEnv = !!process.env.ADMIN_TOKEN;
  const envLen = (process.env.ADMIN_TOKEN || '').length;
  let hasDbRow = false;
  let dbError = null;
  try {
    const { rows } = await pool.query('SELECT 1 FROM admin_auth WHERE id = 1');
    hasDbRow = rows.length > 0;
  } catch (e) {
    dbError = e.message;
  }
  res.json({ pool: true, hasEnv, envLen, hasDbRow, dbError });
});

app.post('/api/admin/login', async (req, res) => {
  if (!pool) return res.status(500).json({ error: 'DATABASE_URL not configured.' });
  const { token } = req.body || {};
  const ok = await checkAdminPassword(token);
  if (!ok) return res.status(401).json({ error: 'Incorrect password.' });
  res.json({ ok: true });
});

// ─── Admin: change the dashboard password ───────────────────────────────
app.post('/api/admin/change-password', requireAdmin, async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (typeof newPassword !== 'string' || newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters.' });
  }
  const ok = await checkAdminPassword(currentPassword);
  if (!ok) return res.status(401).json({ error: 'Current password is incorrect.' });
  const hash = await hashPassword(newPassword);
  await pool.query(
    `INSERT INTO admin_auth (id, password_hash, updated_at) VALUES (1, $1, now())
     ON CONFLICT (id) DO UPDATE SET password_hash = $1, updated_at = now()`,
    [hash]
  );
  res.json({ ok: true });
});

async function getProfile(id) {
  const { rows } = await pool.query('SELECT * FROM profiles WHERE id = $1', [id]);
  return rows[0] || null;
}

function mailer() {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_PORT } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

// ─── Submit a completed assessment ─────────────────────────────────────
app.post('/api/submit', async (req, res) => {
  if (!pool) return res.status(500).json({ error: 'DATABASE_URL not configured.' });
  const { intake, answers } = req.body || {};
  const v = validateIntake(intake || {});
  if (!v.valid) return res.status(400).json({ error: 'Incomplete intake.', missing: v.missing });
  if (!answers || typeof answers !== 'object') return res.status(400).json({ error: 'Missing answers.' });

  // Recompute server-side — never trust a client-supplied score for the
  // record that becomes the durable, matchmaker-visible profile.
  let profile;
  try {
    profile = score(answers, intake);
  } catch (e) {
    return res.status(400).json({ error: 'Could not score submission.', detail: e.message });
  }

  const id = randomUUID();
  await pool.query(
    'INSERT INTO profiles (id, name, email, intake, answers) VALUES ($1, $2, $3, $4, $5)',
    [id, intake.preferredName || 'Client', intake.email, intake, answers]
  );
  res.json({ profileId: id, name: profile.name });
});

// ─── Admin: list/search profiles ────────────────────────────────────────
app.get('/api/admin/profiles', requireAdmin, async (req, res) => {
  if (!pool) return res.status(500).json({ error: 'DATABASE_URL not configured.' });
  const q = (req.query.q || '').trim();
  const showInactive = req.query.includeInactive === '1';
  const clauses = [];
  const params = [];
  if (!showInactive) clauses.push('active = true');
  if (q) {
    params.push(`%${q}%`);
    clauses.push(`(name ILIKE $${params.length} OR email ILIKE $${params.length})`);
  }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const { rows } = await pool.query(
    `SELECT id, name, email, active, created_at FROM profiles ${where} ORDER BY created_at DESC`,
    params
  );
  res.json({ profiles: rows });
});

// ─── Admin: one profile's full record (intake, notes, active) ──────────
app.get('/api/admin/profiles/:id', requireAdmin, async (req, res) => {
  if (!pool) return res.status(500).json({ error: 'DATABASE_URL not configured.' });
  const row = await getProfile(req.params.id);
  if (!row) return res.status(404).json({ error: 'Profile not found.' });
  res.json({
    id: row.id, name: row.name, email: row.email, intake: row.intake,
    answers: row.answers, notes: row.notes, active: row.active, createdAt: row.created_at,
  });
});

// ─── Admin: update notes / active status ────────────────────────────────
app.patch('/api/admin/profiles/:id', requireAdmin, async (req, res) => {
  if (!pool) return res.status(500).json({ error: 'DATABASE_URL not configured.' });
  const row = await getProfile(req.params.id);
  if (!row) return res.status(404).json({ error: 'Profile not found.' });
  const notes = typeof req.body?.notes === 'string' ? req.body.notes : row.notes;
  const active = typeof req.body?.active === 'boolean' ? req.body.active : row.active;
  await pool.query('UPDATE profiles SET notes = $1, active = $2 WHERE id = $3', [notes, active, row.id]);
  res.json({ ok: true, notes, active });
});

// ─── Admin: the client's own dossier, for PDF download from the dashboard ──
app.get('/api/admin/profiles/:id/dossier', requireAdmin, async (req, res) => {
  if (!pool) return res.status(500).json({ error: 'DATABASE_URL not configured.' });
  const row = await getProfile(req.params.id);
  if (!row) return res.status(404).json({ error: 'Profile not found.' });
  const p = score(row.answers, row.intake);
  res.json({ name: row.name, report: clientReport(p) });
});

// ─── Admin: private Matchmaker Profile for one client ───────────────────
app.get('/api/admin/profiles/:id/matchmaker', requireAdmin, async (req, res) => {
  if (!pool) return res.status(500).json({ error: 'DATABASE_URL not configured.' });
  const row = await getProfile(req.params.id);
  if (!row) return res.status(404).json({ error: 'Profile not found.' });
  const p = score(row.answers, row.intake);
  res.json({ name: row.name, report: matchmakerProfile(p, row.intake) });
});

// ─── Admin: Compare For Match (two-person internal analysis) ───────────
app.post('/api/admin/match', requireAdmin, async (req, res) => {
  if (!pool) return res.status(500).json({ error: 'DATABASE_URL not configured.' });
  const { profileIdA, profileIdB } = req.body || {};
  if (!profileIdA || !profileIdB || profileIdA === profileIdB) {
    return res.status(400).json({ error: 'Two distinct profile ids are required.' });
  }
  const [a, b] = await Promise.all([getProfile(profileIdA), getProfile(profileIdB)]);
  if (!a || !b) return res.status(404).json({ error: 'One or both profiles not found.' });

  const summary = compareSummary(score(a.answers, a.intake), score(b.answers, b.intake), {
    aName: a.name,
    bName: b.name,
  });
  res.json({ summary });
});

// ─── Admin: email a client their own dossier (never the matchmaker report) ──
app.post('/api/admin/email-results/:id', requireAdmin, async (req, res) => {
  if (!pool) return res.status(500).json({ error: 'DATABASE_URL not configured.' });
  const row = await getProfile(req.params.id);
  if (!row) return res.status(404).json({ error: 'Profile not found.' });

  const transporter = mailer();
  if (!transporter) return res.status(503).json({ error: 'SMTP not configured.' });

  const p = score(row.answers, row.intake);
  const report = clientReport(p);
  const bodyText = [
    `Your Romantic Signature — prepared for ${report.name}`,
    '',
    `Primary Archetype: ${report.archetype.primary}`,
    `Hidden Archetype: ${report.archetype.hidden}`,
    `Romantic Shadow: ${report.archetype.shadow}`,
    '',
    ...report.sections.flatMap((s) => [s.title, s.body, '']),
    report.closing,
  ].join('\n');

  await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to: row.email,
    subject: 'Your Revolution Dating Results',
    text: bodyText,
  });

  res.json({ sent: true, to: row.email });
});

const PORT = process.env.PORT || 4173;
ensureSchema()
  .then(() => {
    app.listen(PORT, () => console.log(`Revolution Dating listening on ${PORT}`));
  })
  .catch((e) => {
    console.error('Failed to prepare database schema:', e.message);
    app.listen(PORT, () => console.log(`Revolution Dating listening on ${PORT} (schema init failed)`));
  });
