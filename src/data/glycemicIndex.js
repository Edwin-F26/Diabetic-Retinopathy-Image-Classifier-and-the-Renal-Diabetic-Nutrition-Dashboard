/**
 * FoodData Central publishes no glycemic index, so glycemic load here is an
 * estimate: match the food description against a keyword table of published
 * average GI values, then weight by the net carbohydrate in the portion.
 *
 * Matching is done on word tokens rather than raw substrings because USDA
 * descriptions are comma-inverted — "brown rice" has to match "Rice, brown,
 * long-grain, cooked", and a naive substring test would let "pea" match
 * "Peanut butter". Ordering still matters: the first matching rule wins, so
 * specific rules must come before broad ones.
 */
const GI_RULES = [
  // Composite dishes first, before their component keywords can claim them.
  { match: ['pizza'], gi: 60 },
  { match: ['almond', 'peanut', 'walnut', 'cashew', 'pecan', 'pistachio', 'hazelnut'], gi: 15 },

  // Protein and fat foods carry essentially no glycemic load.
  { match: ['chicken', 'turkey', 'beef', 'pork', 'lamb', 'veal', 'bacon', 'sausage'], gi: 0 },
  { match: ['fish', 'salmon', 'tuna', 'cod', 'tilapia', 'shrimp', 'crab'], gi: 0 },
  { match: ['egg', 'oil', 'butter', 'margarine', 'lard', 'mayonnaise'], gi: 0 },
  { match: ['cheese', 'cheddar', 'mozzarella'], gi: 0 },
  { match: ['tofu', 'tempeh'], gi: 15 },

  // Grains and starches.
  { match: ['rice cake'], gi: 82 },
  { match: ['brown rice'], gi: 68 },
  { match: ['basmati'], gi: 58 },
  { match: ['white rice'], gi: 73 },
  { match: ['rice'], gi: 70 },
  { match: ['whole wheat bread', 'whole grain bread', 'rye bread'], gi: 71 },
  { match: ['white bread', 'bagel', 'baguette'], gi: 75 },
  { match: ['tortilla'], gi: 52 },
  { match: ['bread'], gi: 72 },
  { match: ['pasta', 'spaghetti', 'macaroni', 'noodle'], gi: 49 },
  { match: ['quinoa'], gi: 53 },
  { match: ['couscous'], gi: 65 },
  { match: ['barley'], gi: 28 },
  { match: ['oat', 'oatmeal', 'porridge'], gi: 55 },
  { match: ['cornflakes', 'corn flakes'], gi: 81 },
  { match: ['cereal', 'granola', 'muesli'], gi: 66 },
  { match: ['cracker', 'pretzel'], gi: 70 },

  // Vegetables and legumes.
  { match: ['sweet potato', 'yam'], gi: 63 },
  { match: ['mashed potato', 'french fries', 'fries'], gi: 82 },
  { match: ['potato chip', 'chips'], gi: 56 },
  { match: ['potato'], gi: 78 },
  { match: ['corn', 'maize'], gi: 52 },
  { match: ['peas'], gi: 51 },
  { match: ['carrot'], gi: 39 },
  { match: ['bean', 'chickpea', 'garbanzo'], gi: 28 },
  { match: ['lentil'], gi: 32 },
  { match: [
    'spinach', 'broccoli', 'lettuce', 'kale', 'cabbage', 'cauliflower',
    'cucumber', 'zucchini', 'pepper', 'celery', 'asparagus', 'mushroom',
    'onion', 'tomato', 'green bean',
  ], gi: 15 },

  // Drinks, before fruit so that juices are not scored as whole fruit.
  { match: ['juice'], gi: 50 },
  { match: ['cola', 'soda', 'soft drink', 'energy drink'], gi: 63 },
  { match: ['beer'], gi: 66 },
  { match: ['ice cream'], gi: 57 },
  { match: ['milk', 'yogurt', 'yoghurt'], gi: 37 },
  { match: ['water', 'coffee', 'tea', 'diet'], gi: 0 },

  // Fruit.
  { match: ['watermelon'], gi: 76 },
  { match: ['pineapple'], gi: 59 },
  { match: ['banana', 'mango'], gi: 51 },
  { match: ['grape'], gi: 53 },
  { match: ['apple', 'pear'], gi: 38 },
  { match: ['orange', 'peach', 'plum', 'apricot'], gi: 42 },
  { match: ['berry', 'berries', 'strawberr', 'blueberr', 'raspberr'], gi: 40 },
  { match: ['cherry', 'cherries'], gi: 22 },
  { match: ['date', 'raisin', 'prune'], gi: 62 },

  // Sweets and snacks.
  { match: ['honey'], gi: 61 },
  { match: ['sugar', 'syrup', 'candy', 'jam', 'jelly'], gi: 68 },
  { match: ['chocolate'], gi: 45 },
  { match: ['cookie', 'biscuit', 'cake', 'donut', 'doughnut', 'muffin', 'pastry', 'pie'], gi: 70 },
];

const DEFAULT_GI = 50;

function tokenize(text) {
  return String(text ?? '')
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter(Boolean);
}

/**
 * A keyword matches when every one of its words has a description word that
 * starts with it, which absorbs plurals ("beans" for "bean") without matching
 * unrelated words that merely contain the letters.
 */
function keywordMatches(keyword, tokens) {
  return keyword
    .split(' ')
    .every((part) => tokens.some((token) => token.startsWith(part)));
}

/**
 * Estimated average glycemic index for a food description, on the 0–100 glucose
 * scale. Falls back to a mid-range value when nothing matches.
 */
export function estimateGlycemicIndex(description) {
  const tokens = tokenize(description);
  if (tokens.length === 0) return DEFAULT_GI;
  for (const rule of GI_RULES) {
    if (rule.match.some((keyword) => keywordMatches(keyword, tokens))) {
      return rule.gi;
    }
  }
  return DEFAULT_GI;
}

/** Glycemic load for a portion: GI weighted by its net carbohydrate in grams. */
export function glycemicLoad(glycemicIndex, netCarbGrams) {
  const gi = Number(glycemicIndex) || 0;
  const carbs = Number(netCarbGrams) || 0;
  if (gi <= 0 || carbs <= 0) return 0;
  return (gi * carbs) / 100;
}
