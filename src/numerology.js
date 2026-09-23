/**
 * numerology.js
 * Pythagorean numerology, calculated accurately from birth name and date.
 *
 * This is a SUPPORTING interpretive lens in The Revolution Profile. It never
 * drives a match. Every string produced here is framed as a numerological
 * reading rather than as established psychological fact.
 *
 * Methods used (stated plainly so results are reproducible):
 *  - Life Path      reduce month, day and year separately, then sum and reduce
 *  - Expression     all letters of the full birth name
 *  - Soul Urge      vowels only
 *  - Personality    consonants only
 *  - Birthday       day of month, kept as given
 *  - Master numbers 11, 22 and 33 are preserved at every reduction step
 *  - Y is treated as a vowel only when it has no adjacent vowel
 */

const LETTER_VALUE = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
  S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8
};

const HARD_VOWELS = new Set(['A', 'E', 'I', 'O', 'U']);
const MASTERS = new Set([11, 22, 33]);

/** Strip to A-Z, preserving word boundaries so the Y rule can see them. */
function normaliseName(name) {
  return String(name || '')
    .toUpperCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .split(/[^A-Z]+/)
    .filter(Boolean);
}

/**
 * Decide whether the Y at index i of `word` is functioning as a vowel.
 * Rule: Y is a vowel when neither neighbour is a hard vowel. This handles
 * LYNN and MARY as vowels, and handles YOLANDA and MAYA as consonants.
 */
function yIsVowel(word, i) {
  const prev = word[i - 1];
  const next = word[i + 1];
  if (prev && HARD_VOWELS.has(prev)) return false;
  if (next && HARD_VOWELS.has(next)) return false;
  return true;
}

/** Split a normalised name into its vowel and consonant letters. */
function splitLetters(words) {
  const vowels = [];
  const consonants = [];
  for (const word of words) {
    for (let i = 0; i < word.length; i += 1) {
      const ch = word[i];
      const isVowel = HARD_VOWELS.has(ch) || (ch === 'Y' && yIsVowel(word, i));
      (isVowel ? vowels : consonants).push(ch);
    }
  }
  return { vowels, consonants };
}

/** Reduce to a single digit, stopping on a master number. */
export function reduce(n) {
  let value = Math.abs(Math.trunc(n));
  while (value > 9 && !MASTERS.has(value)) {
    value = String(value)
      .split('')
      .reduce((sum, d) => sum + Number(d), 0);
  }
  return value;
}

function sumLetters(letters) {
  return letters.reduce((sum, ch) => sum + (LETTER_VALUE[ch] || 0), 0);
}

/* ------------------------------------------------------------------ */
/* CORE NUMBERS                                                        */
/* ------------------------------------------------------------------ */

/** @param {string} isoDate - YYYY-MM-DD */
export function lifePath(isoDate) {
  const [y, m, d] = String(isoDate).split('-').map(Number);
  if (!y || !m || !d) return null;
  const parts = [reduce(m), reduce(d), reduce(y)];
  return reduce(parts.reduce((a, b) => a + b, 0));
}

export function expression(fullBirthName) {
  const words = normaliseName(fullBirthName);
  if (!words.length) return null;
  const { vowels, consonants } = splitLetters(words);
  return reduce(sumLetters(vowels) + sumLetters(consonants));
}

export function soulUrge(fullBirthName) {
  const words = normaliseName(fullBirthName);
  if (!words.length) return null;
  return reduce(sumLetters(splitLetters(words).vowels));
}

export function personality(fullBirthName) {
  const words = normaliseName(fullBirthName);
  if (!words.length) return null;
  return reduce(sumLetters(splitLetters(words).consonants));
}

export function birthdayNumber(isoDate) {
  const d = Number(String(isoDate).split('-')[2]);
  return Number.isFinite(d) ? d : null;
}

/* ------------------------------------------------------------------ */
/* RELATIONSHIP READINGS                                               */
/* ------------------------------------------------------------------ */

/**
 * Relationship-oriented readings only. No career, health or money material,
 * and no absolute claims. Written to sit alongside the assessment, never
 * to contradict it.
 */
