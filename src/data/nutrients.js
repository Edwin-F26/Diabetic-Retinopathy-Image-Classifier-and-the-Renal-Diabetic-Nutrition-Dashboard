/**
 * Nutrient definitions keyed by the internal name used throughout the app.
 *
 * `fdcIds` are USDA FoodData Central nutrient IDs and `fdcNumbers` are the
 * legacy INFOODS tag numbers. Both are needed because the search endpoint and
 * the food-detail endpoint identify nutrients differently depending on the
 * dataset a food comes from.
 */
export const NUTRIENT_DEFS = {
  energy: {
    key: 'energy',
    label: 'Energy',
    unit: 'kcal',
    fdcIds: [1008, 2047, 2048],
    fdcNumbers: ['208', '957', '958'],
  },
  protein: {
    key: 'protein',
    label: 'Protein',
    unit: 'g',
    fdcIds: [1003],
    fdcNumbers: ['203'],
  },
  fat: {
    key: 'fat',
    label: 'Total fat',
    unit: 'g',
    fdcIds: [1004],
    fdcNumbers: ['204'],
  },
  carbs: {
    key: 'carbs',
    label: 'Carbohydrate',
    unit: 'g',
    fdcIds: [1005, 1050],
    fdcNumbers: ['205'],
  },
  fiber: {
    key: 'fiber',
    label: 'Dietary fiber',
    unit: 'g',
    fdcIds: [1079, 2033],
    fdcNumbers: ['291'],
  },
  sugars: {
    key: 'sugars',
    label: 'Total sugars',
    unit: 'g',
    fdcIds: [2000, 1063, 1235],
    fdcNumbers: ['269'],
  },
  sodium: {
    key: 'sodium',
    label: 'Sodium',
    unit: 'mg',
    fdcIds: [1093],
    fdcNumbers: ['307'],
  },
  potassium: {
    key: 'potassium',
    label: 'Potassium',
    unit: 'mg',
    fdcIds: [1092],
    fdcNumbers: ['306'],
  },
  phosphorus: {
    key: 'phosphorus',
    label: 'Phosphorus',
    unit: 'mg',
    fdcIds: [1091],
    fdcNumbers: ['305'],
  },
  calcium: {
    key: 'calcium',
    label: 'Calcium',
    unit: 'mg',
    fdcIds: [1087],
    fdcNumbers: ['301'],
  },
  water: {
    key: 'water',
    label: 'Water',
    unit: 'g',
    fdcIds: [1051],
    fdcNumbers: ['255'],
  },
};

export const NUTRIENT_KEYS = Object.keys(NUTRIENT_DEFS);

/** Derived metrics that are computed rather than read from FoodData Central. */
export const DERIVED_DEFS = {
  netCarbs: {
    key: 'netCarbs',
    label: 'Net carbs',
    unit: 'g',
    description: 'Total carbohydrate minus dietary fiber.',
  },
  glycemicLoad: {
    key: 'glycemicLoad',
    label: 'Glycemic load',
    unit: 'GL',
    description:
      'Estimated from a food-category glycemic index table — FoodData Central does not publish GI.',
  },
  fluid: {
    key: 'fluid',
    label: 'Fluid',
    unit: 'mL',
    description:
      'Water content of logged foods and drinks, approximating 1 g of water as 1 mL.',
  },
};

/**
 * Metrics surfaced on the dashboard gauges, in display order. `concern` drives
 * which clinical group the metric is grouped under in the UI.
 */
export const TRACKED_METRICS = [
  {
    key: 'netCarbs',
    label: 'Net carbs',
    unit: 'g',
    concern: 'diabetes',
    blurb: 'Drives the size and speed of a post-meal glucose rise.',
  },
  {
    key: 'glycemicLoad',
    label: 'Glycemic load',
    unit: 'GL',
    concern: 'diabetes',
    blurb: 'Carb quantity weighted by how fast those carbs digest.',
  },
  {
    key: 'sodium',
    label: 'Sodium',
    unit: 'mg',
    concern: 'renal',
    blurb: 'Raises blood pressure and drives thirst between dialysis sessions.',
  },
  {
    key: 'potassium',
    label: 'Potassium',
    unit: 'mg',
    concern: 'renal',
    blurb: 'Failing kidneys clear it poorly; high levels affect heart rhythm.',
  },
  {
    key: 'phosphorus',
    label: 'Phosphorus',
    unit: 'mg',
    concern: 'renal',
    blurb: 'Builds up in CKD and pulls calcium out of bone over time.',
  },
  {
    key: 'protein',
    label: 'Protein',
    unit: 'g',
    concern: 'renal',
    blurb: 'Restricted before dialysis, increased once dialysis begins.',
  },
  {
    key: 'fluid',
    label: 'Fluid',
    unit: 'mL',
    concern: 'renal',
    blurb: 'Interdialytic weight gain comes almost entirely from fluid.',
  },
  {
    key: 'energy',
    label: 'Energy',
    unit: 'kcal',
    concern: 'general',
    blurb: 'Enough calories keeps the body from breaking down its own protein.',
  },
];

export const CONCERN_LABELS = {
  diabetes: 'Blood sugar',
  renal: 'Kidney',
  general: 'General',
};
