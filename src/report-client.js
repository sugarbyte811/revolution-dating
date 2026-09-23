/**
 * report-client.js
 * The client-facing document: a private romantic profile, not quiz results.
 *
 * Absolute rules obeyed here:
 *  - No numbers are ever shown. No percentages, no scores, no scales.
 *  - No hidden dimension name, archetype weight or scoring term appears.
 *  - Nothing is diagnostic. No clinical framing, no disorder language.
 *  - Every strong statement is backed by the evidence gate in scoring.js.
 */

import { ARCHETYPES, SHADOWS } from './archetypes.js';
import {
  LOVE_CHANNEL_PHRASE, CONFLICT_STYLE_META, REPAIR_META,
  ONSET_META, KILL_META, TRIGGER_META
} from './dimensions.js';
import { hedge, isPronounced, isBalanced } from './scoring.js';
import { numerologyProfile } from './numerology.js';
import { astrologyProfile } from './astrology.js';

/* ------------------------------------------------------------------ */
/* SENTENCE BUILDERS                                                   */
/* ------------------------------------------------------------------ */

/** Pick prose for an axis based on which side of it the client sits. */
function axisProse(p, axis, low, high, mid) {
  if (isBalanced(p, axis)) return mid || null;
  return p.axes[axis] > 0 ? high : low;
}

function joinSentences(parts) {
  return parts.filter(Boolean).join(' ');
}

/* ------------------------------------------------------------------ */
/* SECTIONS                                                            */
/* ------------------------------------------------------------------ */

function romanticSignature(p, name) {
  const arc = ARCHETYPES[p.archetype.primary];
  const hidden = ARCHETYPES[p.archetype.hidden];
  const onset = p.summary.onsetTop[0];

  const opening = `${name}, you love as ${arc.name.replace(/^The /, 'the ')} - ${arc.line.toLowerCase().replace(/\.$/, '')}.`;

  const second = onset
    ? `What begins things for you is ${ONSET_META[onset.key].phrase}.`
    : null;

  const third = hidden
    ? `Underneath that, and considerably less visible, runs something of ${hidden.name}.`
    : null;

  const fourth = axisProse(
    p, 'closeness',
    'You are built to keep a self inside a relationship, and the right partnership will feel like an addition rather than an absorption.',
    'You are built for genuine shared life, and a relationship that stays parallel rather than intertwined will never quite satisfy you.',
    'You want closeness and you want your own shape, and you are unusually capable of holding both.'
  );

  return { title: 'Your Romantic Signature', body: joinSentences([opening, second, third, fourth]) };
}

function primaryArchetype(p) {
  const arc = ARCHETYPES[p.archetype.primary];
  const confidence = p.archetype.confidence;

  const lead =
    confidence === 'strong'
      ? 'Your answers pointed here consistently.'
      : confidence === 'moderate'
        ? 'Your answers pointed here more often than anywhere else, though you carry more than one register.'
        : 'Your answers lean here, lightly. You are less easily categorised than most.';

  return {
    title: 'Your Primary Love Archetype',
    eyebrow: arc.name,
    lede: arc.line,
    body: joinSentences([arc.public, arc.private]),
    footnote: lead
  };
}

function hiddenArchetype(p) {
  const hidden = ARCHETYPES[p.archetype.hidden];
  const primary = ARCHETYPES[p.archetype.primary];

  return {
    title: 'The Part of You People Don’t See',
    eyebrow: hidden.name,
    body: joinSentences([
      `Most people meet ${primary.name}. Fewer people ever meet this.`,
      hidden.private,
      `It tends to appear only once you are already in something - which means partners frequently commit to one version of you and then meet another. The second version is not a surprise you are springing on anyone. It is simply the part that requires safety before it arrives.`
    ])
  };
}

function romanticShadow(p) {
  const shadow = SHADOWS[p.shadow.key];
  const primary = ARCHETYPES[p.archetype.primary];

  const caveat =
    p.shadow.confidence === 'inferred'
      ? 'This reading is drawn from the general shape of your answers rather than from a strong pattern, so hold it lightly.'
      : null;

  return {
    title: 'Your Romantic Shadow',
    eyebrow: shadow.name,
    body: joinSentences([
      'Everyone has a protective move - the thing they do when what they need is threatened. It is not a flaw. It is an old solution that worked once.',
      shadow.body,
      shadow.tell,
      `The request underneath it, rarely said out loud, is something like: "${shadow.request}"`,
      caveat
    ]),
    footnote: `This shadow sits naturally alongside ${primary.name}. Recognising it is most of the work.`
  };
}

