/**
 * dimensions.js
 * The hidden measurement model behind The Revolution Profile.
 *
 * Nothing in this file is ever shown to a client. Dimension keys are the
 * shared vocabulary for questions.js, scoring.js, the two report writers and
 * the compatibility engine.
 *
 * Two kinds of dimension:
 *
 *   BIPOLAR  - an axis with a meaningful negative and positive pole.
 *              Raw contributions accumulate, then normalise to -100..+100.
 *              Neither pole is "healthy". They are matching coordinates.
 *
 *   PROFILE  - a named set of competing channels (love languages, conflict
 *              styles, repair needs). Contributions accumulate per channel,
 *              then normalise to shares of the whole.
 */

/* ------------------------------------------------------------------ */
/* BIPOLAR AXES                                                        */
/* ------------------------------------------------------------------ */

export const BIPOLAR = {
  closeness: {
    label: 'Closeness orientation',
    negative: 'Autonomy-preserving',
    positive: 'Merge-preferring',
    note: 'How much shared life feels like oxygen versus pressure.'
  },
  pace: {
    label: 'Commitment pace',
    negative: 'Deliberate',
    positive: 'Decisive',
    note: 'Speed at which certainty is wanted, not speed of feeling.'
  },
  novelty: {
    label: 'Familiarity vs novelty',
    negative: 'Familiarity-sustained',
    positive: 'Novelty-sustained',
    note: 'What keeps attraction alive at the two-year mark.'
  },
  intensity: {
    label: 'Emotional register',
    negative: 'Even-keeled',
    positive: 'High-amplitude',
    note: 'Preferred voltage of the relationship, not volatility.'
  },
  pursuit: {
    label: 'Pursuit expectation',
    negative: 'Mutual initiation',
    positive: 'Wants to be pursued',
    note: 'Who is expected to carry momentum, especially early.'
  },
  directness: {
    label: 'Communication mode',
    negative: 'Attuned / implicit',
    positive: 'Explicit / stated',
    note: 'Whether needs are expected to be read or said.'
  },
  conflictEngage: {
    label: 'Conflict engagement',
    negative: 'Needs space first',
    positive: 'Needs resolution now',
    note: 'The single most operationally useful conflict axis.'
  },
  conflictHeat: {
    label: 'Conflict expression',
    negative: 'Contained',
    positive: 'Expressive',
    note: 'Volume and visibility of feeling during rupture.'
  },
  harmony: {
    label: 'Rupture tolerance',
    negative: 'Willing to rupture',
    positive: 'Harmony-protecting',
    note: 'Cost assigned to an unpleasant conversation.'
  },
  status: {
    label: 'Ambition and standing',
    negative: 'Status-indifferent',
    positive: 'Status-attentive',
    note: 'How much a partner’s standing figures into attraction.'
  },
  provider: {
    label: 'Financial dynamic',
    negative: 'Strictly egalitarian',
    positive: 'Provider-oriented',
    note: 'Preferred shape of financial asymmetry, in either direction.'
  },
  generosity: {
    label: 'Generosity register',
    negative: 'Measured',
    positive: 'Openhanded',
    note: 'Expectation of material and effortful giving, both ways.'
  },
  social: {
    label: 'Social architecture',
    negative: 'Private pair',
    positive: 'Shared social world',
    note: 'Whether the relationship wants an audience and a circle.'
  },
  family: {
    label: 'Family centrality',
    negative: 'Peripheral',
    positive: 'Central',
    note: 'Weight of family obligation in daily life.'
  },
  physical: {
    label: 'Physical chemistry priority',
    negative: 'Secondary',
    positive: 'Non-negotiable',
    note: 'How much erotic charge is load-bearing.'
  },
  rigidity: {
    label: 'Dealbreaker rigidity',
    negative: 'Permeable',
    positive: 'Fixed',
    note: 'Whether stated requirements survive contact with a real person.'
  },
  admiration: {
    label: 'Need to be admired',
    negative: 'Low salience',
    positive: 'Load-bearing',
    note: 'Respect and regard as an emotional supply.'
  },
  beingSeen: {
    label: 'Need to be known',
    negative: 'Low salience',
    positive: 'Load-bearing',
    note: 'Being accurately perceived as an emotional supply.'
  },
  security: {
    label: 'Need for predictability',
    negative: 'Comfortable with open questions',
    positive: 'Needs the ground to hold still',
    note: 'Tolerance for unresolved relational status.'
  },
  depth: {
    label: 'Psychological depth need',
    negative: 'Lightness preferred',
    positive: 'Depth required',
    note: 'Appetite for interior, unresolved, effortful intimacy.'
  },
  control: {
    label: 'Decisiveness expectation',
    negative: 'Emergent / improvised',
    positive: 'Planned / led',
    note: 'Desire for a partner who decides and arranges.'
  },
  autonomyThreat: {
    label: 'Sensitivity to partner autonomy',
    negative: 'Untroubled',
    positive: 'Activated',
    note: 'Internal response to a partner’s separate life.'
  },
  reassurance: {
    label: 'Reassurance requirement',
    negative: 'Self-settling',
    positive: 'Needs explicit signal',
    note: 'What it takes to close an open loop of doubt.'
  }
};

