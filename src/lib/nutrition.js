import { NUTRIENT_KEYS } from '../data/nutrients';
import { estimateGlycemicIndex, glycemicLoad } from '../data/glycemicIndex';

export const MEALS = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'snack', label: 'Snacks & drinks' },
];

export const MEAL_LABELS = Object.fromEntries(
  MEALS.map((meal) => [meal.id, meal.label]),
);

/** Every metric the dashboard can total, including the derived ones. */
export const METRIC_KEYS = [...NUTRIENT_KEYS, 'netCarbs', 'glycemicLoad', 'fluid'];

export function emptyTotals() {
  return Object.fromEntries(METRIC_KEYS.map((key) => [key, 0]));
}

/**
 * Pick the portion to preselect. FoodData Central lists measures in its own
 * sequence, which for a banana starts at "1 cup, mashed" — so prefer the
 * everyday household measures before falling back to that ordering.
 */
const PREFERRED_PORTIONS = ['medium', 'nlea serving', 'serving', 'cup'];

export function pickDefaultPortion(portions) {
  if (!portions?.length) return { label: '100 g', grams: 100 };
  for (const preference of PREFERRED_PORTIONS) {
    const match = portions.find((portion) =>
      portion.label.toLowerCase().includes(preference),
    );
    if (match) return match;
  }
  return portions.find((portion) => portion.grams !== 100) ?? portions[0];
}

/**
 * Scale a food's per-100 g nutrient panel to an actual portion and add the
 * derived metrics the dashboard cares about.
 */
export function nutrientsForPortion(food, grams) {
  const factor = (Number(grams) || 0) / 100;
  const result = emptyTotals();

  for (const key of NUTRIENT_KEYS) {
    result[key] = (Number(food.per100g?.[key]) || 0) * factor;
  }

  result.netCarbs = Math.max(0, result.carbs - result.fiber);
  result.fluid = result.water;

  const gi = food.glycemicIndex ?? estimateGlycemicIndex(
    [food.description, food.brand, food.category].filter(Boolean).join(' '),
  );
  result.glycemicLoad = glycemicLoad(gi, result.netCarbs);

  return result;
}

export function sumTotals(entries) {
  const totals = emptyTotals();
  for (const entry of entries) {
    for (const key of METRIC_KEYS) {
      totals[key] += Number(entry.nutrients?.[key]) || 0;
    }
  }
  return totals;
}

/** Totals broken out per meal, in the fixed meal order, plus a grand total. */
export function totalsByMeal(entries) {
  const byMeal = Object.fromEntries(MEALS.map((meal) => [meal.id, emptyTotals()]));
  for (const entry of entries) {
    const bucket = byMeal[entry.meal] ?? byMeal.snack;
    for (const key of METRIC_KEYS) {
      bucket[key] += Number(entry.nutrients?.[key]) || 0;
    }
  }
  return byMeal;
}

/** Which foods contribute most of a given metric, largest first. */
export function topContributors(entries, metricKey, limit = 5) {
  return [...entries]
    .map((entry) => ({
      id: entry.id,
      name: entry.description,
      meal: entry.meal,
      value: Number(entry.nutrients?.[metricKey]) || 0,
    }))
    .filter((row) => row.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

export function toDateKey(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function shiftDateKey(dateKey, days) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  d.setDate(d.getDate() + days);
  return toDateKey(d);
}

export function formatDateKey(dateKey, options = { weekday: 'long', month: 'long', day: 'numeric' }) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', options);
}

/** The last `count` date keys ending at `dateKey`, oldest first. */
export function recentDateKeys(dateKey, count = 7) {
  const keys = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    keys.push(shiftDateKey(dateKey, -i));
  }
  return keys;
}
