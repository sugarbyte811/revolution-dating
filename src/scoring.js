/**
 * scoring.js
 * The deterministic engine behind The Revolution Profile.
 *
 * Guarantees:
 *  - Identical answers always produce an identical profile. No randomness.
 *  - No single question can determine an archetype, a shadow or an axis.
 *  - Every claim carries an evidence count, and the report writers are
 *    required to consult it before making a strong statement.
 *  - Axis maxima are derived from the question set itself, so the scale stays
 *    correct if a question is ever edited.
 */

import {
  BIPOLAR_KEYS, PROFILES, PROFILE_KEYS, MIN_EVIDENCE,
  STRONG_AXIS, MILD_AXIS, CONFLICT_STYLE_META, REPAIR_META
} from './dimensions.js';
import {
  ARCHETYPE_KEYS, ARCHETYPES, SHADOWS, SHADOW_KEYS, STRATEGIES
} from './archetypes.js';
import { QUESTIONS } from './questions.js';

/* ------------------------------------------------------------------ */
/* DERIVED SCALE MAXIMA                                                */
/* ------------------------------------------------------------------ */

/**
 * For each bipolar axis, the largest absolute total a client could reach by
 * choosing the most extreme option at every question. Used to normalise.
 */
const AXIS_MAX = (() => {
  const max = Object.fromEntries(BIPOLAR_KEYS.map((k) => [k, 0]));
  for (const q of QUESTIONS) {
    for (const key of BIPOLAR_KEYS) {
      let best = 0;
      for (const opt of q.options) {
        const w = Math.abs(opt.bipolar?.[key] ?? 0);
        if (w > best) best = w;
      }
      max[key] += best;
    }
  }
  return max;
})();

const ARCHETYPE_MAX = (() => {
  const max = Object.fromEntries(ARCHETYPE_KEYS.map((k) => [k, 0]));
  for (const q of QUESTIONS) {
    for (const key of ARCHETYPE_KEYS) {
      let best = 0;
      for (const opt of q.options) {
        for (const a of opt.arc || []) if (a.key === key && a.w > best) best = a.w;
      }
      max[key] += best;
    }
  }
  return max;
})();

/* ------------------------------------------------------------------ */
/* SMALL HELPERS                                                       */
/* ------------------------------------------------------------------ */

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const round = (v) => Math.round(v * 10) / 10;

/** Deterministic argmax: ties break by the canonical key order. */
function argmax(scores, order, exclude = []) {
  let best = null;
  let bestVal = -Infinity;
  for (const key of order) {
    if (exclude.includes(key)) continue;
    const v = scores[key] ?? 0;
    if (v > bestVal) { bestVal = v; best = key; }
  }
  return best;
}

/** Rank keys high to low, ties by canonical order. */
function rank(scores, order, exclude = []) {
  return order
    .filter((k) => !exclude.includes(k))
    .map((k, i) => ({ key: k, value: scores[k] ?? 0, tie: i }))
    .sort((a, b) => (b.value - a.value) || (a.tie - b.tie));
}

/** Convert a raw channel tally into percentage shares of the set. */
function shares(tally) {
  const total = Object.values(tally).reduce((a, b) => a + b, 0);
  if (!total) return Object.fromEntries(Object.keys(tally).map((k) => [k, 0]));
  return Object.fromEntries(
    Object.entries(tally).map(([k, v]) => [k, round((v / total) * 100)])
  );
}

/** Descriptive band for a normalised axis value. */
export function axisBand(v) {
  if (v <= -STRONG_AXIS) return 'strongLow';
  if (v <= -MILD_AXIS) return 'low';
  if (v < MILD_AXIS) return 'mid';
  if (v < STRONG_AXIS) return 'high';
  return 'strongHigh';
}

/** Top n channels of a share map, with ties broken canonically. */
export function topChannels(shareMap, order, n = 2) {
  return rank(shareMap, order).slice(0, n);
}

/* ------------------------------------------------------------------ */
/* MAIN SCORING                                                        */
/* ------------------------------------------------------------------ */

/**
 * @param {Record<string,string>} answers  { q1:'a', q2:'c', ... }
 * @param {object} intake
 * @returns {object} the complete hidden profile
 */