export const BIPOLAR_KEYS = Object.keys(BIPOLAR);

/* ------------------------------------------------------------------ */
/* PROFILE SETS                                                        */
/* ------------------------------------------------------------------ */

export const LOVE_CHANNELS = ['acts', 'time', 'words', 'touch', 'gifts'];

export const LOVE_CHANNEL_LABEL = {
  acts: 'Acts of service',
  time: 'Undivided time',
  words: 'Words of affirmation',
  touch: 'Physical closeness',
  gifts: 'Thoughtful gestures'
};

/** Narrative phrasing, so reports never read like a checklist. */
export const LOVE_CHANNEL_PHRASE = {
  receive: {
    acts: 'having something handled before it had to be asked for',
    time: 'unhurried, undivided attention',
    words: 'hearing it said out loud, in specific language',
    touch: 'physical closeness that asks for nothing in return',
    gifts: 'evidence of having been thought about while absent'
  },
  give: {
    acts: 'quietly lifting the load out of their week without announcing it',
    time: 'clearing the calendar and simply being present',
    words: 'saying out loud precisely what is admirable in someone',
    touch: 'closing the physical distance',
    gifts: 'finding the exact thing that will land'
  },
  reassure: {
    acts: 'a practical act that proves the ground is still there',
    time: 'protected hours with no agenda',
    words: 'being told plainly where things stand',
    touch: 'being physically held onto',
    gifts: 'a gesture that shows deliberate thought'
  }
};

export const CONFLICT_STYLES = [
  'pursuer',
  'processor',
  'peacemaker',
  'defender',
  'withdrawer',
  'fixer',
  'immediateResolver'
];

/**
 * `short`  - third person, for the matchmaker report ("The Processor: needs to...")
 * `short2` - second person, for the client report ("you are The Processor - you need to...")
 * Both forms exist because the same style is described to two different
 * audiences in two different grammatical persons.
 */
export const CONFLICT_STYLE_META = {
  pursuer: {
    label: 'The Pursuer',
    short: 'moves toward the disconnection',
    short2: 'move toward the disconnection rather than away from it',
    body: 'When distance opens, you close it. Silence reads as danger, so you follow the conversation rather than let it sit. Handled well, this is what keeps a relationship from quietly drifting apart.',
    body3: 'When distance opens, they close it. Silence reads as danger, so they follow the conversation rather than let it sit. Handled well, this is what keeps a relationship from quietly drifting apart.'
  },
  processor: {
    label: 'The Processor',
    short: 'needs to think before speaking',
    short2: 'need to think before you speak',
    body: 'You do not want to say the wrong version of a true thing. You need to turn it over privately first, then return with something accurate. The delay is precision, not avoidance.',
    body3: 'They do not want to say the wrong version of a true thing. They need to turn it over privately first, then return with something accurate. The delay is precision, not avoidance.'
  },
  peacemaker: {
    label: 'The Peacemaker',
    short: 'protects the temperature of the room',
    short2: 'protect the temperature of the room',
    body: 'You de-escalate instinctively, often with warmth or humour, and you would rather let a charge dissipate than force it into words. The gift is that little becomes permanent damage.',
    body3: 'They de-escalate instinctively, often with warmth or humour, and would rather let a charge dissipate than force it into words. The gift is that little becomes permanent damage.'
  },
  defender: {
    label: 'The Defender',
    short: 'protects the record',
    short2: 'protect the record',
    body: 'When you feel mischaracterised, accuracy becomes urgent. You will argue the specifics because being misunderstood is the actual injury. Underneath the position is usually a request to be seen correctly.',
    body3: 'When they feel mischaracterised, accuracy becomes urgent. They will argue the specifics because being misunderstood is the actual injury. Underneath the position is usually a request to be seen correctly.'
  },
  withdrawer: {
    label: 'The Withdrawer',
    short: 'goes quiet to stay regulated',
    short2: 'go quiet in order to stay regulated',
    body: 'You step back to keep yourself from escalating. Distance is a form of care in your system, though it is frequently read as punishment by people who are wired to pursue.',
    body3: 'They step back to keep themselves from escalating. Distance is a form of care in their system, though it is frequently read as punishment by people who are wired to pursue.'
  },
  fixer: {
    label: 'The Fixer',
    short: 'solves before feeling',
    short2: 'solve the problem before you feel it',
    body: 'You move toward the practical remedy. It is a genuine form of love and it is also how you avoid sitting inside an unresolved feeling for very long.',
    body3: 'They move toward the practical remedy. It is a genuine form of love and it is also how they avoid sitting inside an unresolved feeling for very long.'
  },
  immediateResolver: {
    label: 'The Immediate Resolver',
    short: 'cannot carry it overnight',
    short2: 'cannot comfortably carry it overnight',
    body: 'An open rupture costs you sleep. You would rather have the conversation badly tonight than correctly next week, because the unfinished state is worse to you than the conflict itself.',
    body3: 'An open rupture costs them sleep. They would rather have the conversation badly tonight than correctly next week, because the unfinished state is worse to them than the conflict itself.'
  }
};

