/**
 * compatibility.js
 * The Best-Fit Key and the private Match Key.
 *
 * Principles enforced here:
 *  - Archetypes do NOT decide a match. Real dimensions do. Archetype affinity
 *    contributes a small amount of flavour and translation guidance only.
 *  - Differences in conflict style or love language never, on their own,
 *    produce an incompatible verdict. They produce a translation.
 *  - Genuine conflicts of direction - children, money, pace, physical
 *    priority, rigidity - are the only things that force Matchmaker
 *    Discretion, because no amount of chemistry resolves them.
 *  - Astrology and numerology can add colour. They cannot move the key.
 */

import { hardFilters } from './intake.js';
import { ARCHETYPE_AFFINITY, ARCHETYPES, SHADOWS } from './archetypes.js';
import {
  LOVE_CHANNEL_LABEL, LOVE_CHANNEL_PHRASE, CONFLICT_STYLE_META,
  REPAIR_META, PROFILES
} from './dimensions.js';

/* ------------------------------------------------------------------ */
/* AXIS COMPARISON POLICY                                              */
/* ------------------------------------------------------------------ */

/**
 * mode:
 *   'align'      closeness of the two values matters; divergence is friction
 *   'complement' difference is workable and sometimes an asset
 *   'sum'        both being extreme in the SAME direction is the risk
 * weight: contribution to the overall alignment score
 * hard: a large gap here is a real-world conflict, not a style difference
 */
const AXIS_POLICY = {
  // Real-world direction. Gaps here are genuine.
  family:      { mode: 'align', weight: 3.0, hard: true },
  provider:    { mode: 'align', weight: 2.0, hard: true },
  pace:        { mode: 'align', weight: 2.0, hard: true },
  physical:    { mode: 'align', weight: 2.2, hard: true },
  rigidity:    { mode: 'align', weight: 1.4, hard: false },
  social:      { mode: 'align', weight: 1.8, hard: true },
  status:      { mode: 'align', weight: 1.4, hard: false },
  generosity:  { mode: 'align', weight: 1.2, hard: false },
  novelty:     { mode: 'align', weight: 1.8, hard: false },
  security:    { mode: 'align', weight: 1.6, hard: false },
  closeness:   { mode: 'align', weight: 2.4, hard: true },

  // Needs. Misalignment is painful but translatable.
  reassurance: { mode: 'align', weight: 1.8, hard: false },
  beingSeen:   { mode: 'align', weight: 1.0, hard: false },
  admiration:  { mode: 'align', weight: 1.0, hard: false },
  depth:       { mode: 'align', weight: 1.6, hard: false },
  intensity:   { mode: 'align', weight: 1.6, hard: false },

  // Style. Difference is frequently an asset.
  conflictEngage: { mode: 'complement', weight: 2.0, hard: false },
  conflictHeat:   { mode: 'complement', weight: 1.0, hard: false },
  harmony:        { mode: 'complement', weight: 0.8, hard: false },
  directness:     { mode: 'complement', weight: 1.2, hard: false },
  control:        { mode: 'complement', weight: 1.0, hard: false },
  pursuit:        { mode: 'sum',        weight: 1.6, hard: false },
  autonomyThreat: { mode: 'align',      weight: 1.2, hard: false }
};

const GAP_MAJOR = 70;   // a genuine conflict of direction
const GAP_NOTABLE = 45; // worth a conversation

/* ------------------------------------------------------------------ */
/* CORE COMPARISON                                                     */
/* ------------------------------------------------------------------ */

