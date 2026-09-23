/**
 * questions.js
 * The twenty scored questions of The Revolution Profile.
 *
 * CONSTRUCTION RULES (enforced by test/verify.js):
 *  - Exactly 20 scored questions. Intake fields are not questions.
 *  - Every option carries 2-4 underlying measurements. No option is inert.
 *  - No option is the obviously "healthy" or socially desirable one.
 *  - The client cannot infer what is being measured from the wording.
 *  - No single question can decide an archetype: archetype weights are small
 *    and every archetype draws evidence from at least three questions.
 *
 * OPTION SHAPE
 *   text        the client-facing sentence
 *   bipolar     { axisKey: signedWeight }        see dimensions.js BIPOLAR
 *   profiles    { setKey: { channel: weight } }  see dimensions.js PROFILES
 *   arc         [{ key, w, mode }]               mode: 'public' | 'private'
 *   stated      { archetypeKey: weight }         conscious self-description
 *   strategies  { strategyKey: weight }          feeds Romantic Shadow
 *   flags       [string]                         qualitative notes for the
 *                                                matchmaker report only
 */

export const QUESTIONS = [
  /* ------------------------------------------------------------------ 1 */
  {
    id: 'q1',
    movement: 'I',
    movementTitle: 'The First Hour',
    prompt:
      'You meet someone at a small dinner. The evening is pleasant and largely unremarkable, except for one moment. Which moment is still with you the next morning?',
    options: [
      {
        id: 'a',
        text:
          'They disagreed with you, openly, in front of everyone, and held the position without getting defensive about it.',
        bipolar: { admiration: 2, intensity: 1, directness: 1, status: 1 },
        profiles: { onset: { competence: 3 } },
        arc: [{ key: 'sovereign', w: 2, mode: 'private' }]
      },
      {
        id: 'b',
        text:
          'They noticed you had gone quiet an hour earlier, and asked you about it later, privately.',
        bipolar: { beingSeen: 2, depth: 1, closeness: 1 },
        profiles: { onset: { recognition: 3 }, receive: { words: 1 } },
        arc: [
          { key: 'oracle', w: 2, mode: 'private' },
          { key: 'muse', w: 1, mode: 'private' }
        ]
      },
      {
        id: 'c',
        text:
          'They remembered something you mentioned in passing and had already worked it into a plan for the following week.',
        bipolar: { control: 1, pursuit: 1, security: 1 },
        profiles: { onset: { attentiveness: 3 }, receive: { acts: 2 } },
        arc: [{ key: 'architect', w: 2, mode: 'private' }]
      },
      {
        id: 'd',
        text:
          'A half-second of eye contact that neither of you acknowledged or explained.',
        bipolar: { physical: 2, intensity: 2, novelty: 1 },
        profiles: { onset: { magnetism: 3 } },
        arc: [{ key: 'flame', w: 2, mode: 'private' }]
      }
    ]
  },

  /* ------------------------------------------------------------------ 2 */
  {
    id: 'q2',
    movement: 'I',
    prompt:
      'Three months in, with someone you genuinely like. Which of these would quietly end your interest, even if you never said so out loud?',
    options: [
      {
        id: 'a',
        text: 'They became entirely predictable. You could write the week in advance.',
        bipolar: { novelty: 2, security: -2, intensity: 1 },
        profiles: { kill: { predictability: 3 } },
        arc: [{ key: 'voyager', w: 2, mode: 'private' }]
      },
      {
        id: 'b',
        text: 'They began deferring to you on everything. Your preference simply became the plan.',
        bipolar: { admiration: 2, control: -1, status: 1 },
        profiles: { kill: { deference: 3 } },
        arc: [{ key: 'sovereign', w: 2, mode: 'private' }],
        strategies: { standards: 1 }
      },
      {
        id: 'c',
        text:
          'They were consistently warm, and you slowly realised they had never once asked about your interior life.',
        bipolar: { beingSeen: 3, depth: 2 },
        profiles: { kill: { invisibility: 3 } },
        arc: [
          { key: 'muse', w: 2, mode: 'private' },
          { key: 'oracle', w: 1, mode: 'private' }
        ]
      },
      {
        id: 'd',
        text: 'They were lovely in every respect, and the physical charge never arrived.',
        bipolar: { physical: 3 },
        profiles: { kill: { noSpark: 3 } },
        arc: [{ key: 'flame', w: 2, mode: 'public' }]
      }
    ]
  },

  /* ------------------------------------------------------------------ 3 */
  {
    id: 'q3',
    movement: 'I',
    prompt:
      'Three good dates in. You are interested. What would you most want to happen next?',
    options: [
      {
        id: 'a',
        text: 'They tell you plainly that they do not want to see anyone else.',
        bipolar: { pace: 2, security: 2, directness: 2 },
        profiles: { receive: { words: 1 } },
        arc: [{ key: 'devotee', w: 2, mode: 'public' }]
      },
      {
        id: 'b',
        text:
          'They keep planning things without being asked, and the question of exclusivity resolves itself without a conversation.',
        bipolar: { pursuit: 2, control: 1, directness: -1 },
        profiles: { receive: { acts: 2 } },
        arc: [{ key: 'architect', w: 2, mode: 'private' }]
      },
      {
        id: 'c',
        text:
          'You both continue seeing other people for a while. The unresolved tension is part of the appeal.',
        bipolar: { pace: -2, novelty: 2, intensity: 2, security: -2 },
        arc: [
          { key: 'flame', w: 2, mode: 'private' },
          { key: 'voyager', w: 1, mode: 'public' }
        ]
      },
      {
        id: 'd',
        text:
          'A long conversation in which you each say, accurately, what you are actually looking for.',
        bipolar: { directness: 2, depth: 1, pace: 1 },
        arc: [{ key: 'diplomat', w: 2, mode: 'public' }]
      }
    ]
  },

  /* ------------------------------------------------------------------ 4 */
  {
    id: 'q4',
    movement: 'II',
    movementTitle: 'Under Pressure',
    prompt:
      'Something has been building between you for two days. Neither of you has named it. Which is more true of you?',
    options: [
      {
        id: 'a',
        text:
          'You would rather have it out tonight, even badly, than carry it into another day.',
        bipolar: { conflictEngage: 3, conflictHeat: 1, harmony: -2 },
        profiles: { conflict: { immediateResolver: 3, pursuer: 1 } },
        flags: ['cannot hold an open rupture overnight']
      },
      {
        id: 'b',
        text:
          'You need a night alone with it first, or you will say something shaped wrong.',
        bipolar: { conflictEngage: -3, directness: -1 },
        profiles: { conflict: { processor: 3, withdrawer: 1 }, repair: { space: 2 } },
        strategies: { withdraw: 1 },
        flags: ['delay is precision, not avoidance']
      },
      {
        id: 'c',
        text:
          'You would find a way to lighten it and let the charge dissipate on its own.',
        bipolar: { harmony: 3, conflictHeat: -2 },
        profiles: { conflict: { peacemaker: 3 } },
        arc: [{ key: 'diplomat', w: 1, mode: 'private' }],
        strategies: { smooth: 2, withhold: 1 }
      },
      {
        id: 'd',
        text:
          'You would start solving the practical part of it before either of you discussed how it felt.',
        bipolar: { control: 2, depth: -1 },
        profiles: { conflict: { fixer: 3 }, give: { acts: 2 } },
        arc: [{ key: 'architect', w: 1, mode: 'private' }],
        strategies: { control: 1 }
      }
    ]
  },

  /* ------------------------------------------------------------------ 5 */
  {
    id: 'q5',
    movement: 'II',
    prompt: 'The disagreement is over. What actually makes it feel finished to you?',
    options: [
      {
        id: 'a',
        text: 'They say it out loud, specifically, and name the thing they did.',
        bipolar: { directness: 1 },
        profiles: { repair: { accountability: 3 }, receive: { words: 2 } }
      },
      {
        id: 'b',
        text: 'Something is visibly different the following week.',
        bipolar: {},
        profiles: { repair: { action: 3 }, receive: { acts: 2 } },
        arc: [{ key: 'architect', w: 1, mode: 'private' }]
      },
      {
        id: 'c',
        text: 'They reach for you before either of you has said anything.',
        bipolar: { physical: 1 },
        profiles: { repair: { affection: 3 }, receive: { touch: 2 } }
      },
      {
        id: 'd',
        text:
          'An unhurried conversation, later, in which you both genuinely understand what happened.',
        bipolar: { depth: 1 },
        profiles: { repair: { discussion: 3 }, receive: { time: 2 } },
        arc: [
          { key: 'diplomat', w: 1, mode: 'private' },
          { key: 'oracle', w: 1, mode: 'public' }
        ]
      }
    ]
  },

  /* ------------------------------------------------------------------ 6 */
  {
    id: 'q6',
    movement: 'II',
    prompt:
      'Nothing is wrong. You have simply felt slightly off about the relationship for a week. Which of these would settle it?',
    options: [
      {
        id: 'a',
        text: 'They plan something that has clearly taken real thought.',
        bipolar: { pursuit: 1, generosity: 1 },
        profiles: { reassure: { gifts: 2, acts: 1 }, receive: { gifts: 2 } }
      },
      {
        id: 'b',
        text: 'An unprompted message telling you exactly what you are to them.',
        bipolar: { reassurance: 2 },
        profiles: { reassure: { words: 3 }, receive: { words: 2 } }
      },
      {
        id: 'c',
        text: 'An evening together with no phones and no agenda.',
        bipolar: { closeness: 1 },
        profiles: { reassure: { time: 3 }, receive: { time: 2 } }
      },
      {
        id: 'd',
        text: 'They pull you in and do not let go for a while.',
        bipolar: { physical: 1 },
        profiles: { reassure: { touch: 3 }, receive: { touch: 2 } }
      }
    ]
  },

  /* ------------------------------------------------------------------ 7 */
  {
    id: 'q7',
    movement: 'II',
    prompt:
      'You have an unexpected free Saturday. Someone you love is having a genuinely hard month. What do you actually do?',
    options: [
      {
        id: 'a',
        text: 'Quietly handle three things on their list without mentioning it.',
        bipolar: {},
        profiles: { give: { acts: 3 } },
        arc: [{ key: 'architect', w: 1, mode: 'public' }]
      },
      {
        id: 'b',
        text: 'Clear the entire day and simply be with them.',
        bipolar: { closeness: 1 },
        profiles: { give: { time: 3 } },
        arc: [{ key: 'devotee', w: 1, mode: 'public' }]
      },
      {
        id: 'c',
        text: 'Tell them, at length and precisely, what you see in them and why this will pass.',
        bipolar: {},
        profiles: { give: { words: 3 } },
        arc: [{ key: 'muse', w: 1, mode: 'public' }]
      },
      {
        id: 'd',
        text: 'Find the one specific thing that will actually land, and get it to them.',
        bipolar: { generosity: 2 },
        profiles: { give: { gifts: 3 } }
      },
      {
        id: 'e',
        text: 'Cancel everything, get into bed with them, and stay close.',
        bipolar: { physical: 1 },
        profiles: { give: { touch: 3 } },
        arc: [{ key: 'flame', w: 1, mode: 'public' }]
      }
    ]
  },

  /* ------------------------------------------------------------------ 8 */
  {
    id: 'q8',
    movement: 'III',
    movementTitle: 'The Practical Life',
    prompt:
      'You are planning a trip together. You earn meaningfully more than they do. What feels right to you?',
    options: [
      {
        id: 'a',
        text: 'You cover it. It is not a conversation.',
        bipolar: { provider: 3, generosity: 3 },
        arc: [{ key: 'sovereign', w: 1, mode: 'public' }]
      },
      {
        id: 'b',
        text:
          'They plan the whole thing, in detail, and you fund it. Effort on one side, resources on the other.',
        bipolar: { provider: 2, control: 1, pursuit: 1, generosity: 1 },
        profiles: { receive: { acts: 2 } }
      },
      {
        id: 'c',
        text: 'Proportional to income. Discussed once, then never again.',
        bipolar: { provider: -1, directness: 2 },
        arc: [{ key: 'diplomat', w: 1, mode: 'public' }]
      },
      {
        id: 'd',
        text: 'You would rather take a smaller trip that you both pay for evenly.',
        bipolar: { provider: -3, status: -2, generosity: -1 },
        arc: [{ key: 'voyager', w: 1, mode: 'private' }]
      }
    ]
  },

  /* ------------------------------------------------------------------ 9 */
  {
    id: 'q9',
    movement: 'III',
    prompt: 'Which of these would you find hardest to live with, honestly?',
    options: [
      {
        id: 'a',
        text: 'A partner who is admired by everyone and rarely fully present with you.',
        bipolar: { closeness: 2, status: -1, beingSeen: 1, social: 1 },
        flags: ['presence outranks prestige']
      },
      {
        id: 'b',
        text: 'A partner entirely devoted to you, with no real ambition of their own.',
        bipolar: { status: 3, admiration: 3, provider: 2 },
        arc: [{ key: 'sovereign', w: 2, mode: 'private' }]
      },
      {
        id: 'c',
        text:
          'A partner who is brilliant and difficult, who you are always slightly working to keep.',
        bipolar: { security: 3, intensity: -2, pace: -1 },
        arc: [{ key: 'devotee', w: 1, mode: 'private' }]
      },
      {
        id: 'd',
        text: 'A partner who is steady, kind, and never surprises you.',
        bipolar: { novelty: 3, intensity: 2 },
        arc: [
          { key: 'voyager', w: 1, mode: 'private' },
          { key: 'flame', w: 1, mode: 'private' }
        ],
        strategies: { provoke: 1 }
      }
    ]
  },

  /* ----------------------------------------------------------------- 10 */
  {
    id: 'q10',
    movement: 'III',
    prompt:
      'Your partner is offered something extraordinary that takes them away for four months. What is your honest first internal reaction, before the generous one?',
    options: [
      {
        id: 'a',
        text: 'Genuine excitement. You would build your own four months.',
        bipolar: { closeness: -3, autonomyThreat: -3, family: -1 },
        arc: [{ key: 'voyager', w: 2, mode: 'private' }]
      },
      {
        id: 'b',
        text: 'Pride, and a quiet calculation of how often you would actually speak.',
        bipolar: { reassurance: 1, closeness: -1 },
        strategies: { interpret: 1 }
      },
      {
        id: 'c',
        text: 'You would want to find a way to go with them, or for them to turn it down.',
        bipolar: { closeness: 3, autonomyThreat: 3 },
        arc: [{ key: 'alchemist', w: 1, mode: 'private' }],
        strategies: { escalate: 1, excavate: 1 }
      },
      {
        id: 'd',
        text:
          'Support, and a private worry about who they might become while they were gone.',
        bipolar: { reassurance: 3, security: -2 },
        arc: [{ key: 'devotee', w: 2, mode: 'private' }],
        strategies: { overGive: 1 }
      }
    ]
  },

  /* ----------------------------------------------------------------- 11 */
  {
    id: 'q11',
    movement: 'III',
    prompt:
      'Their closest friends are people you find tedious. What actually happens over the course of a year?',
    options: [
      {
        id: 'a',
        text: 'You go, you are gracious, and you feel no need to be close to them.',
        bipolar: { social: -1, harmony: 2, autonomyThreat: -1 },
        arc: [{ key: 'diplomat', w: 1, mode: 'private' }],
        strategies: { smooth: 1, withhold: 1, perform: 1 }
      },
      {
        id: 'b',
        text: 'You would quietly prefer they keep that part of their life separate.',
        bipolar: { social: -3, closeness: -2, autonomyThreat: -1 },
        arc: [{ key: 'voyager', w: 1, mode: 'private' }],
        strategies: { exit: 1 }
      },
      {
        id: 'c',
        text:
          'It would bother you more than you would expect. You want a genuinely shared world.',
        bipolar: { social: 3, closeness: 2, family: 1 },
        arc: [{ key: 'devotee', w: 1, mode: 'private' }]
      },
      {
        id: 'd',
        text: 'You would say it early, carefully, and see whether they could hear it.',
        bipolar: { directness: 3 },
        arc: [{ key: 'diplomat', w: 2, mode: 'public' }]
      }
    ]
  },

  /* ----------------------------------------------------------------- 12 */
  {
    id: 'q12',
    movement: 'IV',
    movementTitle: 'The Long Middle',
    prompt: 'Two years in. Which version of the relationship would you actually choose?',
    options: [
      {
        id: 'a',
        text: 'Deep familiarity. They know you completely. Very little surprises you.',
        bipolar: { novelty: -3, security: 3, pace: 2 },
        arc: [{ key: 'devotee', w: 2, mode: 'public' }]
      },
      {
        id: 'b',
        text: 'A partner who keeps developing, who you are somehow still learning.',
        bipolar: { novelty: 2, depth: 2 },
        arc: [{ key: 'alchemist', w: 2, mode: 'public' }]
      },
      {
        id: 'c',
        text:
          'Reliable structure with deliberate disruption built in. Trips, projects, things planned on purpose.',
        bipolar: { control: 2, novelty: 1 },
        arc: [
          { key: 'architect', w: 2, mode: 'public' },
          { key: 'voyager', w: 1, mode: 'public' }
        ]
      },
      {
        id: 'd',
        text:
          'Enough unresolved charge between you that you still reach for each other without planning it.',
        bipolar: { intensity: 3, physical: 3 },
        arc: [{ key: 'flame', w: 2, mode: 'public' }],
        strategies: { provoke: 1 }
      }
    ]
  },

  /* ----------------------------------------------------------------- 13 */
  {
    id: 'q13',
    movement: 'IV',
    prompt:
      'If a close friend were describing you to someone they thought you should meet, which sentence would you most want to be true?',
    note: 'There is no wrong answer here. Choose the one you would want said.',
    options: [
      {
        id: 'a',
        text: '"They have extremely high standards and they do not apologise for it."',
        bipolar: { rigidity: 1 },
        stated: { sovereign: 3 }
      },
      {
        id: 'b',
        text: '"Being loved by them changes people."',
        bipolar: {},
        stated: { alchemist: 2, devotee: 2 }
      },
      {
        id: 'c',
        text: '"They are the most interesting person in any room they walk into."',
        bipolar: {},
        stated: { muse: 3, voyager: 1 }
      },
      {
        id: 'd',
        text: '"They build a life with someone, properly."',
        bipolar: {},
        stated: { architect: 3, devotee: 1 }
      }
    ]
  },

  /* ----------------------------------------------------------------- 14 */
  {
    id: 'q14',
    movement: 'IV',
    prompt: 'Which of these would get the strongest reaction out of you?',
    options: [
      {
        id: 'a',
        text: 'Being spoken to as though you had not already thought it through.',
        bipolar: { admiration: 2, conflictHeat: 1 },
        profiles: { trigger: { disrespect: 3 }, conflict: { defender: 2 } },
        arc: [{ key: 'sovereign', w: 1, mode: 'private' }]
      },
      {
        id: 'b',
        text: 'Discovering that something was decided or handled without you.',
        bipolar: { control: 2 },
        profiles: { trigger: { exclusion: 3 }, conflict: { defender: 1 } },
        arc: [{ key: 'architect', w: 1, mode: 'private' }]
      },
      {
        id: 'c',
        text: 'Emotional flatness. They go blank in the middle of a conversation.',
        bipolar: { reassurance: 2, closeness: 1, conflictEngage: 1 },
        profiles: { trigger: { withdrawal: 3 }, conflict: { pursuer: 3 } },
        strategies: { escalate: 1 }
      },
      {
        id: 'd',
        text: 'Having to explain the same need for the third time.',
        bipolar: { beingSeen: 3 },
        profiles: { trigger: { notBeingKnown: 3 } },
        arc: [{ key: 'oracle', w: 2, mode: 'private' }]
      }
    ]
  },

  /* ----------------------------------------------------------------- 15 */
  {
    id: 'q15',
    movement: 'IV',
    prompt:
      'They need two days to themselves after a disagreement. You are fine on day one. What about day two?',
    options: [
      {
        id: 'a',
        text: 'Still fine. You would use the time.',
        bipolar: { conflictEngage: -3, closeness: -2, autonomyThreat: -1 },
        profiles: { conflict: { withdrawer: 2, processor: 1 }, repair: { space: 2 } },
        strategies: { withdraw: 2 }
      },
      {
        id: 'b',
        text: 'Functioning normally, with a low hum of unease underneath it.',
        bipolar: { reassurance: 1 },
        strategies: { interpret: 1 }
      },
      {
        id: 'c',
        text: 'You would need one piece of contact confirming the two of you are fine.',
        bipolar: { reassurance: 2 },
        profiles: { conflict: { pursuer: 2 }, repair: { reassurance: 2 } }
      },
      {
        id: 'd',
        text: 'You would find the second day genuinely difficult, and you would say so.',
        bipolar: { reassurance: 3, conflictEngage: 3, closeness: 2, directness: 1, conflictHeat: 1 },
        profiles: { conflict: { pursuer: 3 }, repair: { reassurance: 1 } },
        strategies: { escalate: 1 }
      }
    ]
  },

  /* ----------------------------------------------------------------- 16 */
  {
    id: 'q16',
    movement: 'IV',
    prompt:
      'Everything else is right. The physical connection is warm but not electric. Where are you after a year?',
    options: [
      {
        id: 'a',
        text: 'Content. That describes most long relationships honestly.',
        bipolar: { physical: -3, intensity: -2 }
      },
      {
        id: 'b',
        text: 'You would miss it specifically, and it would slowly begin to matter more.',
        bipolar: { physical: 3 },
        arc: [{ key: 'flame', w: 1, mode: 'private' }]
      },
      {
        id: 'c',
        text: 'You would raise it directly and work on it together.',
        bipolar: { physical: 1, directness: 2, conflictEngage: 1 },
        profiles: { conflict: { fixer: 2 } }
      },
      {
        id: 'd',
        text: 'You would start wondering whether you had mistaken comfort for love.',
        bipolar: { physical: 2, intensity: 2, depth: 2 },
        arc: [{ key: 'alchemist', w: 2, mode: 'private' }]
      }
    ]
  },

  /* ----------------------------------------------------------------- 17 */
  {
    id: 'q17',
    movement: 'V',
    movementTitle: 'The Shape of a Life',
    prompt: 'Which of these arrangements would you find hardest?',
    options: [
      {
        id: 'a',
        text: 'A partner whose family expects to be central, every single week.',
        bipolar: { family: -3, closeness: -1 },
        arc: [{ key: 'voyager', w: 1, mode: 'private' }]
      },
      {
        id: 'b',
        text:
          'A partner with no close family ties, who does not really understand why yours matter.',
        bipolar: { family: 3 },
        arc: [{ key: 'devotee', w: 1, mode: 'private' }]
      },
      {
        id: 'c',
        text: 'A partner whose children from a previous relationship will always come first.',
        bipolar: { closeness: 2, security: 1, autonomyThreat: 1, family: -1, pace: -1 },
        flags: ['may struggle with second position in a blended family']
      },
      {
        id: 'd',
        text: 'A partner who wants a family life considerably bigger and busier than you had planned.',
        bipolar: { family: -2, social: -1 }
      }
    ]
  },

  /* ----------------------------------------------------------------- 18 */
  {
    id: 'q18',
    movement: 'V',
    prompt:
      'Someone meets every real thing you are looking for, and fails one of your stated requirements. What actually happens?',
    options: [
      {
        id: 'a',
        text: 'It is a requirement for a reason. You would pass.',
        bipolar: { rigidity: 3, pace: 1 },
        arc: [{ key: 'sovereign', w: 1, mode: 'public' }],
        strategies: { standards: 2 }
      },
      {
        id: 'b',
        text: 'You would meet them once, to see.',
        bipolar: { rigidity: -1, novelty: 1 }
      },
      {
        id: 'c',
        text: 'You would notice how quickly you stopped caring about the requirement.',
        bipolar: { rigidity: -3, pace: -1 },
        flags: ['stated requirements are permeable in practice']
      },
      {
        id: 'd',
        text:
          'You would keep the requirement and keep seeing them, and leave it unresolved.',
        bipolar: { depth: 1, harmony: 1 },
        flags: [
          'holds contradiction rather than resolving it',
          'ask in person which requirement this would be'
        ],
        strategies: { withhold: 1 }
      }
    ]
  },

  /* ----------------------------------------------------------------- 19 */
  {
    id: 'q19',
    movement: 'V',
    prompt:
      'You were disappointed by someone you had been becoming serious about. Six weeks later, what is actually different about you?',
    options: [
      {
        id: 'a',
        text: 'Your standards are higher, and more explicit.',
        bipolar: { rigidity: 1, admiration: 1 },
        arc: [{ key: 'sovereign', w: 1, mode: 'private' }],
        strategies: { standards: 3, withdraw: 1 }
      },
      {
        id: 'b',
        text: 'You are warmer to everyone, and close to no one.',
        bipolar: { harmony: 1 },
        strategies: { withhold: 3, perform: 2, withdraw: 1 }
      },
      {
        id: 'c',
        text: 'You are doing more, achieving more, and dating considerably less.',
        bipolar: { status: 1 },
        strategies: { control: 3, withdraw: 2 }
      },
      {
        id: 'd',
        text: 'You are seeing more people, and enjoying it more.',
        bipolar: { novelty: 1, closeness: -1 },
        arc: [{ key: 'voyager', w: 1, mode: 'private' }],
        strategies: { exit: 3, withdraw: 1 }
      },
      {
        id: 'e',
        text: 'You are still going over it, looking for the thing you must have missed.',
        bipolar: { depth: 1 },
        arc: [{ key: 'oracle', w: 1, mode: 'private' }],
        strategies: { interpret: 3, excavate: 2 }
      },
      {
        id: 'f',
        text: 'You are more generous and more available, hoping to be chosen properly next time.',
        bipolar: { reassurance: 1, generosity: 1 },
        arc: [{ key: 'devotee', w: 1, mode: 'private' }],
        strategies: { overGive: 3, perform: 1 }
      }
    ]
  },

  /* ----------------------------------------------------------------- 20 */
  {
    id: 'q20',
    movement: 'V',
    prompt:
      'Think of the version of yourself you most like being. Who brings that version out?',
    options: [
      {
        id: 'a',
        text: 'Someone who takes you seriously and expects a great deal of you.',
        bipolar: { admiration: 2, provider: -1, status: 1 },
        arc: [
          { key: 'sovereign', w: 2, mode: 'public' },
          { key: 'architect', w: 1, mode: 'public' }
        ]
      },
      {
        id: 'b',
        text: 'Someone who finds you genuinely fascinating, and says so.',
        bipolar: { beingSeen: 2 },
        profiles: { receive: { words: 2 } },
        arc: [{ key: 'muse', w: 3, mode: 'public' }]
      },
      {
        id: 'c',
        text: 'Someone completely steady, whose consistency lets you stop bracing.',
        bipolar: { security: 3, pace: 2 },
        arc: [{ key: 'devotee', w: 3, mode: 'public' }]
      },
      {
        id: 'd',
        text: 'Someone who pulls you somewhere you would not have gone on your own.',
        bipolar: { novelty: 2, intensity: 1 },
        arc: [
          { key: 'voyager', w: 2, mode: 'public' },
          { key: 'alchemist', w: 1, mode: 'public' }
        ]
      },
      {
        id: 'e',
        text: 'Someone calm, who makes difficulty feel navigable.',
        bipolar: { harmony: 1, conflictHeat: -1 },
        arc: [{ key: 'diplomat', w: 3, mode: 'public' }]
      }
    ]
  }
];

/** Movement headers used by the UI to pace the experience. */
export const MOVEMENTS = {
  I: 'The First Hour',
  II: 'Under Pressure',
  III: 'The Practical Life',
  IV: 'The Long Middle',
  V: 'The Shape of a Life'
};

export const QUESTION_COUNT = QUESTIONS.length;
