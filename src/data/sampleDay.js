import { OFFLINE_FOODS } from './offlineFoods';
import { createEntry } from '../state/nutritionReducer';

/**
 * A deliberately imperfect day: it lands over the potassium and phosphorus
 * limits so the warning states are visible without hunting for trigger foods.
 */
const SAMPLE_ITEMS = [
  { id: 'offline-oatmeal', meal: 'breakfast', portion: '1 cup cooked (234 g)' },
  { id: 'offline-banana', meal: 'breakfast', portion: '1 medium (118 g)' },
  { id: 'offline-milk-2', meal: 'breakfast', portion: '1 cup (244 g)' },
  { id: 'offline-coffee', meal: 'breakfast', portion: '1 cup (237 g)' },
  { id: 'offline-chicken-breast', meal: 'lunch', portion: '3 oz (85 g)' },
  { id: 'offline-white-rice', meal: 'lunch', portion: '1 cup cooked (158 g)' },
  { id: 'offline-broccoli', meal: 'lunch', portion: '1 cup chopped (156 g)' },
  { id: 'offline-orange-juice', meal: 'lunch', portion: '1 cup (248 g)' },
  { id: 'offline-salmon', meal: 'dinner', portion: '3 oz (85 g)' },
  { id: 'offline-potato', meal: 'dinner', portion: '1 medium (167 g)' },
  { id: 'offline-spinach', meal: 'dinner', portion: '1 cup (30 g)' },
  { id: 'offline-wheat-bread', meal: 'dinner', portion: '2 slices (64 g)' },
  { id: 'offline-almonds', meal: 'snack', portion: '1 oz (28 g)' },
  { id: 'offline-potato-chips', meal: 'snack', portion: '1 oz (28 g)' },
  { id: 'offline-water', meal: 'snack', portion: '16.9 fl oz bottle (500 g)' },
];

export function buildSampleDay() {
  return SAMPLE_ITEMS.flatMap((item) => {
    const food = OFFLINE_FOODS.find((entry) => entry.id === item.id);
    if (!food) return [];
    const portion =
      food.portions.find((p) => p.label === item.portion) ?? food.portions[0];
    return [
      createEntry({
        food,
        meal: item.meal,
        grams: portion.grams,
        portionLabel: portion.label,
      }),
    ];
  });
}