function compareAxes(a, b) {
  const rows = [];
  let weighted = 0;
  let weightTotal = 0;
  const majorGaps = [];
  const notableGaps = [];

  for (const [axis, policy] of Object.entries(AXIS_POLICY)) {
    const va = a.axes[axis] ?? 0;
    const vb = b.axes[axis] ?? 0;
    const gap = Math.abs(va - vb);
    let alignment;

    if (policy.mode === 'align') {
      alignment = 100 - (gap / 200) * 100;
    } else if (policy.mode === 'complement') {
      // A moderate difference scores best; identical extremes score slightly
      // lower, because two withdrawers or two pursuers amplify each other.
      const ideal = 40;
      alignment = 100 - (Math.abs(gap - ideal) / 160) * 100;
    } else {
      // 'sum': both wanting to be pursued is the structural problem.
      const both = (va + vb) / 2;
      alignment = both > 35 ? 100 - (both - 35) * 1.4 : 100 - gap / 3;
    }
    alignment = Math.max(0, Math.min(100, alignment));

    weighted += alignment * policy.weight;
    weightTotal += policy.weight;

    const evidenceOK =
      (a.axisEvidence[axis] ?? 0) >= 3 && (b.axisEvidence[axis] ?? 0) >= 3;

    if (gap >= GAP_MAJOR && policy.hard && evidenceOK) {
      majorGaps.push({ axis, va, vb, gap });
    } else if (gap >= GAP_NOTABLE && evidenceOK) {
      notableGaps.push({ axis, va, vb, gap });
    }

    rows.push({ axis, va, vb, gap, alignment: Math.round(alignment), ...policy });
  }

  return {
    rows,
    alignment: Math.round(weighted / weightTotal),
    majorGaps,
    notableGaps
  };
}

/** Chemistry potential, independent of long-term alignment. */
function chemistryScore(a, b) {
  const aPhys = a.axes.physical ?? 0;
  const bPhys = b.axes.physical ?? 0;
  const aInt = a.axes.intensity ?? 0;
  const bInt = b.axes.intensity ?? 0;

  const sharedAppetite = 100 - Math.abs(aPhys - bPhys) / 2;
  const sharedVoltage = 100 - Math.abs(aInt - bInt) / 2;
  const level = (aPhys + bPhys + aInt + bInt) / 4;

  // Onset overlap: do the same things start attraction for both?
  const onsetOverlap = PROFILES.onset.channels.reduce((sum, c) => {
    return sum + Math.min(a.profiles.onset[c] ?? 0, b.profiles.onset[c] ?? 0);
  }, 0);

  return Math.round(
    Math.max(0, Math.min(100,
      sharedAppetite * 0.3 + sharedVoltage * 0.25 + (level + 100) / 2 * 0.25 + onsetOverlap * 0.2
    ))
  );
}

/** Love-language translation in both directions. */
function loveTranslation(a, b) {
  const out = [];
  for (const [from, to, fromName, toName] of [
    [a, b, 'A', 'B'],
    [b, a, 'B', 'A']
  ]) {
    const gives = from.summary.giveTop[0];
    const wants = to.summary.receiveTop[0];
    if (!gives || !wants) continue;

    const matched = gives.key === wants.key;
    out.push({
      direction: `${fromName} to ${toName}`,
      gives: gives.key,
      wanted: wants.key,
      matched,
      note: matched
        ? `The way ${fromName} naturally gives love - ${LOVE_CHANNEL_PHRASE.give[gives.key]} - is exactly what ${toName} registers as being loved. This requires no translation at all.`
        : `${fromName} gives love primarily through ${LOVE_CHANNEL_LABEL[gives.key].toLowerCase()}, and ${toName} registers love primarily through ${LOVE_CHANNEL_LABEL[wants.key].toLowerCase()}. ${fromName} will be putting real effort into something ${toName} does not fully receive. This is highly workable once named, and quietly corrosive if it is not.`
    });
  }
  return out;
}