export const REPAIR_CHANNELS = [
  'accountability',
  'action',
  'affection',
  'discussion',
  'space',
  'reassurance'
];

export const REPAIR_META = {
  accountability: {
    label: 'Named accountability',
    phrase: 'hearing the specific thing named out loud, without softening'
  },
  action: {
    label: 'Changed behaviour',
    phrase: 'seeing something actually different the following week'
  },
  affection: {
    label: 'Physical reconnection',
    phrase: 'being reached for before anything is said'
  },
  discussion: {
    label: 'Full conversation',
    phrase: 'an unhurried talk where both people genuinely understand it'
  },
  space: {
    label: 'Decompression first',
    phrase: 'room to settle before anything is resolved'
  },
  reassurance: {
    label: 'Reassurance first',
    phrase: 'knowing the relationship itself is not in question'
  }
};

/** Attraction onset - what makes the first pull happen. */
export const ATTRACTION_ONSET = [
  'competence',
  'recognition',
  'attentiveness',
  'magnetism'
];

export const ONSET_META = {
  competence: {
    label: 'Demonstrated substance',
    phrase: 'watching someone be genuinely good at something, or hold a position without flinching'
  },
  recognition: {
    label: 'Being accurately seen',
    phrase: 'the moment someone notices what other people miss'
  },
  attentiveness: {
    label: 'Evidence of thought',
    phrase: 'proof of having been listened to, and then acted upon'
  },
  magnetism: {
    label: 'Unexplained charge',
    phrase: 'the wordless, physical registration that something is happening'
  }
};

/** What ends interest. Used heavily in the matchmaker report. */
export const ATTRACTION_KILL = [
  'predictability',
  'deference',
  'invisibility',
  'noSpark',
  'inconsistency',
  'disrespect'
];

export const KILL_META = {
  predictability: 'the week becomes scriptable',
  deference: 'a partner stops holding their own position',
  invisibility: 'warmth arrives without any real curiosity about the interior life underneath it',
  noSpark: 'physical charge that never arrives or quietly leaves',
  inconsistency: 'effort that arrives unevenly',
  disrespect: 'being handled as though the thinking had not already been done'
};

/** Conflict triggers - the specific provocations. */
export const TRIGGERS = ['disrespect', 'exclusion', 'withdrawal', 'notBeingKnown'];

export const TRIGGER_META = {
  disrespect: {
    label: 'Condescension',
    phrase: 'being spoken to as though the thinking had not already been done'
  },
  exclusion: {
    label: 'Being routed around',
    phrase: 'discovering something was decided or handled without being consulted'
  },
  withdrawal: {
    label: 'Emotional flatness',
    phrase: 'a partner going blank or absent mid-conversation'
  },
  notBeingKnown: {
    label: 'Repetition of a known need',
    phrase: 'having to explain the same need for the third time'
  }
};

/* ------------------------------------------------------------------ */
/* PROFILE REGISTRY                                                    */
/* ------------------------------------------------------------------ */

/**
 * Every profile set the engine tracks. `split: true` means the set is scored
 * twice, once from answers that reveal public presentation and once from
 * answers that reveal private need - this is what powers the hidden archetype.
 */
export const PROFILES = {
  give: { channels: LOVE_CHANNELS },
  receive: { channels: LOVE_CHANNELS },
  reassure: { channels: LOVE_CHANNELS },
  conflict: { channels: CONFLICT_STYLES },
  repair: { channels: REPAIR_CHANNELS },
  onset: { channels: ATTRACTION_ONSET },
  kill: { channels: ATTRACTION_KILL },
  trigger: { channels: TRIGGERS }
};

export const PROFILE_KEYS = Object.keys(PROFILES);

/* ------------------------------------------------------------------ */
/* EVIDENCE THRESHOLDS                                                 */
/* ------------------------------------------------------------------ */

/**
 * The engine refuses to make a strong claim on thin evidence. A dimension
 * needs contributions from at least MIN_EVIDENCE distinct questions before
 * any report is allowed to state it confidently.
 */
export const MIN_EVIDENCE = {
  bipolar: 3,
  archetype: 3,
  profile: 2
};

/** Normalised magnitude above which a bipolar axis is called "pronounced". */
export const STRONG_AXIS = 45;
/** Below this, the axis is genuinely mid-range and must be reported as such. */
export const MILD_AXIS = 18;
