/**
 * A small offline pantry so the dashboard stays usable when FoodData Central is
 * unreachable, rate-limited, or missing an API key. Values are per 100 g and
 * approximate published SR Legacy entries.
 */
function food(id, description, brand, per100g, portions) {
  return {
    id: `offline-${id}`,
    fdcId: null,
    description,
    brand,
    dataType: 'Offline pantry',
    source: 'offline',
    per100g,
    portions: [{ label: '100 g', grams: 100 }, ...portions],
  };
}

/* per100g fields: energy kcal, protein g, fat g, carbs g, fiber g, sugars g,
   sodium mg, potassium mg, phosphorus mg, calcium mg, water g */
function n(energy, protein, fat, carbs, fiber, sugars, sodium, potassium, phosphorus, calcium, water) {
  return { energy, protein, fat, carbs, fiber, sugars, sodium, potassium, phosphorus, calcium, water };
}

export const OFFLINE_FOODS = [
  food('banana', 'Banana, raw', null, n(89, 1.1, 0.33, 22.8, 2.6, 12.2, 1, 358, 22, 5, 74.9), [
    { label: '1 medium (118 g)', grams: 118 },
    { label: '1 small (101 g)', grams: 101 },
  ]),
  food('apple', 'Apple, raw, with skin', null, n(52, 0.26, 0.17, 13.8, 2.4, 10.4, 1, 107, 11, 6, 85.6), [
    { label: '1 medium (182 g)', grams: 182 },
  ]),
  food('orange', 'Orange, raw, all commercial varieties', null, n(47, 0.94, 0.12, 11.8, 2.4, 9.4, 0, 181, 14, 40, 86.8), [
    { label: '1 medium (131 g)', grams: 131 },
  ]),
  food('grapes', 'Grapes, red or green, raw', null, n(69, 0.72, 0.16, 18.1, 0.9, 15.5, 2, 191, 20, 10, 80.5), [
    { label: '1 cup (151 g)', grams: 151 },
  ]),
  food('blueberries', 'Blueberries, raw', null, n(57, 0.74, 0.33, 14.5, 2.4, 10, 1, 77, 12, 6, 84.2), [
    { label: '1 cup (148 g)', grams: 148 },
  ]),
  food('white-rice', 'Rice, white, long-grain, cooked', null, n(130, 2.69, 0.28, 28.2, 0.4, 0.05, 1, 35, 43, 10, 68.4), [
    { label: '1 cup cooked (158 g)', grams: 158 },
    { label: '1/2 cup cooked (79 g)', grams: 79 },
  ]),
  food('brown-rice', 'Rice, brown, long-grain, cooked', null, n(123, 2.74, 0.97, 25.6, 1.6, 0.24, 4, 86, 103, 3, 70.3), [
    { label: '1 cup cooked (195 g)', grams: 195 },
  ]),
  food('pasta', 'Pasta, cooked, enriched', null, n(158, 5.8, 0.93, 30.9, 1.8, 0.56, 1, 44, 58, 7, 62.1), [
    { label: '1 cup cooked (140 g)', grams: 140 },
  ]),
  food('white-bread', 'Bread, white, commercially prepared', null, n(266, 9, 3.29, 49, 2.7, 5.7, 490, 115, 99, 260, 36.4), [
    { label: '1 slice (25 g)', grams: 25 },
    { label: '2 slices (50 g)', grams: 50 },
  ]),
  food('wheat-bread', 'Bread, whole-wheat, commercially prepared', null, n(254, 12.3, 3.55, 43.1, 6, 4.4, 450, 254, 212, 163, 38), [
    { label: '1 slice (32 g)', grams: 32 },
    { label: '2 slices (64 g)', grams: 64 },
  ]),
  food('oatmeal', 'Oatmeal, cooked with water, unenriched', null, n(71, 2.54, 1.52, 12, 1.7, 0.3, 4, 70, 77, 9, 83.6), [
    { label: '1 cup cooked (234 g)', grams: 234 },
  ]),
  food('cornflakes', 'Cereal, corn flakes, ready-to-eat', null, n(357, 7.5, 0.4, 84.1, 3, 8.4, 729, 118, 47, 4, 3.5), [
    { label: '1 cup (28 g)', grams: 28 },
  ]),
  food('potato', 'Potato, boiled, flesh only, without salt', null, n(87, 1.87, 0.1, 20.1, 1.8, 0.85, 4, 379, 44, 8, 77), [
    { label: '1 medium (167 g)', grams: 167 },
    { label: '1/2 cup diced (78 g)', grams: 78 },
  ]),
  food('sweet-potato', 'Sweet potato, baked in skin, without salt', null, n(90, 2.01, 0.15, 20.7, 3.3, 6.48, 36, 475, 54, 38, 75.8), [
    { label: '1 medium (114 g)', grams: 114 },
  ]),
  food('broccoli', 'Broccoli, cooked, boiled, drained, without salt', null, n(35, 2.38, 0.41, 7.2, 3.3, 1.39, 41, 293, 67, 40, 89.3), [
    { label: '1 cup chopped (156 g)', grams: 156 },
  ]),
  food('spinach', 'Spinach, raw', null, n(23, 2.86, 0.39, 3.63, 2.2, 0.42, 79, 558, 49, 99, 91.4), [
    { label: '1 cup (30 g)', grams: 30 },
  ]),
  food('carrot', 'Carrots, raw', null, n(41, 0.93, 0.24, 9.58, 2.8, 4.74, 69, 320, 35, 33, 88.3), [
    { label: '1 medium (61 g)', grams: 61 },
  ]),
  food('tomato', 'Tomatoes, red, ripe, raw', null, n(18, 0.88, 0.2, 3.89, 1.2, 2.63, 5, 237, 24, 10, 94.5), [
    { label: '1 medium (123 g)', grams: 123 },
  ]),
  food('lettuce', 'Lettuce, iceberg, raw', null, n(14, 0.9, 0.14, 2.97, 1.2, 1.97, 10, 141, 20, 18, 95.6), [
    { label: '1 cup shredded (72 g)', grams: 72 },
  ]),
  food('black-beans', 'Beans, black, mature seeds, cooked, without salt', null, n(132, 8.86, 0.54, 23.7, 8.7, 0.32, 1, 355, 140, 27, 65.7), [
    { label: '1/2 cup (86 g)', grams: 86 },
  ]),
  food('lentils', 'Lentils, mature seeds, cooked, without salt', null, n(116, 9.02, 0.38, 20.1, 7.9, 1.8, 2, 369, 180, 19, 69.6), [
    { label: '1/2 cup (99 g)', grams: 99 },
  ]),
  food('chicken-breast', 'Chicken breast, roasted, meat only', null, n(165, 31, 3.57, 0, 0, 0, 74, 256, 228, 15, 65), [
    { label: '3 oz (85 g)', grams: 85 },
    { label: '1 breast half (120 g)', grams: 120 },
  ]),
  food('ground-beef', 'Ground beef, 85% lean, cooked, pan-browned', null, n(250, 25.9, 15.4, 0, 0, 0, 76, 318, 200, 24, 58.1), [
    { label: '3 oz (85 g)', grams: 85 },
  ]),
  food('salmon', 'Salmon, Atlantic, farmed, cooked, dry heat', null, n(206, 22.1, 12.4, 0, 0, 0, 61, 384, 252, 15, 64.9), [
    { label: '3 oz (85 g)', grams: 85 },
  ]),
  food('tuna', 'Tuna, light, canned in water, drained', null, n(116, 25.5, 0.82, 0, 0, 0, 247, 237, 139, 11, 74.5), [
    { label: '1 can (142 g)', grams: 142 },
  ]),
  food('egg', 'Egg, whole, cooked, hard-boiled', null, n(155, 12.6, 10.6, 1.12, 0, 1.12, 124, 126, 172, 50, 74.6), [
    { label: '1 large (50 g)', grams: 50 },
    { label: '2 large (100 g)', grams: 100 },
  ]),
  food('tofu', 'Tofu, firm, prepared with calcium sulfate', null, n(144, 17.3, 8.72, 2.78, 2.3, 0.62, 14, 237, 190, 683, 69.8), [
    { label: '1/2 cup (126 g)', grams: 126 },
  ]),
  food('milk-2', 'Milk, reduced fat, 2% milkfat', null, n(50, 3.3, 1.98, 4.8, 0, 5.05, 47, 150, 92, 120, 89.3), [
    { label: '1 cup (244 g)', grams: 244 },
  ]),
  food('yogurt', 'Yogurt, plain, low fat', null, n(63, 5.25, 1.55, 7.04, 0, 7.04, 70, 234, 144, 183, 85.1), [
    { label: '1 cup (245 g)', grams: 245 },
  ]),
  food('cheddar', 'Cheese, cheddar', null, n(403, 24.9, 33.1, 1.28, 0, 0.52, 621, 98, 512, 721, 36.8), [
    { label: '1 slice (28 g)', grams: 28 },
  ]),
  food('cottage-cheese', 'Cheese, cottage, lowfat, 2% milkfat', null, n(81, 10.5, 2.27, 4.31, 0, 4.13, 308, 84, 143, 91, 81.2), [
    { label: '1/2 cup (113 g)', grams: 113 },
  ]),
  food('peanut-butter', 'Peanut butter, smooth style, with salt', null, n(588, 25.1, 50.4, 19.6, 6, 9.22, 429, 649, 335, 43, 1.2), [
    { label: '2 tbsp (32 g)', grams: 32 },
  ]),
  food('almonds', 'Nuts, almonds, raw', null, n(579, 21.2, 49.9, 21.6, 12.5, 4.35, 1, 733, 481, 269, 4.4), [
    { label: '1 oz (28 g)', grams: 28 },
  ]),
  food('avocado', 'Avocado, raw, all commercial varieties', null, n(160, 2, 14.7, 8.53, 6.7, 0.66, 7, 485, 52, 12, 73.2), [
    { label: '1/2 avocado (68 g)', grams: 68 },
  ]),
  food('potato-chips', 'Snacks, potato chips, salted', null, n(536, 7, 34.6, 52.9, 4.4, 0.27, 525, 1275, 165, 24, 2), [
    { label: '1 oz (28 g)', grams: 28 },
  ]),
  food('cola', 'Carbonated beverage, cola, regular', null, n(37, 0.07, 0.02, 9.6, 0, 8.94, 4, 2, 11, 2, 89.6), [
    { label: '1 can (368 g)', grams: 368 },
  ]),
  food('orange-juice', 'Orange juice, raw', null, n(45, 0.7, 0.2, 10.4, 0.2, 8.4, 1, 200, 17, 11, 88.3), [
    { label: '1 cup (248 g)', grams: 248 },
  ]),
  food('coffee', 'Coffee, brewed, prepared with tap water', null, n(1, 0.12, 0.02, 0, 0, 0, 2, 49, 3, 2, 99.4), [
    { label: '1 cup (237 g)', grams: 237 },
  ]),
  food('water', 'Water, bottled, plain', null, n(0, 0, 0, 0, 0, 0, 1, 0, 0, 3, 100), [
    { label: '1 cup (237 g)', grams: 237 },
    { label: '16.9 fl oz bottle (500 g)', grams: 500 },
  ]),
  food('pizza', 'Pizza, cheese topping, regular crust', null, n(268, 11.4, 9.7, 33.6, 2.3, 3.6, 598, 172, 191, 219, 42.6), [
    { label: '1 slice (107 g)', grams: 107 },
  ]),
];

/** Case-insensitive substring match over description and brand. */
export function searchOfflineFoods(query, limit = 20) {
  const q = String(query ?? '').trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/);
  return OFFLINE_FOODS.filter((item) => {
    const haystack = `${item.description} ${item.brand ?? ''}`.toLowerCase();
    return terms.every((term) => haystack.includes(term));
  }).slice(0, limit);
}