export function score(answers, intake = {}) {
  /* --- accumulators --- */
  const axisRaw = Object.fromEntries(BIPOLAR_KEYS.map((k) => [k, 0]));
  const axisEvidence = Object.fromEntries(BIPOLAR_KEYS.map((k) => [k, 0]));

  const profileRaw = {};
  const profileEvidence = {};
  for (const [set, def] of Object.entries(PROFILES)) {
    profileRaw[set] = Object.fromEntries(def.channels.map((c) => [c, 0]));
    profileEvidence[set] = Object.fromEntries(def.channels.map((c) => [c, 0]));
  }

  const arcPublic = Object.fromEntries(ARCHETYPE_KEYS.map((k) => [k, 0]));
  const arcPrivate = Object.fromEntries(ARCHETYPE_KEYS.map((k) => [k, 0]));
  const arcEvidence = Object.fromEntries(ARCHETYPE_KEYS.map((k) => [k, 0]));

  const statedRaw = Object.fromEntries(ARCHETYPE_KEYS.map((k) => [k, 0]));
  const strategyRaw = Object.fromEntries(STRATEGIES.map((k) => [k, 0]));
  const strategyEvidence = Object.fromEntries(STRATEGIES.map((k) => [k, 0]));

  const flags = [];
  const answered = [];
  const unanswered = [];

  /* --- walk the answers --- */
  for (const q of QUESTIONS) {
    const choice = answers?.[q.id];
    const opt = q.options.find((o) => o.id === choice);
    if (!opt) { unanswered.push(q.id); continue; }
    answered.push(q.id);

    for (const [k, w] of Object.entries(opt.bipolar || {})) {
      if (!(k in axisRaw) || w === 0) continue;
      axisRaw[k] += w;
      axisEvidence[k] += 1;
    }

    for (const [set, channels] of Object.entries(opt.profiles || {})) {
      if (!profileRaw[set]) continue;
      for (const [c, w] of Object.entries(channels)) {
        if (!(c in profileRaw[set])) continue;
        profileRaw[set][c] += w;
        profileEvidence[set][c] += 1;
      }
    }

    for (const a of opt.arc || []) {
      if (!(a.key in arcPublic)) continue;
      (a.mode === 'private' ? arcPrivate : arcPublic)[a.key] += a.w;
      arcEvidence[a.key] += 1;
    }

    for (const [k, w] of Object.entries(opt.stated || {})) {
      if (k in statedRaw) statedRaw[k] += w;
    }

    for (const [k, w] of Object.entries(opt.strategies || {})) {
      if (!(k in strategyRaw)) continue;
      strategyRaw[k] += w;
      strategyEvidence[k] += 1;
    }

    for (const f of opt.flags || []) flags.push({ question: q.id, note: f });
  }

  /* --- normalise axes to -100..100 --- */
  const axes = {};
  for (const k of BIPOLAR_KEYS) {
    const max = AXIS_MAX[k] || 1;
    axes[k] = round(clamp((axisRaw[k] / max) * 100, -100, 100));
  }

  /* --- profile shares --- */
  const profiles = {};
  for (const set of PROFILE_KEYS) profiles[set] = shares(profileRaw[set]);

  /* --- archetypes --- */
  const arcTotal = {};
  for (const k of ARCHETYPE_KEYS) {
    const max = ARCHETYPE_MAX[k] || 1;
    arcTotal[k] = round(((arcPublic[k] + arcPrivate[k]) / max) * 100);
  }

  const primary = argmax(arcTotal, ARCHETYPE_KEYS);
  const ranked = rank(arcTotal, ARCHETYPE_KEYS);

  // Hidden archetype: the strongest PRIVATE signal that is not the primary.
  // This is what "the part people do not see" structurally means here.
  let hidden = argmax(arcPrivate, ARCHETYPE_KEYS, [primary]);
  if ((arcPrivate[hidden] ?? 0) === 0) {
    hidden = argmax(arcTotal, ARCHETYPE_KEYS, [primary]);
  }

  const leadMargin = ranked.length > 1 ? ranked[0].value - ranked[1].value : 100;
  let archetypeConfidence = 'tentative';
  if (arcEvidence[primary] >= MIN_EVIDENCE.archetype) {
    archetypeConfidence = leadMargin >= 12 ? 'strong' : 'moderate';
  }

  /* --- stated vs demonstrated --- */
  const statedTop = argmax(statedRaw, ARCHETYPE_KEYS);
  const statedHasSignal = (statedRaw[statedTop] ?? 0) > 0;
  const divergent =
    statedHasSignal && statedTop !== primary && statedTop !== hidden;

  /* --- romantic shadow --- */
  const shadow = resolveShadow(strategyRaw, strategyEvidence, primary);

  /* --- conflict and repair summaries --- */
  const conflictOrder = PROFILES.conflict.channels;
  const repairOrder = PROFILES.repair.channels;
  const conflictTop = topChannels(profiles.conflict, conflictOrder, 2)
    .filter((c) => c.value > 0);
  const repairTop = topChannels(profiles.repair, repairOrder, 3)
    .filter((c) => c.value > 0);

  /* --- love language give/receive/reassure --- */
  const loveOrder = PROFILES.give.channels;
  const giveTop = topChannels(profiles.give, loveOrder, 2).filter((c) => c.value > 0);
  const receiveTop = topChannels(profiles.receive, loveOrder, 2).filter((c) => c.value > 0);
  const reassureTop = topChannels(profiles.reassure, loveOrder, 2).filter((c) => c.value > 0);

  const giveReceiveSplit =
    giveTop[0] && receiveTop[0] && giveTop[0].key !== receiveTop[0].key;

  /* --- attraction --- */
  const onsetTop = topChannels(profiles.onset, PROFILES.onset.channels, 2)
    .filter((c) => c.value > 0);
  const killTop = topChannels(profiles.kill, PROFILES.kill.channels, 2)
    .filter((c) => c.value > 0);
  const triggerTop = topChannels(profiles.trigger, PROFILES.trigger.channels, 2)
    .filter((c) => c.value > 0);

  return {
    complete: unanswered.length === 0,
    answered,
    unanswered,
    intake,

    axes,
    axisEvidence,
    axisBands: Object.fromEntries(BIPOLAR_KEYS.map((k) => [k, axisBand(axes[k])])),

    profiles,
    profileEvidence,

    archetype: {
      scores: arcTotal,
      public: arcPublic,
      private: arcPrivate,
      evidence: arcEvidence,
      ranked,
      primary,
      hidden,
      confidence: archetypeConfidence,
      leadMargin: round(leadMargin)
    },

    stated: {
      scores: statedRaw,
      top: statedHasSignal ? statedTop : null,
      divergent
    },

    shadow,
    strategies: { raw: strategyRaw, evidence: strategyEvidence },

    summary: {
      conflictTop,
      repairTop,
      giveTop,
      receiveTop,
      reassureTop,
      giveReceiveSplit,
      onsetTop,
      killTop,
      triggerTop
    },

    flags
  };
}