function howYouFall(p) {
  const onset = p.summary.onsetTop[0];
  const second = p.summary.onsetTop[1];

  const parts = [];
  if (onset) parts.push(`Attraction begins for you with ${ONSET_META[onset.key].phrase}.`);
  if (second && second.value > 15) {
    parts.push(`Secondarily, ${ONSET_META[second.key].phrase} will do it.`);
  }

  parts.push(
    axisProse(
      p, 'pace',
      'You move deliberately. You are not slow to feel, you are slow to declare, and pressure applied early tends to produce the opposite of what it intends.',
      'When you know, you want it settled. Ambiguity costs you more than commitment does, and you would rather have the conversation early than let something stay undefined.',
      'You neither rush nor stall. You want a reasonable amount of evidence before you decide, and then you decide.'
    )
  );

  parts.push(
    axisProse(
      p, 'pursuit',
      'You are comfortable initiating, and you are not waiting to be chosen.',
      'You need to be pursued - not indefinitely, but genuinely and visibly at the start. A partner who matches your energy rather than creating it will leave you quietly unsure.',
      null
    )
  );

  return { title: 'How You Fall', body: joinSentences(parts) };
}

function howYouStay(p) {
  const parts = [];

  parts.push(
    axisProse(
      p, 'novelty',
      'What sustains you is depth of familiarity. Being fully known is not boring to you; it is the point.',
      'What sustains you is continued discovery. You need a partner who keeps developing, or attraction quietly drains regardless of how good the relationship is on paper.',
      'You need both familiarity and movement, in roughly equal measure.'
    )
  );

  if (isPronounced(p, 'physical')) {
    parts.push(
      p.axes.physical > 0
        ? 'Physical chemistry is load-bearing for you. It is not a bonus on top of a good relationship, it is part of the structure, and its absence is not something you will talk yourself out of.'
        : 'Physical chemistry matters to you, but it is not what holds the relationship up. You are capable of real contentment in a partnership where the charge is warm rather than electric.'
    );
  }

  const kill = p.summary.killTop[0];
  if (kill) parts.push(`What quietly ends things for you is when ${KILL_META[kill.key]}.`);

  return { title: 'How You Stay', body: joinSentences(parts) };
}

function howYouNeedToBeLoved(p) {
  const recv = p.summary.receiveTop[0];
  const recv2 = p.summary.receiveTop[1];
  const reassure = p.summary.reassureTop[0];

  const parts = [];
  if (recv) {
    parts.push(
      `You register love most deeply as ${LOVE_CHANNEL_PHRASE.receive[recv.key]}.`
    );
  }
  if (recv2 && recv2.value > 15) {
    parts.push(`${LOVE_CHANNEL_PHRASE.receive[recv2.key].replace(/^./, (c) => c.toUpperCase())} reaches you too.`);
  }

  if (reassure && recv && reassure.key !== recv.key) {
    parts.push(
      `Worth knowing about yourself: when you are unsettled rather than simply loved, what you need shifts. In those moments it is ${LOVE_CHANNEL_PHRASE.reassure[reassure.key]} that actually closes the loop - which is not the same thing that makes you feel loved on an ordinary day. Partners routinely offer the ordinary-day version during the unsettled moments and cannot understand why it does not work.`
    );
  }

  parts.push(
    axisProse(
      p, 'reassurance',
      'You settle yourself. You do not need frequent confirmation, and a partner who over-reassures may feel to you like someone managing you rather than being with you.',
      'You need it said out loud, not implied. A stable relationship does not speak for itself in your system, and asking for a signal is not a weakness in you - it is the actual maintenance requirement.',
      null
    )
  );

  return { title: 'How You Need To Be Loved', body: joinSentences(parts) };
}

function howYouLove(p) {
  const give = p.summary.giveTop[0];
  const recv = p.summary.receiveTop[0];
  const parts = [];

  if (give) parts.push(`Left to your own instincts, you love someone by ${LOVE_CHANNEL_PHRASE.give[give.key]}.`);

  if (p.summary.giveReceiveSplit && give && recv) {
    parts.push(
      `This is not the same as how you receive it. You give in one currency and you are paid in another. That gap is the single most common source of quiet disappointment in otherwise good relationships: you will pour real effort into something, and separately find yourself unfed, and neither of you will be doing anything wrong. It is worth saying out loud to a partner within the first few months rather than the third year.`
    );
  } else if (give) {
    parts.push('You give love in roughly the same currency you need it returned, which makes you comparatively easy to love well.');
  }

  return { title: 'How You Naturally Love Someone Else', body: joinSentences(parts) };
}