/** Conflict and repair interaction. Difference is never a verdict. */
function conflictTranslation(a, b) {
  const aStyle = a.summary.conflictTop[0]?.key;
  const bStyle = b.summary.conflictTop[0]?.key;
  const aEng = a.axes.conflictEngage ?? 0;
  const bEng = b.axes.conflictEngage ?? 0;

  let dynamic;
  if (aEng > 25 && bEng < -25) dynamic = 'pursue-withdraw';
  else if (bEng > 25 && aEng < -25) dynamic = 'withdraw-pursue';
  else if (aEng > 25 && bEng > 25) dynamic = 'both-engage';
  else if (aEng < -25 && bEng < -25) dynamic = 'both-withdraw';
  else dynamic = 'moderate';

  const DYNAMIC_NOTE = {
    'pursue-withdraw':
      'One of them closes distance during conflict and the other opens it. This is the single most common pattern in long relationships and it is entirely workable, but only if both understand that the pursuit is not an attack and the distance is not a punishment. Left unexplained, each behaviour confirms the other’s worst reading.',
    'withdraw-pursue':
      'One of them closes distance during conflict and the other opens it. This is the single most common pattern in long relationships and it is entirely workable, but only if both understand that the pursuit is not an attack and the distance is not a punishment. Left unexplained, each behaviour confirms the other’s worst reading.',
    'both-engage':
      'Both move toward conflict rather than away from it. Nothing will go unsaid, which is a genuine advantage, and arguments will escalate quickly before they resolve. This pairing works well when both are direct and badly when either keeps score.',
    'both-withdraw':
      'Both need room before they can speak. Very little will be said in anger, which is comfortable, and genuine issues can go unaddressed for months. This pairing benefits from an agreed re-entry point rather than waiting for one of them to raise it.',
    moderate:
      'Neither is at an extreme on conflict engagement, which means disagreements are unlikely to take a fixed and damaging shape. This is one of the easier profiles to pair.'
  };

  // Repair compatibility: does each person's top repair need exist in the
  // other's natural giving repertoire?
  const repairRows = [];
  for (const [from, to, fromName, toName] of [
    [a, b, 'A', 'B'],
    [b, a, 'B', 'A']
  ]) {
    const need = to.summary.repairTop[0];
    if (!need) continue;
    const canGive =
      need.key === 'space' ? (from.axes.conflictEngage ?? 0) < 20 :
      need.key === 'discussion' ? (from.axes.directness ?? 0) > -30 :
      need.key === 'action' ? (from.profiles.give.acts ?? 0) >= 15 :
      need.key === 'affection' ? (from.profiles.give.touch ?? 0) >= 15 :
      need.key === 'accountability' ? (from.axes.directness ?? 0) > -20 :
      (from.axes.reassurance ?? 0) > -40;

    repairRows.push({
      direction: `${toName} needs, ${fromName} provides`,
      need: need.key,
      natural: canGive,
      note: canGive
        ? `${toName} needs ${REPAIR_META[need.key].phrase}. This sits within what ${fromName} does naturally.`
        : `${toName} needs ${REPAIR_META[need.key].phrase}, and this does not come naturally to ${fromName}. It is a learnable behaviour rather than a mismatch, but it should be said out loud early.`
    });
  }

  return {
    dynamic,
    note: DYNAMIC_NOTE[dynamic],
    aStyle: aStyle ? CONFLICT_STYLE_META[aStyle] : null,
    bStyle: bStyle ? CONFLICT_STYLE_META[bStyle] : null,
    repairRows
  };
}

/* ------------------------------------------------------------------ */
/* THE KEY                                                             */
/* ------------------------------------------------------------------ */

export const KEYS = {
  gold: {
    name: 'GOLD KEY',
    subtitle: 'Natural Fit',
    body: 'Their relationship needs reinforce one another. What each of them does instinctively is close to what the other one needs.'
  },
  silver: {
    name: 'SILVER KEY',
    subtitle: 'Complementary Fit',
    body: 'Different styles that balance well. The differences here are the kind that make a relationship more capable rather than more difficult, provided both know what they are looking at.'
  },
  fire: {
    name: 'FIRE KEY',
    subtitle: 'High Chemistry, More Translation',
    body: 'Significant attraction potential with real areas requiring awareness. The pull is likely to be immediate. The work is in the places where their instincts do not match.'
  },
  growth: {
    name: 'GROWTH KEY',
    subtitle: 'Transformational Fit',
    body: 'This pairing sits outside at least one familiar pattern, and it meets deeper needs that the familiar pattern has not been meeting. It asks something of both of them.'
  },
  complex: {
    name: 'COMPLEX FIT',
    subtitle: 'Matchmaker Discretion',
    body: 'There are important differences here that should be investigated in conversation before any introduction is made. This is not a refusal. It is a request for more information.'
  }
};

/**
 * Determine the key. Deterministic, ordered, and explainable - every branch
 * records WHY it fired so the matchmaker can see the reasoning.
 */