/* ------------------------------------------------------------------ */
/* SHADOW RESOLUTION                                                   */
/* ------------------------------------------------------------------ */

/**
 * The shadow is chosen from the client's protective-strategy signature, not
 * from their archetype. A shadow is only asserted when at least two distinct
 * questions contributed to the strategies that selected it; otherwise the
 * engine falls back to the primary archetype's native shadow and says so.
 */
function resolveShadow(strategyRaw, strategyEvidence, primary) {
  const total = Object.values(strategyRaw).reduce((a, b) => a + b, 0);

  if (!total) {
    const key = nativeShadowFor(primary);
    return { key, confidence: 'inferred', evidence: 0,
      basis: 'No protective-strategy evidence; defaulted to the archetype’s native shadow.' };
  }

  const scores = {};
  for (const key of SHADOW_KEYS) {
    const vec = SHADOWS[key].vector;
    const vecTotal = Object.values(vec).reduce((a, b) => a + b, 0) || 1;
    let dot = 0;
    for (const [s, w] of Object.entries(vec)) {
      dot += (strategyRaw[s] ?? 0) * w;
    }
    // Normalised so a shadow with a large vector does not win automatically.
    scores[key] = round((dot / (vecTotal * total)) * 100);
  }

  const winner = argmax(scores, SHADOW_KEYS);
  const contributing = Object.keys(SHADOWS[winner].vector)
    .filter((s) => (strategyRaw[s] ?? 0) > 0);
  const evidence = contributing
    .reduce((sum, s) => sum + (strategyEvidence[s] ?? 0), 0);

  if (evidence < 2) {
    const key = nativeShadowFor(primary);
    return { key, scores, confidence: 'inferred', evidence,
      basis: 'Protective-strategy evidence was thin, so the archetype’s native shadow is shown instead.' };
  }

  const r = rank(scores, SHADOW_KEYS);
  const margin = r.length > 1 ? r[0].value - r[1].value : 100;

  return {
    key: winner,
    scores,
    evidence,
    confidence: margin >= 6 ? 'strong' : 'moderate',
    basis: `Selected from ${evidence} protective-strategy responses across the assessment.`
  };
}

function nativeShadowFor(archetypeKey) {
  return SHADOW_KEYS.find((k) => SHADOWS[k].native === archetypeKey) || 'fortress';
}

/* ------------------------------------------------------------------ */
/* CONFIDENCE LANGUAGE                                                 */
/* ------------------------------------------------------------------ */

/**
 * Report writers use this so no claim is ever stronger than its evidence.
 * This is what keeps the product out of diagnostic territory.
 */
export function hedge(evidence, kind = 'bipolar') {
  const threshold = MIN_EVIDENCE[kind] ?? 3;
  if (evidence >= threshold + 2) return 'Consistently across the assessment, ';
  if (evidence >= threshold) return 'Across several scenarios, ';
  if (evidence >= 1) return 'On the limited evidence available, ';
  return 'This was not directly tested, but ';
}

/** True when an axis is pronounced enough to build a sentence on. */
export function isPronounced(profile, axis) {
  return (
    Math.abs(profile.axes[axis]) >= STRONG_AXIS &&
    profile.axisEvidence[axis] >= MIN_EVIDENCE.bipolar
  );
}

/** True when an axis is genuinely mid-range and must be reported as such. */
export function isBalanced(profile, axis) {
  return Math.abs(profile.axes[axis]) < MILD_AXIS;
}

export { AXIS_MAX, ARCHETYPE_MAX, CONFLICT_STYLE_META, REPAIR_META, ARCHETYPES };
