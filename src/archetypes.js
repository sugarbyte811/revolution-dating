/**
 * archetypes.js
 * The Revolution Profile archetype system, the hidden/secondary logic, and
 * the Romantic Shadow set.
 *
 * Design rules obeyed here:
 *  - Nine archetypes. None is better than another.
 *  - Each has a public face (how it presents) and a private engine (what it
 *    actually runs on). The split is what makes a hidden archetype possible.
 *  - Shadows are protective strategies, never pathologies. Each shadow is
 *    written as something that made sense at some point.
 */

export const ARCHETYPE_KEYS = [
  'sovereign',
  'muse',
  'devotee',
  'alchemist',
  'diplomat',
  'flame',
  'architect',
  'voyager',
  'oracle'
];

export const ARCHETYPES = {
  sovereign: {
    name: 'The Sovereign',
    line: 'Respect is the price of entry.',
    public:
      'You are selective in a way that reads, correctly, as self-possession. You are not difficult to impress because you are cold; you are difficult to impress because you have watched yourself settle before and did not enjoy the person it made you.',
    private:
      'Underneath the standards is a simple requirement: you need to be taken seriously by someone you also take seriously. Admiration is not vanity for you, it is the proof that you have not lowered anything.',
    falls:
      'You fall when someone holds their own ground with you. Not opposition for its own sake, but a person who can disagree without collapsing and without escalating.',
    stays:
      'You stay where you continue to respect the person across time, particularly in how they handle their own difficulties.',
    strain:
      'When the regard thins, you do not usually complain. You become more exacting, and the relationship acquires a quiet entrance exam nobody told the other person about.',
    bestBrought:
      'a partner with their own gravity, who gives admiration out loud and cannot be quietly managed'
  },

  muse: {
    name: 'The Muse',
    line: 'Be fascinated, and be specific about it.',
    public:
      'You are unusually alive to other people, and the effect is mutual: rooms reorganise slightly around you. You give attention generously and you are very good at it.',
    private:
      'What you actually need is rarer than attention. You need to be perceived accurately - the private, unflattering, interesting parts included - and to have that perception said out loud rather than merely felt.',
    falls:
      'You fall in the moment someone notices the thing nobody else noticed, and tells you they noticed it.',
    stays:
      'You stay where curiosity about you does not expire once you are known. Being loved is not the same as being still interesting to someone.',
    strain:
      'When you stop feeling seen, you tend to become more charming rather than more honest, which puts you further out of reach of the thing you wanted.',
    bestBrought:
      'a partner who is genuinely curious, articulate about what they notice, and unthreatened by someone who draws a room'
  },

  devotee: {
    name: 'The Devotee',
    line: 'Show up the same way, for years.',
    public:
      'You love steadily and without a great deal of theatre. People experience you as safe in a way that is quietly rare, and you tend to be the person others rely on.',
    private:
      'You need consistency more than intensity, and you need it demonstrated rather than promised. Your nervous system is running a long, quiet calculation about whether this person can be counted on.',
    falls:
      'You fall slowly, and usually through accumulation: someone was reliable, again, and again, and at some point you stopped bracing.',
    stays:
      'You stay where effort is even. Unevenness costs you more than almost anything else, including conflict.',
    strain:
      'When you feel taken for granted, you rarely withdraw immediately. You give more, and you begin keeping a private account nobody else knows is open.',
    bestBrought:
      'a partner who is consistent without being asked, and who notices the giving before it turns into a ledger'
  },

  alchemist: {
    name: 'The Alchemist',
    line: 'Change me, and let me change you.',
    public:
      'You do not want a pleasant relationship. You want a real one, and you are willing to go into difficult material to get it. People find you unusually honest, sometimes uncomfortably so.',
    private:
      'You need a partner who can survive depth without flinching or fleeing. Surface-level ease reads to you as absence, and you would rather be in something hard and true.',
    falls:
      'You fall for interiority - for the person with an unresolved room in them that they will actually let you into.',
    stays:
      'You stay where transformation keeps happening. You need to be becoming someone, together.',
    strain:
      'When you are not met at depth, you may intensify, excavate, or create a crisis to force contact. The undertow is strongest when it is trying to reach someone.',
    bestBrought:
      'a partner with genuine psychological stamina who does not require the relationship to be comfortable to be good'
  },

  diplomat: {
    name: 'The Diplomat',
    line: 'Say the difficult thing kindly, and stay in the room.',
    public:
      'You are the person who keeps things navigable. You read temperature accurately, you translate between people, and difficulty tends to get smaller around you rather than larger.',
    private:
      'What you want is a relationship where nothing has to be avoided. The skill exists because you know what it costs when things go unspoken.',
    falls:
      'You fall for emotional intelligence - for someone who handles a delicate moment well and does not need managing.',
    stays:
      'You stay where honesty and warmth coexist, and where you are not the only one doing the translating.',
    strain:
      'Under strain you smooth. You will hold a great deal quietly in order to keep the surface calm, and the cost usually appears all at once, late.',
    bestBrought:
      'a partner who brings their own difficulty forward voluntarily, so it never has to be gone looking for'
  },

  flame: {
    name: 'The Flame',
    line: 'If the charge is gone, so is the relationship.',
    public:
      'You are direct about wanting, which many people find refreshing and some find alarming. You move toward what you want without a great deal of pretence.',
    private:
      'Erotic and emotional charge is not a bonus for you, it is structural. You can be enormously loyal, but only inside something that stays alive.',
    falls:
      'You fall fast and physically, often before you have any information, and you are usually not wrong about the chemistry.',
    stays:
      'You stay where there is still tension - not conflict, but the current that makes someone reach across a room.',
    strain:
      'When the charge drops, you may chase it: provoke, escalate, or look for voltage elsewhere. The heat is trying to restart something.',
    bestBrought:
      'a partner who matches that appetite and is secure enough that intensity never has to be rationed'
  },

  architect: {
    name: 'The Architect',
    line: 'Love is what we build and maintain.',
    public:
      'You are the person who makes things actually happen. Plans, follow-through, a life that functions. Your care is visible in logistics.',
    private:
      'You need a partner who is building the same structure. Romance without a shared direction feels to you like a pleasant way to lose time.',
    falls:
      'You fall for follow-through: someone said they would, and then they did, and the pattern held.',
    stays:
      'You stay where the future is shared and specific, and where your effort is matched rather than simply enjoyed.',
    strain:
      'When the relationship feels unstable, you retreat into the manageable. Projects, logistics, optimisation. It looks like distance and it is actually an attempt to stabilise.',
    bestBrought:
      'a partner who wants the same structure and who also disrupts it now and then'
  },

  voyager: {
    name: 'The Voyager',
    line: 'Come with me, or let me go and be glad about it.',
    public:
      'You are expansive, independent, and genuinely good at your own life. You do not need a relationship to be complete, which is exactly what makes you attractive and occasionally hard to reach.',
    private:
      'You need to stay recognisably yourself inside a partnership. What frightens you is not commitment, it is contraction.',
    falls:
      'You fall for someone who enlarges the world rather than narrowing it - a partner who is an addition, not a trade.',
    stays:
      'You stay where freedom and devotion are not treated as opposites.',
    strain:
      'When you feel confined, you create distance before you create a conversation. The exit gets quietly maintained long before it is used.',
    bestBrought:
      'a partner with a full life of their own who keeps choosing, and does not require proof'
  },

  oracle: {
    name: 'The Oracle',
    line: 'I will know before you say it.',
    public:
      'You read people accurately and early. You tend to know how something is going to go, and you are usually right, which is both a gift and a problem.',
    private:
      'You need resonance - the sense that someone registers you at a level that does not require explanation. Being understood matters more to you than being agreed with.',
    falls:
      'You fall through recognition: a conversation where something was understood without being spelled out.',
    stays:
      'You stay where the attunement is mutual and where your reading of things is treated as information rather than as an accusation.',
    strain:
      'When something feels wrong, you interpret rather than ask. You can build a complete and convincing account of a partner’s interior without ever checking it against them.',
    bestBrought:
      'a partner who is emotionally legible, says things plainly, and leaves nothing to be guessed at'
  }
};