function determineKey({ alignment, chemistry, majorGaps, notableGaps, hardBlock, growthSignal }) {
  const reasons = [];

  if (hardBlock.length) {
    reasons.push(...hardBlock);
    return { key: 'complex', reasons };
  }

  if (majorGaps.length >= 2) {
    reasons.push(
      `Two or more real-world differences reach a level that rarely resolves on its own: ${majorGaps.map((g) => g.axis).join(', ')}.`
    );
    return { key: 'complex', reasons };
  }

  if (alignment >= 74 && majorGaps.length === 0) {
    reasons.push(`Dimensional alignment of ${alignment} with no major real-world gaps.`);
    return { key: 'gold', reasons };
  }

  if (chemistry >= 72 && alignment < 64) {
    reasons.push(
      `Chemistry indicators are high (${chemistry}) while structural alignment is moderate (${alignment}).`
    );
    return { key: 'fire', reasons };
  }

  if (alignment >= 63 && majorGaps.length <= 1) {
    reasons.push(
      `Solid alignment (${alignment}) with differences that fall in complementary rather than conflicting territory.`
    );
    if (notableGaps.length) {
      reasons.push(`Worth a conversation: ${notableGaps.map((g) => g.axis).join(', ')}.`);
    }
    return { key: 'silver', reasons };
  }

  if (growthSignal && alignment >= 52) {
    reasons.push(
      `Alignment is moderate (${alignment}), and this pairing sits outside at least one habitual pattern while meeting a need that pattern has not met.`
    );
    return { key: 'growth', reasons };
  }

  reasons.push(
    `Alignment of ${alignment} with ${majorGaps.length} major and ${notableGaps.length} notable differences. Not a refusal - a request for a conversation first.`
  );
  return { key: 'complex', reasons };
}

/**
 * Growth signal: this person would be outside the other's usual type, and
 * would meet a need their usual type has been failing to meet.
 */
function detectGrowth(a, b) {
  const signals = [];
  // A says they want one thing but functions best with another, and B is
  // closer to the second than the first.
  if (a.stated.divergent) signals.push('A’s stated preference and demonstrated need already diverge.');
  if (b.stated.divergent) signals.push('B’s stated preference and demonstrated need already diverge.');

  // One needs reassurance and the other is unusually steady.
  if ((a.axes.reassurance ?? 0) > 35 && (b.axes.security ?? 0) > 25) {
    signals.push('B’s steadiness directly addresses A’s reassurance requirement.');
  }
  if ((b.axes.reassurance ?? 0) > 35 && (a.axes.security ?? 0) > 25) {
    signals.push('A’s steadiness directly addresses B’s reassurance requirement.');
  }
  return signals;
}

/* ------------------------------------------------------------------ */
/* PUBLIC API                                                          */
/* ------------------------------------------------------------------ */

/**
 * The client-safe Best-Fit Key.
 * @param {object} a scored profile
 * @param {object} b scored profile
 */
export function bestFitKey(a, b) {
  const filters = hardFilters(a.intake || {}, b.intake || {});
  const axes = compareAxes(a, b);
  const chemistry = chemistryScore(a, b);
  const growth = detectGrowth(a, b);

  const { key, reasons } = determineKey({
    alignment: axes.alignment,
    chemistry,
    majorGaps: axes.majorGaps,
    notableGaps: axes.notableGaps,
    hardBlock: filters.blocks,
    growthSignal: growth.length > 0
  });

  const affinity =
    ARCHETYPE_AFFINITY[a.archetype.primary]?.[b.archetype.primary] ?? 1;

  return {
    key,
    ...KEYS[key],
    alignment: axes.alignment,
    chemistry,
    reasons,
    archetypeAffinity: affinity,
    majorGaps: axes.majorGaps,
    notableGaps: axes.notableGaps,
    axisRows: axes.rows
  };
}

/**
 * THE MATCH KEY - private, for the matchmaker only.
 * Everything the matchmaker needs to decide whether to introduce these two,
 * and precisely how to do it.
 */
