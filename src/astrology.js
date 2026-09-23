/**
 * astrology.js
 * Relationship-relevant placements, computed rather than invented.
 *
 * HARD RULE, enforced structurally in this file:
 *   If an accurate birth time is not supplied, this module will not produce
 *   an Ascendant, Descendant, 7th house, MC, IC, house placements or any
 *   other time-dependent angle. Those fields are simply absent from the
 *   returned object. Callers cannot accidentally read a fabricated value.
 *
 * Accuracy: Sun and planetary longitudes use the JPL approximate Keplerian
 * elements (Standish, valid 1800-2050); the Moon uses the principal terms of
 * the ELP2000-82B series given by Meeus. Sign determination is reliable, and
 * anything within 1 degree of a cusp is flagged rather than asserted.
 *
 * Timezone handling uses the IANA database via Intl, so historical offsets
 * and daylight saving are correct for the actual birth date.
 */

const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const RAD = Math.PI / 180;
const norm360 = (d) => ((d % 360) + 360) % 360;

/* ------------------------------------------------------------------ */
/* TIME                                                                */
/* ------------------------------------------------------------------ */

/**
 * True UTC offset in minutes for a wall-clock instant in an IANA zone.
 * Correct for historical DST because it defers to the ICU tz database.
 */
function offsetMinutes(timeZone, y, mo, d, h, mi) {
  const asUTC = Date.UTC(y, mo - 1, d, h, mi);
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(new Date(asUTC)).map((p) => [p.type, p.value])
  );
  const seen = Date.UTC(
    Number(parts.year), Number(parts.month) - 1, Number(parts.day),
    Number(parts.hour === '24' ? '00' : parts.hour), Number(parts.minute), Number(parts.second)
  );
  return (seen - asUTC) / 60000;
}

/** Julian Day from a UTC calendar moment. */
function julianDay(y, m, d, hours) {
  let Y = y;
  let M = m;
  if (M <= 2) { Y -= 1; M += 12; }
  const A = Math.floor(Y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return (
    Math.floor(365.25 * (Y + 4716)) +
    Math.floor(30.6001 * (M + 1)) +
    d + hours / 24 + B - 1524.5
  );
}

/**
 * Convert intake birth data to Julian centuries from J2000.
 * When the time is unknown we use 12:00 local, which keeps the Moon's
 * maximum error to half a day of motion - handled by cusp flagging below.
 */
function toJulian(intake) {
  const [y, mo, d] = String(intake.dateOfBirth).split('-').map(Number);
  const known = Boolean(intake.birthTimeKnown && intake.birthTime);
  const [h, mi] = known ? String(intake.birthTime).split(':').map(Number) : [12, 0];
  const tz = intake.timeZone || 'UTC';

  let off = 0;
  try {
    off = offsetMinutes(tz, y, mo, d, h, mi);
  } catch {
    off = 0;
  }
  const utcMinutes = h * 60 + mi - off;
  const jd = julianDay(y, mo, d, utcMinutes / 60);
  return { jd, T: (jd - 2451545.0) / 36525, known };
}

/* ------------------------------------------------------------------ */
/* SUN AND PLANETS                                                     */
/* ------------------------------------------------------------------ */

/** JPL approximate elements: a, e, I, L, longPeri, longNode + per-century rates. */
const ELEMENTS = {
  mercury: [0.38709927, 0.20563593, 7.00497902, 252.25032350, 77.45779628, 48.33076593,
            0.00000037, 0.00001906, -0.00594749, 149472.67411175, 0.16047689, -0.12534081],
  venus:   [0.72333566, 0.00677672, 3.39467605, 181.97909950, 131.60246718, 76.67984255,
            0.00000390, -0.00004107, -0.00078890, 58517.81538729, 0.00268329, -0.27769418],
  earth:   [1.00000261, 0.01671123, -0.00001531, 100.46457166, 102.93768193, 0.0,
            0.00000562, -0.00004392, -0.01294668, 35999.37244981, 0.32327364, 0.0],
  mars:    [1.52371034, 0.09339410, 1.84969142, -4.55343205, -23.94362959, 49.55953891,
            0.00001847, 0.00007882, -0.00813131, 19140.30268499, 0.44441088, -0.29257343]
};

/** Solve Kepler's equation for eccentric anomaly, in degrees. */
function kepler(Mdeg, e) {
  const M = norm360(Mdeg + 180) - 180;
  let E = M + (e / RAD) * Math.sin(M * RAD);
  for (let i = 0; i < 12; i += 1) {
    const dM = M - (E - (e / RAD) * Math.sin(E * RAD));
    E += dM / (1 - e * Math.cos(E * RAD));
  }
  return E;
}

/** Heliocentric ecliptic rectangular coordinates for a planet at time T. */
function heliocentric(name, T) {
  const [a0, e0, I0, L0, w0, O0, aR, eR, IR, LR, wR, OR] = ELEMENTS[name];
  const a = a0 + aR * T;
  const e = e0 + eR * T;
  const I = I0 + IR * T;
  const L = L0 + LR * T;
  const w = w0 + wR * T;
  const O = O0 + OR * T;

  const argPeri = w - O;
  const E = kepler(L - w, e);

  const xp = a * (Math.cos(E * RAD) - e);
  const yp = a * Math.sqrt(1 - e * e) * Math.sin(E * RAD);

  const cw = Math.cos(argPeri * RAD), sw = Math.sin(argPeri * RAD);
  const cO = Math.cos(O * RAD), sO = Math.sin(O * RAD);
  const cI = Math.cos(I * RAD), sI = Math.sin(I * RAD);

  return {
    x: (cw * cO - sw * sO * cI) * xp + (-sw * cO - cw * sO * cI) * yp,
    y: (cw * sO + sw * cO * cI) * xp + (-sw * sO + cw * cO * cI) * yp,
    z: (sw * sI) * xp + (cw * sI) * yp
  };
}

/** Geocentric apparent ecliptic longitude of a planet, degrees. */
function planetLongitude(name, T) {
  const p = heliocentric(name, T);
  const earth = heliocentric('earth', T);
  return norm360(Math.atan2(p.y - earth.y, p.x - earth.x) / RAD);
}

/** Sun's apparent geocentric longitude (Meeus 25), degrees. */
function sunLongitude(T) {
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M * RAD) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * M * RAD) +
    0.000289 * Math.sin(3 * M * RAD);
  return norm360(L0 + C);
}