/* ------------------------------------------------------------------ */
/* ROMANTIC SHADOWS                                                    */
/* ------------------------------------------------------------------ */

/**
 * A shadow is the protective move a person makes when the thing they need
 * is threatened. Each shadow has:
 *   native   - the archetype it most naturally belongs to
 *   vector   - the protective-strategy signature it matches against
 *   body     - the description, written non-judgementally
 *   tell     - what a partner actually observes from outside
 *   request  - the unspoken ask underneath the behaviour
 */
export const SHADOWS = {
  fortress: {
    name: 'The Fortress',
    native: 'sovereign',
    vector: { withdraw: 2, standards: 3, control: 1 },
    body:
      'When you are disappointed, you do not usually argue or explain. You raise the bar and step back behind it. The standards become more explicit, the access becomes narrower, and everything is handled with complete composure.',
    tell:
      'From the outside this reads as having lost interest. It is almost always the opposite - it is what caring looks like when it has decided not to be caught out again.',
    request:
      'Prove that you were worth the access before I reopen it.'
  },
  unseen: {
    name: 'The Unseen',
    native: 'muse',
    vector: { perform: 3, withdraw: 1, escalate: 1 },
    body:
      'When you stop feeling perceived, you become more delightful rather than more honest. You perform the version of yourself that reliably gets a response, and the real request goes further underground.',
    tell:
      'A partner sees someone charming and apparently fine, and has no idea a door just closed.',
    request:
      'Notice that this is a performance, and ask me what is actually going on.'
  },
  ledger: {
    name: 'The Ledger',
    native: 'devotee',
    vector: { overGive: 3, withdraw: 1, standards: 1 },
    body:
      'When effort stops being even, you rarely pull back. You give more - and somewhere in that giving, an account opens that the other person does not know exists. It can run for a long time before it is ever mentioned.',
    tell:
      'Everything looks generous and fine, right up until a single moment where the whole balance is presented at once.',
    request:
      'See what I am doing before I have to tell you about it.'
  },
  undertow: {
    name: 'The Undertow',
    native: 'alchemist',
    vector: { escalate: 3, excavate: 3, withdraw: 0 },
    body:
      'When you cannot reach someone, you go deeper rather than away. You press, excavate, and if necessary create enough weather to force real contact. It is not manipulation; it is a search for proof that someone will stay in the hard part with you.',
    tell:
      'A partner experiences sudden depth or crisis and often cannot tell what set it off.',
    request:
      'Stay in this with me and do not go smooth on me.'
  },
  stillwater: {
    name: 'The Still Water',
    native: 'diplomat',
    vector: { smooth: 3, withhold: 3, withdraw: 1 },
    body:
      'Under strain you become easier to be around, not harder. You absorb, you translate, you let things go for the sake of the room. Very little of it is expressed at the time, and the accumulated weight tends to surface all at once, much later, appearing to come from nowhere.',
    tell:
      'A partner believes things are good, because you have been making them good single-handedly.',
    request:
      'Ask me a second time, and mean it.'
  },
  wildfire: {
    name: 'The Wildfire',
    native: 'flame',
    vector: { escalate: 3, provoke: 3, perform: 1 },
    body:
      'When the current drops, you reach for voltage. A provocation, a sharper conversation, a risk. Intensity is how you check that something is still alive, and it usually is a check rather than a wish for damage.',
    tell:
      'A partner experiences a fight that seems to have no origin, arriving in an otherwise calm week.',
    request:
      'Come back toward me. Anything is better than flat.'
  },
  blueprint: {
    name: 'The Blueprint',
    native: 'architect',
    vector: { control: 3, withdraw: 2, overGive: 1 },
    body:
      'When the emotional ground moves, you go to the part of life that still responds to effort. Work, logistics, the plan, the house, the schedule. You are not avoiding the relationship; you are trying to stabilise something on behalf of it.',
    tell:
      'A partner sees someone who has become busy and slightly unreachable at precisely the moment closeness was needed.',
    request:
      'Let me fix something so I can feel useful to you again.'
  },
  horizon: {
    name: 'The Horizon',
    native: 'voyager',
    vector: { withdraw: 3, exit: 3, standards: 1 },
    body:
      'When you feel contained, you begin quietly maintaining the exit. Not using it - maintaining it. The plans get looser, the calendar gets fuller, and an alternative version of your life is kept lightly warm.',
    tell:
      'A partner notices a subtle loss of gravity long before anything is said.',
    request:
      'Show me that staying will not cost me myself.'
  },
  veil: {
    name: 'The Veil',
    native: 'oracle',
    vector: { interpret: 3, withdraw: 2, withhold: 2 },
    body:
      'When something feels wrong, you read rather than ask. You assemble an interpretation - usually a detailed and persuasive one - and then respond to the interpretation as though it had been confirmed. Sometimes you are right, which is what makes the habit so hard to give up.',
    tell:
      'A partner finds themselves being answered for things they never said, and cannot locate where the story started.',
    request:
      'Contradict me clearly, so I have something real to work with.'
  }
};