export function matchKey(a, b, opts = {}) {
  const fit = bestFitKey(a, b);
  const love = loveTranslation(a, b);
  const conflict = conflictTranslation(a, b);
  const aName = opts.aName || a.intake?.preferredName || 'Client A';
  const bName = opts.bName || b.intake?.preferredName || 'Client B';

  const nameOf = (tag) => (tag === 'A' ? aName : bName);
  const personalise = (s) => s.replace(/\bA\b/g, aName).replace(/\bB\b/g, bName);

  /* --- why this could work --- */
  const whyWork = [];
  const strong = fit.axisRows
    .filter((r) => r.alignment >= 80 && r.mode === 'align')
    .sort((x, y) => y.weight - x.weight)
    .slice(0, 4);
  for (const r of strong) {
    whyWork.push(AXIS_WHY[r.axis]?.(aName, bName, r) || `${r.axis} is closely aligned.`);
  }
  if (fit.archetypeAffinity === 2) {
    whyWork.push(
      `${ARCHETYPES[a.archetype.primary].name} and ${ARCHETYPES[b.archetype.primary].name} tend to read each other intuitively, which usually shows up as an easy first conversation.`
    );
  }
  if (!whyWork.length) {
    whyWork.push('The alignment here is moderate rather than obvious. Read the sections below before deciding.');
  }

  /* --- where they naturally understand each other --- */
  const natural = fit.axisRows
    .filter((r) => r.alignment >= 85)
    .map((r) => AXIS_LABEL[r.axis] || r.axis);

  /* --- where they may misread each other --- */
  const misread = [];
  for (const g of [...fit.majorGaps, ...fit.notableGaps]) {
    const note = AXIS_MISREAD[g.axis];
    if (note) misread.push(note(aName, bName, g));
  }
  for (const t of love) {
    if (!t.matched) misread.push(personalise(t.note));
  }
  if (conflict.dynamic !== 'moderate') misread.push(conflict.note);

  /* --- attraction dynamic --- */
  const aOnset = a.summary.onsetTop[0]?.key;
  const bOnset = b.summary.onsetTop[0]?.key;
  const attraction = {
    score: fit.chemistry,
    note:
      fit.chemistry >= 70
        ? 'Strong mutual chemistry indicators. Expect the initial pull to be immediate.'
        : fit.chemistry >= 50
          ? 'Moderate chemistry indicators. Attraction here is more likely to build over two or three meetings than to arrive at once.'
          : 'Chemistry indicators are modest. If everything else is aligned, this pairing benefits from a setting that allows conversation rather than a short first meeting.',
    aNeeds: aOnset,
    bNeeds: bOnset
  };

  /* --- how to introduce them --- */
  const intro = {
    toA: positioningFor(a, b, bName),
    toB: positioningFor(b, a, aName)
  };

  /* --- what the matchmaker should watch --- */
  const watch = [];
  if (fit.majorGaps.length) {
    watch.push(
      `Confirm in conversation before introducing: ${fit.majorGaps.map((g) => AXIS_LABEL[g.axis] || g.axis).join(', ')}.`
    );
  }
  if (conflict.dynamic === 'pursue-withdraw' || conflict.dynamic === 'withdraw-pursue') {
    watch.push(
      'If this progresses, the first real disagreement is the moment that decides it. One will follow, one will step back. Both should hear early that this is a difference in wiring rather than in commitment.'
    );
  }
  if (conflict.dynamic === 'both-withdraw') {
    watch.push(
      'Neither of them will raise a problem quickly. Check in after six to eight weeks rather than waiting to be told.'
    );
  }
  if (a.shadow.key === b.shadow.key) {
    watch.push(
      `Both carry ${SHADOWS[a.shadow.key].name} as their romantic shadow. Under strain they will make the same protective move at the same time, and neither will be the one to reach first.`
    );
  }
  for (const t of love) if (!t.matched) {
    watch.push(personalise(`${t.direction.split(' ')[0]} will be working hard in a currency ${t.direction.split(' ')[2]} does not fully register. Worth naming to both of them early.`));
  }
  if (!watch.length) watch.push('No specific structural risks flagged. Proceed on the usual cadence.');

  return {
    aName,
    bName,
    fit,
    whyWork,
    natural,
    misread: misread.length ? misread : ['No significant misreading risks identified from the assessment data.'],
    loveTranslation: love.map((t) => ({ ...t, note: personalise(t.note) })),
    conflictTranslation: {
      ...conflict,
      note: conflict.note,
      repairRows: conflict.repairRows.map((r) => ({ ...r, note: personalise(r.note) }))
    },
    attraction,
    lifestyle: lifestyleAlignment(a, b, aName, bName),
    longTerm: longTermAlignment(a, b, aName, bName),
    aShouldUnderstand: understandNote(b, a, bName, aName),
    bShouldUnderstand: understandNote(a, b, aName, bName),
    watch,
    intro
  };
}