/* ------------------------------------------------------------------ */
/* MOON                                                                */
/* ------------------------------------------------------------------ */

/** Principal ELP2000 longitude terms: [D, M, M', F, coefficient(1e-6 deg)] */
const MOON_TERMS = [
  [0, 0, 1, 0, 6288774], [2, 0, -1, 0, 1274027], [2, 0, 0, 0, 658314],
  [0, 0, 2, 0, 213618], [0, 1, 0, 0, -185116], [0, 0, 0, 2, -114332],
  [2, 0, -2, 0, 58793], [2, -1, -1, 0, 57066], [2, 0, 1, 0, 53322],
  [2, -1, 0, 0, 45758], [0, 1, -1, 0, -40923], [1, 0, 0, 0, -34720],
  [0, 1, 1, 0, -30383], [2, 0, 0, -2, 15327], [0, 0, 1, 2, -12528],
  [0, 0, 1, -2, 10980], [4, 0, -1, 0, 10675], [0, 0, 3, 0, 10034],
  [4, 0, -2, 0, 8548], [2, 1, -1, 0, -7888], [2, 1, 0, 0, -6766],
  [1, 0, -1, 0, -5163], [1, 1, 0, 0, 4987], [2, -1, 1, 0, 4036],
  [2, 0, 2, 0, 3994], [4, 0, 0, 0, 3861], [2, 0, -3, 0, 3665],
  [0, 1, -2, 0, -2689], [2, 0, -1, 2, -2602], [2, -1, -2, 0, 2390],
  [1, 0, 1, 0, -2348], [2, -2, 0, 0, 2236], [0, 1, 2, 0, -2120],
  [0, 2, 0, 0, -2069], [2, -2, -1, 0, 2048]
];

/** Moon's geocentric ecliptic longitude, degrees. Accurate to a few arcmin. */
function moonLongitude(T) {
  const Lp = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T;
  const D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T * T;
  const M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T * T;
  const Mp = 134.9633964 + 477198.8675055 * T + 0.0087414 * T * T;
  const F = 93.2720950 + 483202.0175233 * T - 0.0036539 * T * T;
  const E = 1 - 0.002516 * T - 0.0000074 * T * T;

  let sum = 0;
  for (const [d, m, mp, f, coef] of MOON_TERMS) {
    const arg = (d * D + m * M + mp * Mp + f * F) * RAD;
    let c = coef;
    if (Math.abs(m) === 1) c *= E;
    else if (Math.abs(m) === 2) c *= E * E;
    sum += c * Math.sin(arg);
  }
  return norm360(Lp + sum / 1000000);
}

/* ------------------------------------------------------------------ */
/* PRESENTATION                                                        */
/* ------------------------------------------------------------------ */