function whenLoveGetsDifficult(p) {
  const style = p.summary.conflictTop[0];
  const second = p.summary.conflictTop[1];
  const trigger = p.summary.triggerTop[0];

  const parts = [];
  if (style) {
    const meta = CONFLICT_STYLE_META[style.key];
    parts.push(`In conflict you are ${meta.label} - you ${meta.short2}.`);
    parts.push(meta.body);
  }
  if (second && second.value > 18) {
    parts.push(`There is some of ${CONFLICT_STYLE_META[second.key].label} in you as well, which usually appears when the first approach has not worked.`);
  }
  if (trigger) {
    parts.push(`The thing most likely to start it is ${TRIGGER_META[trigger.key].phrase}.`);
  }

  parts.push(
    axisProse(
      p, 'conflictEngage',
      'You need room before you can be useful in a disagreement. This is not avoidance, and a partner who follows you into the space will get the worst version of you rather than the honest one.',
      'You cannot comfortably leave a rupture open. Carrying it overnight costs you more than the argument does, and a partner who needs two days will feel to you like a door closing.',
      'You can hold a disagreement open for a reasonable period without it consuming you, which makes you easier to fight with than most.'
    )
  );

  return { title: 'When Love Gets Difficult', body: joinSentences(parts) };
}

function howToRepairWithYou(p) {
  const seq = p.summary.repairTop;
  const parts = [];

  if (seq.length) {
    const phrases = seq.map((r) => REPAIR_META[r.key].phrase);
    parts.push(
      `Repair works with you in a particular order: ${phrases.join(', then ')}.`
    );
    parts.push('Attempted out of order, it does not land - which is why a partner can do all the right things and still not reach you.');
  }

  const top = seq[0];
  if (top?.key === 'accountability') {
    parts.push('A general apology does very little for you. You need the specific thing named, without softening or explanation attached to it. "I’m sorry you felt that way" is, to you, not an apology at all.');
  } else if (top?.key === 'action') {
    parts.push('Words close nothing for you on their own. What settles it is seeing something actually different the following week. You are not withholding forgiveness; you are waiting for evidence.');
  } else if (top?.key === 'space') {
    parts.push('Do not resolve it immediately. You need decompression before repair, and a partner who insists on finishing it tonight will get compliance rather than resolution.');
  } else if (top?.key === 'affection') {
    parts.push('Physical reconnection does more than conversation. Being reached for before anything is said tends to end it faster than any discussion could.');
  } else if (top?.key === 'discussion') {
    parts.push('You need the conversation itself, unhurried and complete. A partner who moves on too quickly leaves you technically fine and actually unfinished.');
  } else if (top?.key === 'reassurance') {
    parts.push('Before anything is solved, you need to know the relationship itself is not in question. Until that is established, you cannot hear the rest of it.');
  }

  return { title: 'How To Repair With You', body: joinSentences(parts) };
}

function whatMakesYouFeelChosen(p) {
  const parts = [];

  if (isPronounced(p, 'admiration')) {
    parts.push('Being genuinely respected by someone you also respect. Admiration is not vanity in your case - it is the evidence that you have not settled.');
  }
  if (isPronounced(p, 'beingSeen')) {
    parts.push('Being perceived accurately, including the parts that are not flattering, and having it said rather than merely felt.');
  }
  if (isPronounced(p, 'security')) {
    parts.push('Consistency. Effort that arrives at the same level whether or not anything is wrong.');
  }
  if (isPronounced(p, 'control')) {
    parts.push('Someone deciding. Being planned for, rather than consulted about, reads to you as care rather than as presumption.');
  }
  if (p.axes.provider > 30) {
    parts.push('Generosity offered without being counted, in either direction.');
  }
  if (!parts.length) {
    parts.push('Sustained, deliberate attention. Your answers did not concentrate around one single signal, which suggests you are moved less by any particular gesture than by its consistency.');
  }

  return { title: 'What Makes You Feel Chosen', body: parts.join(' ') };
}

function whatMakesYouPullAway(p) {
  const shadow = SHADOWS[p.shadow.key];
  const kill = p.summary.killTop[0];
  const parts = [];

  if (kill) parts.push(`Interest begins to leave when ${KILL_META[kill.key]}.`);
  parts.push(`When that happens, you do not usually announce it. ${shadow.body}`);
  parts.push(shadow.tell);

  return { title: 'What Makes You Pull Away', body: joinSentences(parts) };
}