const LIFE_PATH_LOVE = {
  1: 'You are wired to lead, and love works best for you when you are with someone who has their own direction rather than someone who follows yours. The risk in partnership is doing too much alone before you think to ask.',
  2: 'Partnership is close to your native language. You read a room, you adjust, you keep the peace. The work is learning to say the inconvenient thing early, before accommodation hardens into resentment.',
  3: 'You love expressively and you need a partner who enjoys being talked to. Difficulty is best metabolised out loud with you, and silence tends to be the thing that genuinely unsettles you.',
  4: 'Your love is structural and shows up as reliability more than as declaration. You need a partner who reads consistency as romance rather than as routine.',
  5: 'Freedom and devotion are not opposites for you, though you will meet people who insist they are. You need room, and you give it generously in return.',
  6: 'You are the one who takes care of things, often before being asked. The pattern to watch is mistaking being needed for being loved, which are not the same supply.',
  7: 'You need interiority and you need solitude, in a relationship that does not treat either as a withdrawal of love. Trust arrives slowly with you and then holds completely.',
  8: 'You want a partnership with weight to it - shared ambition, real stakes, visible competence. Softness has to be scheduled in, or the relationship starts running like an enterprise.',
  9: 'You love broadly and somewhat idealistically. You see who someone could be, which is generous and occasionally means you are in a relationship with a projection.',
  11: 'You register things other people miss, which makes you unusually attuned and occasionally overwhelmed. You need a partner who is emotionally legible, so your sensitivity has something solid to rest against.',
  22: 'You are building something, and you want a partner inside the construction rather than beside it. The caution is letting the project become the relationship.',
  33: 'You give at scale and you are drawn to people who need something from you. The discipline is allowing yourself to be cared for in return, without treating it as a debt.'
};

const EXPRESSION_LOVE = {
  1: 'presents as decisive and self-directed',
  2: 'presents as diplomatic and attentive to the other person',
  3: 'presents as warm, expressive and socially fluent',
  4: 'presents as dependable, grounded and practically useful',
  5: 'presents as quick, curious and difficult to pin down',
  6: 'presents as nurturing, responsible and quietly in charge of everyone’s comfort',
  7: 'presents as private, observant and selective about access',
  8: 'presents as capable, ambitious and comfortable with authority',
  9: 'presents as generous, idealistic and emotionally wide-reaching',
  11: 'presents as intuitive, magnetic and slightly hard to read',
  22: 'presents as substantial, steady and oriented toward building',
  33: 'presents as devoted, warm and unusually giving'
};

const SOUL_URGE_LOVE = {
  1: 'privately wants autonomy respected above almost everything',
  2: 'privately wants closeness, harmony and a partner who stays',
  3: 'privately wants to be delighted in and listened to',
  4: 'privately wants safety, order and a partner who does not create chaos',
  5: 'privately wants freedom, variety and the absence of confinement',
  6: 'privately wants to be needed, and to be told that the care was noticed',
  7: 'privately wants depth, quiet and a partner who does not require constant access',
  8: 'privately wants respect, shared ambition and a partner who is not intimidated',
  9: 'privately wants meaning, and a love that feels larger than the two people in it',
  11: 'privately wants resonance - to be understood without having to explain',
  22: 'privately wants a shared life with real architecture to it',
  33: 'privately wants to love without limit, and to have it received rather than deflected'
};

const PERSONALITY_LOVE = {
  1: 'reads as self-assured on first meeting',
  2: 'reads as gentle and approachable on first meeting',
  3: 'reads as charming and quick on first meeting',
  4: 'reads as steady and slightly reserved on first meeting',
  5: 'reads as energetic and a little elusive on first meeting',
  6: 'reads as warm and responsible on first meeting',
  7: 'reads as composed and hard to access on first meeting',
  8: 'reads as impressive and somewhat formidable on first meeting',
  9: 'reads as gracious and worldly on first meeting',
  11: 'reads as compelling and slightly enigmatic on first meeting',
  22: 'reads as solid and quietly authoritative on first meeting',
  33: 'reads as unusually warm and generous on first meeting'
};