/* ------------------------------------------------------------------ */
/* NARRATIVE HELPERS                                                   */
/* ------------------------------------------------------------------ */

const AXIS_LABEL = {
  family: 'family centrality', provider: 'financial dynamic', pace: 'commitment pace',
  physical: 'physical chemistry priority', rigidity: 'flexibility on requirements',
  social: 'social architecture', status: 'ambition and standing',
  generosity: 'generosity register', novelty: 'need for novelty',
  security: 'need for predictability', closeness: 'closeness versus autonomy',
  reassurance: 'reassurance requirement', beingSeen: 'need to be known',
  admiration: 'need to be admired', depth: 'psychological depth',
  intensity: 'emotional register', conflictEngage: 'conflict engagement',
  conflictHeat: 'conflict expression', harmony: 'rupture tolerance',
  directness: 'communication mode', control: 'decisiveness expectation',
  pursuit: 'pursuit expectation', autonomyThreat: 'sensitivity to autonomy'
};

const AXIS_WHY = {
  family: (a, b) => `${a} and ${b} place family at a comparable level of centrality, which removes one of the most common quiet incompatibilities.`,
  closeness: (a, b) => `They want a similar amount of shared life. Neither is likely to experience the other as suffocating or as distant.`,
  pace: (a, b) => `They move toward commitment at a similar speed, so neither will feel rushed or strung along.`,
  physical: (a, b) => `Physical chemistry occupies a similar level of priority for both, which prevents a long and rarely-spoken mismatch.`,
  novelty: (a, b) => `They need a comparable balance of familiarity and novelty to stay interested.`,
  security: (a, b) => `Both need a similar amount of solid ground under a relationship.`,
  social: (a, b) => `They want the same kind of social life around the relationship.`,
  provider: (a, b) => `Their instincts about money and who provides what are closely matched.`,
  reassurance: (a, b) => `They need reassurance at a similar frequency, which prevents one reading the other as needy or cold.`,
  intensity: (a, b) => `They run at a similar emotional voltage.`,
  depth: (a, b) => `Both want the same depth of psychological intimacy.`,
  status: (a, b) => `Ambition and standing matter to them in similar measure.`,
  generosity: (a, b) => `Their expectations around generosity are well matched.`,
  admiration: (a, b) => `Both need a comparable amount of visible regard.`,
  beingSeen: (a, b) => `Both place similar weight on being accurately understood.`,
  autonomyThreat: (a, b) => `Neither is likely to be destabilised by the other having a separate life.`,
  rigidity: (a, b) => `They hold their requirements with similar firmness.`
};

const AXIS_MISREAD = {
  closeness: (a, b, g) =>
    `${g.va > g.vb ? a : b} wants noticeably more shared life than ${g.va > g.vb ? b : a} does. Without context, the first will read as clinging and the second as uninterested. Neither is accurate.`,
  reassurance: (a, b, g) =>
    `${g.va > g.vb ? a : b} needs explicit reassurance considerably more often. ${g.va > g.vb ? b : a} is likely to assume that a stable relationship speaks for itself.`,
  pace: (a, b, g) =>
    `${g.va > g.vb ? a : b} wants certainty faster. Expect one of them to be ready for exclusivity noticeably before the other.`,
  physical: (a, b, g) =>
    `Physical chemistry is load-bearing for ${g.va > g.vb ? a : b} and secondary for ${g.va > g.vb ? b : a}. This is the difference most likely to go unspoken for a year.`,
  family: (a, b, g) =>
    `Family occupies a very different place in their lives. This should be a direct conversation before an introduction, not after.`,
  provider: (a, b, g) =>
    `They have different instincts about money and provision. Worth establishing before a third date.`,
  social: (a, b, g) =>
    `${g.va > g.vb ? a : b} wants a shared social world; ${g.va > g.vb ? b : a} wants a more private pair. This surfaces around month three.`,
  novelty: (a, b, g) =>
    `${g.va > g.vb ? a : b} needs more novelty to stay engaged; ${g.va > g.vb ? b : a} is sustained by familiarity. Long-term, this is the axis to watch.`,
  directness: (a, b, g) =>
    `${g.va > g.vb ? a : b} says things plainly; ${g.va > g.vb ? b : a} communicates by implication. Each will occasionally find the other baffling.`,
  status: (a, b, g) =>
    `Ambition and standing matter unequally here, which can read as either pressure or complacency.`,
  intensity: (a, b, g) =>
    `They run at different emotional voltages. One may find the other overwhelming, or flat.`,
  security: (a, b, g) =>
    `They need different amounts of certainty to relax into something.`,
  autonomyThreat: (a, b, g) =>
    `One is considerably more sensitive to the other having a separate life.`
};

