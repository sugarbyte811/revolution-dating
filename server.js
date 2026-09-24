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
import { randomUUID } from 'node:crypto';

import { score } from './src/scoring.js';
import { clientReport } from './src/report-client.js';
import { matchmakerReport } from './src/report-matchmaker.js';
import { matchKey } from './src/compatibility.js';
import { validateIntake } from './src/intake.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(express.static(__dirname));

const { Pool } = pg;
const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
  : null;

async function ensureSchema() {
  if (!pool) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS profiles (
      id UUID PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      intake JSONB NOT NULL,
      answers JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

function requireAdmin(req, res, next) {
  const token = req.headers['x-admin-token'];
  if (!process.env.ADMIN_TOKEN) {
    return res.status(500).json({ error: 'Server missing ADMIN_TOKEN configuration.' });
  }
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Missing or invalid x-admin-token.' });
  }
  next();
}

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

// ─── Admin: list all profiles ──────────────────────────────────────────
app.get('/api/admin/profiles', requireAdmin, async (req, res) => {
  if (!pool) return res.status(500).json({ error: 'DATABASE_URL not configured.' });
  const { rows } = await pool.query(
    'SELECT id, name, email, created_at FROM profiles ORDER BY created_at DESC'
  );
  res.json({ profiles: rows });
});

// ─── Admin: private matchmaker report for one profile ──────────────────
app.get('/api/admin/profiles/:id/matchmaker', requireAdmin, async (req, res) => {
  if (!pool) return res.status(500).json({ error: 'DATABASE_URL not configured.' });
  const row = await getProfile(req.params.id);
  if (!row) return res.status(404).json({ error: 'Profile not found.' });
  const p = score(row.answers, row.intake);
  res.json({ name: row.name, report: matchmakerReport(p) });
});

// ─── Admin: two-person Match Key ───────────────────────────────────────
app.post('/api/admin/match', requireAdmin, async (req, res) => {
  if (!pool) return res.status(500).json({ error: 'DATABASE_URL not configured.' });
  const { profileIdA, profileIdB } = req.body || {};
  if (!profileIdA || !profileIdB || profileIdA === profileIdB) {
    return res.status(400).json({ error: 'Two distinct profile ids are required.' });
  }
  const [a, b] = await Promise.all([getProfile(profileIdA), getProfile(profileIdB)]);
  if (!a || !b) return res.status(404).json({ error: 'One or both profiles not found.' });

  const key = matchKey(score(a.answers, a.intake), score(b.answers, b.intake), {
    aName: a.name,
    bName: b.name,
  });
  res.json({ key });
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