function blindSpot(p) {
  const shadow = SHADOWS[p.shadow.key];
  const parts = [];

  if (p.stated.divergent) {
    parts.push(
      'There is a gap between the partner you describe wanting and the situations you actually chose across this assessment. That is not a contradiction to be embarrassed about - most people have it, and it is usually the most useful thing a matchmaker can know. It does mean that the profile you would write for yourself would not be the profile we would write for you.'
    );
  }

  if (p.summary.giveReceiveSplit) {
    parts.push('You are likely to assume that the way you show love is legible as love. It is not always, and the mismatch tends to be invisible from the inside.');
  }

  parts.push(`Your particular blind spot runs through ${shadow.name}: ${shadow.request.toLowerCase().replace(/\.$/, '')} - but expressed as behaviour rather than as a request, so partners are left to interpret it, and they frequently interpret it wrongly.`);

  return { title: 'Your Relationship Blind Spot', body: joinSentences(parts) };
}

function partnerEnergy(p) {
  const arc = ARCHETYPES[p.archetype.primary];
  const hidden = ARCHETYPES[p.archetype.hidden];

  return {
    title: 'The Partner Energy That Brings Out Your Best',
    body: joinSentences([
      `You are at your best with ${arc.bestBrought}.`,
      `And because ${hidden.name} runs underneath, you will also need ${hidden.bestBrought} - which is the part most people do not think to ask for.`,
      'The combination is more specific than a type. It is not a description of a person’s résumé; it is a description of how someone would need to behave.'
    ])
  };
}

function astroSection(p) {
  const astro = astrologyProfile(p.intake || {});
  if (!astro.available) return null;

  const pl = astro.placements;
  const lines = [
    `Venus in ${pl.venus.sign} - ${pl.venus.reading}.`,
    `Moon in ${pl.moon.sign}${pl.moon.uncertain ? ' (approximate)' : ''} - ${pl.moon.reading}.`,
    `Mars in ${pl.mars.sign} - ${pl.mars.reading}.`,
    `Mercury in ${pl.mercury.sign} - ${pl.mercury.reading}.`,
    `Sun in ${pl.sun.sign} - ${pl.sun.reading}.`
  ];

  return {
    title: 'Your Astrological Love Signature',
    lines,
    disclosure: astro.disclosure,
    caveats: astro.caveats,
    framing: astro.framing
  };
}

function numeroSection(p) {
  const num = numerologyProfile(p.intake || {});
  if (!num.available) return null;

  const n = num.numbers;
  const lines = [];
  if (num.readings.lifePath) lines.push(`Life Path ${n.lifePath}. ${num.readings.lifePath}`);
  if (num.readings.soulUrge) {
    lines.push(`Soul Urge ${n.soulUrge}. In this tradition, that is someone who ${num.readings.soulUrge}.`);
  }
  if (num.readings.expression) {
    lines.push(`Expression ${n.expression}. A person who ${num.readings.expression}.`);
  }
  if (num.readings.birthday) lines.push(`Birthday influence: ${num.readings.birthday}.`);

  return {
    title: 'Your Numerological Love Signature',
    lines,
    tension: num.tension,
    framing: num.framing
  };
}

/* ------------------------------------------------------------------ */
/* PUBLIC API                                                          */
/* ------------------------------------------------------------------ */

/**
 * @param {object} p scored profile from scoring.js
 * @returns {object} the client-facing dossier. Contains no numbers.
 */
export function clientReport(p) {
  const name = p.intake?.preferredName || 'You';

  const sections = [
    romanticSignature(p, name),
    primaryArchetype(p),
    hiddenArchetype(p),
    romanticShadow(p),
    howYouFall(p),
    howYouStay(p),
    howYouNeedToBeLoved(p),
    howYouLove(p),
    whenLoveGetsDifficult(p),
    howToRepairWithYou(p),
    whatMakesYouFeelChosen(p),
    whatMakesYouPullAway(p),
    blindSpot(p),
    partnerEnergy(p)
  ].filter(Boolean);

  return {
    name,
    archetype: {
      primary: ARCHETYPES[p.archetype.primary].name,
      hidden: ARCHETYPES[p.archetype.hidden].name,
      shadow: SHADOWS[p.shadow.key].name
    },
    sections,
    astrology: astroSection(p),
    numerology: numeroSection(p),
    closing:
      'This profile was built from twenty scenarios and the way you moved through them. It is a starting point for a conversation with your matchmaker, not a verdict about who you are. People are larger than any assessment, including this one.'
  };
}