export const SHADOW_KEYS = Object.keys(SHADOWS);

/** The protective strategies a shadow vector is built from. */
export const STRATEGIES = [
  'withdraw',
  'standards',
  'control',
  'overGive',
  'escalate',
  'excavate',
  'perform',
  'smooth',
  'withhold',
  'interpret',
  'provoke',
  'exit'
];

/* ------------------------------------------------------------------ */
/* ARCHETYPE RELATIONSHIPS                                             */
/* ------------------------------------------------------------------ */

/**
 * How naturally two archetypes read each other, before any dimensional
 * analysis. This NEVER decides a match on its own - the compatibility engine
 * weights real-world dimensions far more heavily. This is flavour and
 * translation guidance only.
 *
 * 2 = intuitive mutual legibility
 * 1 = workable with translation
 * 0 = requires deliberate translation
 */
export const ARCHETYPE_AFFINITY = {
  sovereign:  { sovereign: 1, muse: 2, devotee: 2, alchemist: 1, diplomat: 2, flame: 1, architect: 2, voyager: 1, oracle: 1 },
  muse:       { sovereign: 2, muse: 1, devotee: 2, alchemist: 2, diplomat: 2, flame: 2, architect: 1, voyager: 2, oracle: 2 },
  devotee:    { sovereign: 2, muse: 2, devotee: 2, alchemist: 1, diplomat: 2, flame: 1, architect: 2, voyager: 0, oracle: 1 },
  alchemist:  { sovereign: 1, muse: 2, devotee: 1, alchemist: 2, diplomat: 1, flame: 2, architect: 0, voyager: 1, oracle: 2 },
  diplomat:   { sovereign: 2, muse: 2, devotee: 2, alchemist: 1, diplomat: 1, flame: 1, architect: 2, voyager: 2, oracle: 2 },
  flame:      { sovereign: 1, muse: 2, devotee: 1, alchemist: 2, diplomat: 1, flame: 1, architect: 0, voyager: 2, oracle: 1 },
  architect:  { sovereign: 2, muse: 1, devotee: 2, alchemist: 0, diplomat: 2, flame: 0, architect: 1, voyager: 0, oracle: 1 },
  voyager:    { sovereign: 1, muse: 2, devotee: 0, alchemist: 1, diplomat: 2, flame: 2, architect: 0, voyager: 2, oracle: 1 },
  oracle:     { sovereign: 1, muse: 2, devotee: 1, alchemist: 2, diplomat: 2, flame: 1, architect: 1, voyager: 1, oracle: 1 }
};

/** Short second-person label used in the client report headers. */
export const ARCHETYPE_NAME = Object.fromEntries(
  ARCHETYPE_KEYS.map((k) => [k, ARCHETYPES[k].name])
);