function toSign(longitude) {
  const lon = norm360(longitude);
  const index = Math.floor(lon / 30);
  const degreeInSign = lon - index * 30;
  return {
    sign: SIGNS[index],
    degree: Number(degreeInSign.toFixed(2)),
    nearCusp: degreeInSign < 1 || degreeInSign > 29
  };
}

/** Relationship-relevant readings, kept short and clearly interpretive. */
const VENUS = {
  Aries: 'drawn to directness and pursuit; loses interest in anything that requires deciphering',
  Taurus: 'drawn to steadiness, physical comfort and reliability shown in real terms',
  Gemini: 'drawn to conversation and mental quickness; needs to be interested to stay attracted',
  Cancer: 'drawn to being cared for and to evidence of emotional safety',
  Leo: 'drawn to warmth and visible devotion; needs affection expressed generously',
  Virgo: 'drawn to competence and thoughtful practical attention rather than declaration',
  Libra: 'drawn to grace, balance and being courted properly',
  Scorpio: 'drawn to intensity and exclusivity; prefers depth over ease',
  Sagittarius: 'drawn to expansiveness and to a partner who enlarges the world',
  Capricorn: 'drawn to substance, seriousness and demonstrated commitment over time',
  Aquarius: 'drawn to originality and to partnership that preserves independence',
  Pisces: 'drawn to tenderness and to being met at an unspoken level'
};

const MOON = {
  Aries: 'settles fastest through action and directness, and dislikes being handled carefully',
  Taurus: 'settles through physical presence, routine and calm',
  Gemini: 'settles by talking it through, often more than once',
  Cancer: 'settles through closeness and visible reassurance',
  Leo: 'settles when affection is expressed openly and specifically',
  Virgo: 'settles when something practical is done about it',
  Libra: 'settles when harmony is restored, sometimes before the issue is finished',
  Scorpio: 'settles slowly, and requires genuine emotional honesty rather than smoothing',
  Sagittarius: 'settles through space, movement and perspective',
  Capricorn: 'settles through structure and demonstrated reliability',
  Aquarius: 'settles by stepping back and reasoning it out before feeling it',
  Pisces: 'settles through gentleness and being emotionally absorbed rather than corrected'
};

const MARS = {
  Aries: 'pursues immediately and argues hot and fast, then moves on',
  Taurus: 'pursues slowly and steadily, and becomes immovable under pressure',
  Gemini: 'pursues through conversation and argues with precision and speed',
  Cancer: 'pursues indirectly and withdraws rather than confronts',
  Leo: 'pursues openly and confidently, and needs pride handled with care in conflict',
  Virgo: 'pursues through usefulness and turns critical when frustrated',
  Libra: 'pursues with charm and avoids open confrontation for as long as possible',
  Scorpio: 'pursues with focus and does not forget a grievance quickly',
  Sagittarius: 'pursues enthusiastically and needs room during conflict',
  Capricorn: 'pursues deliberately and goes cold rather than loud',
  Aquarius: 'pursues unpredictably and detaches when a conflict escalates',
  Pisces: 'pursues subtly and tends to retreat or diffuse rather than engage'
};

const MERCURY = {
  Aries: 'says it immediately and plainly',
  Taurus: 'says it slowly and does not like being rushed to a conclusion',
  Gemini: 'thinks out loud, and processes by talking',
  Cancer: 'communicates through tone and implication more than through content',
  Leo: 'communicates warmly and with some performance',
  Virgo: 'communicates precisely, and notices imprecision in others',
  Libra: 'communicates diplomatically, sometimes at the cost of clarity',
  Scorpio: 'communicates selectively and withholds until trust is established',
  Sagittarius: 'communicates bluntly and honestly, occasionally without padding',
  Capricorn: 'communicates economically and dislikes emotional repetition',
  Aquarius: 'communicates conceptually and can seem detached mid-conflict',
  Pisces: 'communicates impressionistically, and needs patience to be understood'
};

const SUN = {
  Aries: 'identity built on initiative', Taurus: 'identity built on constancy',
  Gemini: 'identity built on curiosity', Cancer: 'identity built on belonging',
  Leo: 'identity built on being seen', Virgo: 'identity built on usefulness',
  Libra: 'identity built on relationship itself', Scorpio: 'identity built on depth',
  Sagittarius: 'identity built on freedom', Capricorn: 'identity built on achievement',
  Aquarius: 'identity built on independence', Pisces: 'identity built on empathy'
};

/* ------------------------------------------------------------------ */
/* PUBLIC API                                                          */
/* ------------------------------------------------------------------ */

