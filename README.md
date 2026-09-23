# The Revolution Profile

A private relationship assessment for **Revolution Dating**.

Twenty scored scenario questions produce three documents:

1. **The client dossier** - a narrative romantic profile. No scores, no
   percentages, no scale of any kind.
2. **The matchmaker report** - private, never shown to the client. Stated type
   versus demonstrated type, what the client is not saying, how to pursue them,
   how they fight and repair, and the questions to ask in person.
3. **The Match Key** - generated when two completed assessments are compared.
   Includes the Best-Fit Key and specific guidance on how to introduce the two
   people to each other.

## Running it

The app uses native ES modules, so it must be served over HTTP. Opening
`index.html` directly from the filesystem will not work.

```bash
npm run serve      # then open http://localhost:4173
```

## Structure

| File | Role |
|---|---|
| `index.html` | the client experience and the matchmaker view |
| `src/questions.js` | the twenty questions and their hidden measurements |
| `src/dimensions.js` | 23 bipolar axes and 8 profile sets |
| `src/archetypes.js` | 9 love archetypes, 9 romantic shadows |
| `src/scoring.js` | deterministic engine with evidence gating |
| `src/report-client.js` | the client dossier |
| `src/report-matchmaker.js` | the private report |
| `src/compatibility.js` | Best-Fit Key and Match Key |
| `src/numerology.js` | Pythagorean, supporting lens only |
| `src/astrology.js` | relationship placements, supporting lens only |
| `src/intake.js` | profile fields and hard matching filters |

## Notes

- Scoring is deterministic. The same answers always produce the same profile.
- No single question can decide an archetype, a shadow or an axis. Every claim
  is gated on evidence from multiple questions.
- Astrology never calculates an Ascendant, Descendant, house or angle unless an
  accurate birth time was supplied. Without one, those fields do not exist in
  the returned data at all.
- Astrology and numerology are supporting interpretive layers. Neither can
  change a Best-Fit Key.
- Completed profiles are stored in the browser's local storage only. Nothing is
  transmitted anywhere. This is appropriate for evaluation, not for production
  use with real client records.

The internal scoring map and the test suite are kept out of this repository.

---

© 2026 Sugarbyte LLC. Prepared for Revolution Dating.