function lifestyleAlignment(a, b, aName, bName) {
  const rows = ['social', 'novelty', 'status', 'provider', 'generosity']
    .map((axis) => ({
      axis,
      label: AXIS_LABEL[axis],
      gap: Math.abs((a.axes[axis] ?? 0) - (b.axes[axis] ?? 0))
    }));
  const worst = rows.sort((x, y) => y.gap - x.gap)[0];
  return {
    rows,
    note: worst.gap >= GAP_NOTABLE
      ? `The widest practical difference is ${worst.label}. Everything else in the daily-life picture sits closer together.`
      : 'Their practical lives sit close together. No significant lifestyle friction is indicated.'
  };
}

function longTermAlignment(a, b, aName, bName) {
  const rows = ['family', 'pace', 'closeness', 'security', 'depth']
    .map((axis) => ({
      axis,
      label: AXIS_LABEL[axis],
      gap: Math.abs((a.axes[axis] ?? 0) - (b.axes[axis] ?? 0))
    }));
  const worst = rows.sort((x, y) => y.gap - x.gap)[0];

  const kidsA = a.intake?.wantsChildren;
  const kidsB = b.intake?.wantsChildren;
  const kidsNote =
    kidsA && kidsB && kidsA !== kidsB
      ? `Stated position on children differs: ${aName} selected "${kidsA}", ${bName} selected "${kidsB}". Confirm directly.`
      : null;

  return {
    rows,
    kidsNote,
    note: worst.gap >= GAP_NOTABLE
      ? `Long-term, the axis most likely to require real negotiation is ${worst.label}.`
      : 'Their long-term pictures are compatible on every axis the assessment measures.'
  };
}

function understandNote(about, forWhom, aboutName, forName) {
  const parts = [];
  const recv = about.summary.receiveTop[0];
  if (recv) {
    parts.push(
      `${aboutName} registers being loved through ${LOVE_CHANNEL_PHRASE.receive[recv.key]}. Other kinds of effort land, but not as deeply.`
    );
  }
  const rep = about.summary.repairTop[0];
  if (rep) {
    parts.push(
      `After a disagreement, what actually closes it for ${aboutName} is ${REPAIR_META[rep.key].phrase}.`
    );
  }
  const shadow = SHADOWS[about.shadow.key];
  if (shadow) {
    parts.push(
      `When ${aboutName} is hurt, the protective move is ${shadow.name}: ${shadow.tell} The unspoken request underneath it is, roughly, "${shadow.request}"`
    );
  }
  const kill = about.summary.killTop[0];
  if (kill) {
    parts.push(
      `The thing most likely to quietly end ${aboutName}'s interest is when ${KILL_PHRASE[kill.key]}.`
    );
  }
  return parts;
}

const KILL_PHRASE = {
  predictability: 'the relationship becomes fully scriptable',
  deference: 'a partner stops holding their own position',
  invisibility: 'warmth arrives without any real curiosity',
  noSpark: 'the physical charge never arrives or quietly leaves',
  inconsistency: 'effort arrives unevenly',
  disrespect: 'they are handled as though they had not thought it through'
};

/**
 * How to position one person to the other. This is the section that turns
 * "he is successful and enjoys boating" into something useful.
 */