const BIRTHDAY_LOVE = {
  1: 'a streak of independence that shows up early in dating',
  2: 'a sensitivity to another person’s mood that operates almost automatically',
  3: 'an expressive charm that makes early dating easy and depth a later project',
  4: 'a preference for demonstrated reliability over stated intention',
  5: 'a low tolerance for routine and a high tolerance for change',
  6: 'an instinct to care for a partner practically, sometimes before being asked',
  7: 'a need for private time that partners should not read as retreat',
  8: 'an attraction to competence and a discomfort with being managed',
  9: 'a wide emotional generosity that can outrun the actual relationship'
};

function birthdayReading(day) {
  if (!day) return null;
  return BIRTHDAY_LOVE[reduce(day)] || null;
}

/* ------------------------------------------------------------------ */
/* PUBLIC API                                                          */
/* ------------------------------------------------------------------ */

/**
 * @param {object} intake - requires fullBirthName and dateOfBirth (YYYY-MM-DD)
 * @returns {object} numbers plus narrative lines, or { available:false }
 */
export function numerologyProfile(intake) {
  const name = intake?.fullBirthName;
  const dob = intake?.dateOfBirth;
  if (!name || !dob) {
    return { available: false, reason: 'Requires full birth name and date of birth.' };
  }

  const lp = lifePath(dob);
  const ex = expression(name);
  const su = soulUrge(name);
  const pe = personality(name);
  const bd = birthdayNumber(dob);

  const tension =
    ex && su && ex !== su
      ? `Your Expression and Soul Urge differ, which in numerological terms describes someone who ${EXPRESSION_LOVE[ex]} while privately wanting something else entirely: it ${SOUL_URGE_LOVE[su]}. Partners frequently respond to the first and never learn about the second unless they are told.`
      : ex && su
        ? 'Your Expression and Soul Urge carry the same number, which is read as unusual alignment between how you come across and what you actually want. What people meet is close to what is really there.'
        : null;

  return {
    available: true,
    method: 'Pythagorean, master numbers 11/22/33 preserved',
    numbers: { lifePath: lp, expression: ex, soulUrge: su, personality: pe, birthday: bd },
    readings: {
      lifePath: LIFE_PATH_LOVE[lp] || null,
      expression: EXPRESSION_LOVE[ex] || null,
      soulUrge: SOUL_URGE_LOVE[su] || null,
      personality: PERSONALITY_LOVE[pe] || null,
      birthday: birthdayReading(bd)
    },
    tension,
    framing:
      'Numerology is offered here as an interpretive tradition, not as psychological measurement. Where it disagrees with your assessment answers, the assessment is the more reliable guide.'
  };
}

/**
 * Supporting-context only comparison between two clients. Deliberately
 * cautious: it can add colour to a match, never veto one.
 */
export function numerologyPairNote(aProfile, bProfile) {
  if (!aProfile?.available || !bProfile?.available) return null;
  const a = aProfile.numbers;
  const b = bProfile.numbers;
  const notes = [];

  if (a.lifePath && b.lifePath) {
    if (a.lifePath === b.lifePath) {
      notes.push(
        'Shared Life Path. Traditionally read as intuitive mutual recognition, with the caveat that you will both have the same blind spot in the same place.'
      );
    } else if (Math.abs(reduce(a.lifePath) - reduce(b.lifePath)) === 1) {
      notes.push(
        'Adjacent Life Paths, read as an easy working rhythm with different natural tempos.'
      );
    }
  }

  if (a.soulUrge && b.soulUrge && a.soulUrge === b.soulUrge) {
    notes.push(
      'Matching Soul Urge numbers, which is read as wanting fundamentally the same thing from intimacy, even where your outward styles differ.'
    );
  }

  if (a.expression && b.soulUrge && a.expression === b.soulUrge) {
    notes.push(
      'One partner’s outward Expression matches the other’s private Soul Urge - traditionally considered a strong first-impression pull.'
    );
  }
  if (b.expression && a.soulUrge && b.expression === a.soulUrge) {
    notes.push(
      'The same resonance runs in the other direction as well, which doubles the initial recognition.'
    );
  }

  if (!notes.length) return null;
  return {
    notes,
    framing: 'Supporting numerological context only. It does not alter the Best-Fit Key.'
  };
}
