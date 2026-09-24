/**
 * intake.js
 * The profile information collected before the assessment begins.
 *
 * None of this is scored as one of the twenty questions. Some of it feeds the
 * numerology and astrology layers; some of it is hard matching criteria the
 * matchmaker filters on before compatibility is ever calculated.
 */

export const INTAKE_FIELDS = [
  {
    key: 'fullBirthName',
    label: 'Full name at birth',
    type: 'text',
    required: true,
    help: 'Used for the numerological reading. It is not shown on your profile.',
    autocomplete: 'name'
  },
  {
    key: 'preferredName',
    label: 'Preferred name',
    type: 'text',
    required: true,
    help: 'What we will call you.'
  },
  {
    key: 'email',
    label: 'Email',
    type: 'email',
    required: true,
    help: 'So your matchmaker can reach you. Never shown to other clients.',
    autocomplete: 'email'
  },
  {
    key: 'dateOfBirth',
    label: 'Date of birth',
    type: 'date',
    required: true
  },
  {
    key: 'birthplace',
    label: 'Place of birth',
    type: 'text',
    required: true,
    placeholder: 'City, state or country'
  },
  {
    key: 'timeZone',
    label: 'Time zone of your birthplace',
    type: 'timezone',
    required: false,
    help: 'Improves the accuracy of the astrological layer.'
  },
  {
    key: 'birthTime',
    label: 'Time of birth',
    type: 'time',
    required: false,
    optionalLabel: 'Optional',
    help: 'If you know it precisely. An approximate time is worse than none.'
  },
  {
    key: 'birthTimeKnown',
    label: 'I do not know my birth time',
    type: 'checkbox-inverse',
    required: false,
    help: 'Selecting this omits every calculation that depends on an exact time.'
  },
  {
    key: 'gender',
    label: 'Gender',
    type: 'select',
    required: true,
    options: ['Woman', 'Man', 'Non-binary', 'Prefer to self-describe', 'Prefer not to say'],
    allowSelfDescribe: true
  },
  {
    key: 'interestedIn',
    label: 'Interested in meeting',
    type: 'multiselect',
    required: true,
    options: ['Women', 'Men', 'Non-binary people'],
    help: 'Select all that apply.'
  },
  {
    key: 'relationshipStatus',
    label: 'Current relationship status',
    type: 'select',
    required: true,
    options: [
      'Never married',
      'Divorced',
      'Separated',
      'Widowed',
      'Currently dating, not exclusive',
      'Recently out of a long relationship'
    ]
  },
  {
    key: 'hasChildren',
    label: 'Do you have children?',
    type: 'select',
    required: true,
    options: [
      'No',
      'Yes, living with me',
      'Yes, living part-time with me',
      'Yes, grown and independent'
    ]
  },
  {
    key: 'wantsChildren',
    label: 'Do you want children, or more children?',
    type: 'select',
    required: true,
    options: [
      'Yes, definitely',
      'Open to it with the right person',
      'Undecided',
      'No, and this is settled',
      'Not biologically, but open to a partner’s children'
    ]
  },
  {
    key: 'location',
    label: 'Where you are based',
    type: 'text',
    required: true,
    placeholder: 'City and state, or the two places you split your time'
  },
  {
    key: 'relationshipGoal',
    label: 'What are you looking for?',
    type: 'select',
    required: true,
    options: [
      'Marriage-track',
      'Long-term partnership',
      'Dating with intention to find the right person',
      'Not sure yet, open to see'
    ]
  }
];

/**
 * Hard filters. These are applied BEFORE any compatibility scoring, because
 * no amount of dimensional harmony resolves a genuine conflict of direction.
 */
export function hardFilters(a, b) {
  const blocks = [];

  const wantsKids = (v) => v === 'Yes, definitely';
  const refusesKids = (v) => v === 'No, and this is settled';

  if (wantsKids(a.wantsChildren) && refusesKids(b.wantsChildren)) {
    blocks.push('One wants children definitely; the other has settled against it.');
  }
  if (wantsKids(b.wantsChildren) && refusesKids(a.wantsChildren)) {
    blocks.push('One wants children definitely; the other has settled against it.');
  }

  const genderMap = {
    Woman: 'Women',
    Man: 'Men',
    'Non-binary': 'Non-binary people'
  };
  const aSeeks = a.interestedIn || [];
  const bSeeks = b.interestedIn || [];
  const aCat = genderMap[a.gender];
  const bCat = genderMap[b.gender];

  if (aCat && bSeeks.length && !bSeeks.includes(aCat)) {
    blocks.push('Stated gender preference does not align.');
  }
  if (bCat && aSeeks.length && !aSeeks.includes(bCat)) {
    blocks.push('Stated gender preference does not align.');
  }

  return { passes: blocks.length === 0, blocks: [...new Set(blocks)] };
}

/** Validate a completed intake before scoring. */
export function validateIntake(intake) {
  const missing = INTAKE_FIELDS
    .filter((f) => f.required)
    .filter((f) => {
      const v = intake?.[f.key];
      return v === undefined || v === null || v === '' ||
        (Array.isArray(v) && v.length === 0);
    })
    .map((f) => f.label);

  return { valid: missing.length === 0, missing };
}