function positioningFor(client, match, matchName) {
  const onset = client.summary.onsetTop[0]?.key;
  const recv = client.summary.receiveTop[0]?.key;
  const lines = [];

  const ONSET_FRAME = {
    competence: `${client.intake?.preferredName || 'This client'} responds to demonstrated substance rather than to titles. When you introduce ${matchName}, lead with something ${matchName} is genuinely excellent at and can hold a position on - not with a resume.`,
    recognition: `This client falls for being accurately seen. Lead with evidence that ${matchName} is perceptive and curious about people, and mention something specific ${matchName} noticed or asked about.`,
    attentiveness: `Decisiveness, thoughtful planning and consistent follow-through create more attraction for this client than professional status does. When introducing ${matchName}, emphasise that ${matchName} follows through, plans experiences, and deliberately makes time for a partner.`,
    magnetism: `Chemistry arrives physically and early for this client, or it does not arrive. Keep the introduction short on biography and make sure the first meeting is in person, unhurried, and somewhere with some atmosphere to it.`
  };
  if (onset) lines.push(ONSET_FRAME[onset]);

  const RECV_FRAME = {
    acts: `They register care as things handled. Any example of ${matchName} quietly taking something off someone's plate will land harder than a compliment.`,
    time: `They register care as undivided attention. Mention how ${matchName} protects time and is genuinely present when present.`,
    words: `They register care as things said out loud. Mention that ${matchName} is articulate and direct about what they feel.`,
    touch: `They register care physically. Ensure the first meeting has warmth and proximity to it rather than a formal table.`,
    gifts: `They register care as evidence of being thought about. Any example of ${matchName} noticing a detail and acting on it will land.`
  };
  if (recv) lines.push(RECV_FRAME[recv]);

  if (client.stated.divergent) {
    lines.push(
      `Note: this client's stated type and their demonstrated needs diverge. If they push back on ${matchName} on paper, the objection is likely to be about the stated type rather than about fit. Worth encouraging one meeting.`
    );
  }

  if ((client.axes.pursuit ?? 0) > 35) {
    lines.push(`This client expects to be pursued. ${matchName} should be the one who initiates the second meeting.`);
  }
  if ((client.axes.pace ?? 0) < -35) {
    lines.push('This client moves deliberately. Do not apply time pressure or ask for a verdict after one meeting.');
  }

  return lines;
}

/* ------------------------------------------------------------------ */
/* COMPARE FOR MATCH - the matchmaker-facing two-person summary.       */
/* Deliberately has no single compatibility percentage. The Best-Fit   */
/* Key name/subtitle is the only categorical label; everything else is */
/* narrative, so a human still makes the call.                         */
/* ------------------------------------------------------------------ */

/**
 * @param {object} a scored profile (from score())
 * @param {object} b scored profile (from score())
 * @param {object} opts { aName, bName }
 */
export function compareSummary(a, b, opts = {}) {
  const key = matchKey(a, b, opts);
  const dealbreakers = hardFilters(a.intake || {}, b.intake || {});
  const conflicts = [...dealbreakers.blocks];
  if (key.longTerm?.kidsNote) conflicts.push(key.longTerm.kidsNote);

  return {
    aName: key.aName,
    bName: key.bName,
    strongAlignment: [
      ...key.whyWork,
      ...(key.natural.length ? [`They will naturally read each other accurately on: ${key.natural.join(', ')}.`] : [])
    ],
    potentialFriction: key.misread,
    relationshipDynamic: {
      name: key.fit.name,
      subtitle: key.fit.subtitle,
      body: key.fit.body,
      reasons: key.fit.reasons
    },
    communicationFit: {
      loveLanguage: key.loveTranslation.map((t) => t.note),
      conflict: [key.conflictTranslation.note, ...key.conflictTranslation.repairRows.map((r) => r.note)]
    },
    lifestyleFit: [key.lifestyle?.note, key.longTerm?.note].filter(Boolean),
    attractionAffectionFit: [key.attraction.note, ...key.aShouldUnderstand, ...key.bShouldUnderstand].filter(Boolean),
    dealbreakerConflicts: conflicts.length ? conflicts : ['None identified from intake filters or stated long-term positions.'],
    questionsToExplore: key.watch,
    introductionGuidance: { toA: key.intro.toA, toB: key.intro.toB }
  };
}