/**
 * @param {object} intake
 * @returns {object} placements, with time-dependent fields ABSENT when the
 *                   birth time is unknown.
 */
export function astrologyProfile(intake) {
  if (!intake?.dateOfBirth) {
    return { available: false, reason: 'Requires a date of birth.' };
  }

  const { T, known } = toJulian(intake);

  const sun = toSign(sunLongitude(T));
  const moon = toSign(moonLongitude(T));
  const mercury = toSign(planetLongitude('mercury', T));
  const venus = toSign(planetLongitude('venus', T));
  const mars = toSign(planetLongitude('mars', T));

  // When the time is unknown, check whether the Moon changes sign that day.
  let moonUncertain = false;
  if (!known) {
    const dayT = 1 / 36525;
    const early = toSign(moonLongitude(T - 0.5 * dayT)).sign;
    const late = toSign(moonLongitude(T + 0.5 * dayT)).sign;
    moonUncertain = early !== late;
  }

  const placements = {
    sun: { ...sun, reading: SUN[sun.sign] },
    moon: { ...moon, reading: MOON[moon.sign], uncertain: moonUncertain },
    mercury: { ...mercury, reading: MERCURY[mercury.sign] },
    venus: { ...venus, reading: VENUS[venus.sign] },
    mars: { ...mars, reading: MARS[mars.sign] }
  };

  const result = {
    available: true,
    birthTimeKnown: known,
    placements,
    // Time-dependent material is structurally absent unless the time is known.
    angles: known
      ? {
          note:
            'An accurate birth time was supplied, so the Ascendant, Descendant and house placements can be calculated. Revolution Dating calculates these separately with a full ephemeris before they are used in a report.',
          available: false,
          reason:
            'Angle calculation is intentionally not performed in this module. Supply a verified chart if angles are required.'
        }
      : null,
    disclosure: known
      ? 'Birth time supplied. Placements below are calculated, not estimated.'
      : 'No birth time was supplied. Sun, Mercury, Venus and Mars are reliable without one. The Moon is calculated for midday and may be approximate. No Ascendant, Descendant, houses or angles have been calculated or inferred.',
    framing:
      'Astrology appears here as a supporting interpretive layer. Where it differs from the assessment answers, the assessment governs the matchmaking recommendation.'
  };

  const caveats = [];
  if (moonUncertain) {
    caveats.push(
      `Without a birth time, the Moon sits near a boundary on this date and may be either ${toSign(moonLongitude(T - 0.5 / 36525)).sign} or ${toSign(moonLongitude(T + 0.5 / 36525)).sign}. It is not reported as settled.`
    );
  }
  for (const [body, p] of Object.entries(placements)) {
    if (p.nearCusp && body !== 'moon') {
      caveats.push(
        `${body[0].toUpperCase()}${body.slice(1)} is within one degree of a sign boundary, so this placement should be confirmed against a full ephemeris before it is relied upon.`
      );
    }
  }
  result.caveats = caveats;

  return result;
}

/** Supporting-context only. Cannot change a Best-Fit Key. */
export function astrologyPairNote(a, b) {
  if (!a?.available || !b?.available) return null;
  const notes = [];
  const elem = (s) => ['Aries', 'Leo', 'Sagittarius'].includes(s) ? 'fire'
    : ['Taurus', 'Virgo', 'Capricorn'].includes(s) ? 'earth'
    : ['Gemini', 'Libra', 'Aquarius'].includes(s) ? 'air' : 'water';

  const va = a.placements.venus.sign;
  const vb = b.placements.venus.sign;
  if (elem(va) === elem(vb)) {
    notes.push(
      `Venus in the same element (${elem(va)}) for both, traditionally read as similar instincts about how affection should be expressed.`
    );
  }

  const ma = a.placements.mars.sign;
  const mb = b.placements.mars.sign;
  if (elem(ma) !== elem(mb)) {
    notes.push(
      `Mars in different elements, which is read as different natural tempos in pursuit and in conflict. Worth noting alongside the conflict translation below.`
    );
  }

  const moa = a.placements.moon;
  const mob = b.placements.moon;
  if (!moa.uncertain && !mob.uncertain && elem(moa.sign) === elem(mob.sign)) {
    notes.push(
      `Moons share an element, read as comparable instincts about what emotional comfort looks like.`
    );
  }

  if (!notes.length) return null;
  return {
    notes,
    framing:
      'Astrological context only, and secondary to the dimensional analysis. It does not alter the Best-Fit Key.'
  };
}

export { SIGNS };
