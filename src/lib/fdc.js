import { NUTRIENT_DEFS, NUTRIENT_KEYS } from '../data/nutrients';

const API_BASE = 'https://api.nal.usda.gov/fdc/v1';

/**
 * DEMO_KEY works without signup but is throttled to roughly 30 requests per
 * hour per IP address. Put a free key from https://fdc.nal.usda.gov/api-key-signup
 * in `.env.local` as VITE_FDC_API_KEY for normal use.
 */
export const API_KEY = import.meta.env?.VITE_FDC_API_KEY?.trim() || 'DEMO_KEY';
export const USING_DEMO_KEY = API_KEY === 'DEMO_KEY';

export const DATA_TYPES = [
  'Foundation',
  'SR Legacy',
  'Survey (FNDDS)',
  'Branded',
];

export class FdcError extends Error {
  constructor(message, { kind = 'unknown', status = null } = {}) {
    super(message);
    this.name = 'FdcError';
    this.kind = kind;
    this.status = status;
  }
}

/** Build a lookup from every known FDC nutrient id/number to our internal key. */
const NUTRIENT_LOOKUP = (() => {
  const byId = new Map();
  const byNumber = new Map();
  for (const key of NUTRIENT_KEYS) {
    const def = NUTRIENT_DEFS[key];
    for (const id of def.fdcIds) if (!byId.has(id)) byId.set(id, key);
    for (const num of def.fdcNumbers) if (!byNumber.has(num)) byNumber.set(num, key);
  }
  return { byId, byNumber };
})();

/**
 * Read one nutrient row from any of the shapes FoodData Central returns:
 * search hits use flat `nutrientId`/`value`, detail responses nest the
 * definition under `nutrient` with the quantity in `amount`.
 */
function readNutrientRow(row) {
  const id = row.nutrientId ?? row.nutrient?.id ?? row.id;
  const number = String(row.nutrientNumber ?? row.nutrient?.number ?? '');
  const amount = row.value ?? row.amount ?? row.nutrient?.amount;
  const key = NUTRIENT_LOOKUP.byId.get(id) ?? NUTRIENT_LOOKUP.byNumber.get(number);
  if (!key) return null;
  const value = Number(amount);
  if (!Number.isFinite(value)) return null;
  return { key, value };
}

/**
 * Energy appears twice in some records (Atwater specific vs. general). Prefer
 * the first value seen and ignore duplicates so totals are not doubled.
 */
function extractPer100g(foodNutrients) {
  const out = {};
  for (const row of foodNutrients ?? []) {
    const parsed = readNutrientRow(row);
    if (!parsed) continue;
    if (out[parsed.key] == null) out[parsed.key] = parsed.value;
  }
  for (const key of NUTRIENT_KEYS) {
    if (out[key] == null) out[key] = 0;
  }
  return out;
}

function toTitle(text) {
  const str = String(text ?? '').trim();
  if (!str) return '';
  if (str === str.toUpperCase() && str.length > 3) {
    return str
      .toLowerCase()
      .replace(/(^|[\s(/-])([a-z])/g, (_, lead, ch) => lead + ch.toUpperCase());
  }
  return str;
}

const GRAMS_PER_OUNCE = 28.3495;
const MAX_PORTIONS = 12;

/**
 * Build a readable name for a `foodPortions` row. The measure unit is usually
 * the literal string "undetermined", in which case the human-readable text
 * lives in `modifier` instead ("cup, sliced", "large (8\" to 8-7/8\" long)").
 */
function portionLabel(portion) {
  if (portion.portionDescription) return portion.portionDescription;
  const unit = portion.measureUnit?.name;
  return [
    portion.amount,
    unit && unit !== 'undetermined' ? unit : null,
    portion.modifier,
  ]
    .filter(Boolean)
    .join(' ');
}

/**
 * Convert a branded label serving to grams. Milliliters are treated as grams,
 * which is close enough for the beverages this mostly affects.
 */
function servingSizeToGrams(amount, unit) {
  const normalized = String(unit ?? 'g').toLowerCase();
  if (normalized === 'oz') return amount * GRAMS_PER_OUNCE;
  return amount;
}

/**
 * Collect household portions. Foundation and SR Legacy foods expose
 * `foodPortions` (only on the detail endpoint — search hits come back with an
 * empty `foodMeasures`), while branded foods carry a single label serving.
 */
function extractPortions(food) {
  const portions = [{ label: '100 g', grams: 100 }];
  const seen = new Set(['100 g']);

  const push = (label, grams) => {
    const g = Number(grams);
    const text = String(label ?? '').trim();
    if (!text || !Number.isFinite(g) || g <= 0) return;
    const rounded = Math.round(g * 10) / 10;
    const full = `${toTitle(text)} (${rounded} g)`;
    if (seen.has(full)) return;
    seen.add(full);
    portions.push({ label: full, grams: rounded });
  };

  for (const measure of food.foodMeasures ?? []) {
    push(measure.disseminationText ?? measure.modifier, measure.gramWeight);
  }

  const sortedPortions = [...(food.foodPortions ?? [])].sort(
    (a, b) => (a.sequenceNumber ?? 0) - (b.sequenceNumber ?? 0),
  );
  for (const portion of sortedPortions) {
    push(portionLabel(portion), portion.gramWeight);
  }

  const servingSize = Number(food.servingSize);
  if (Number.isFinite(servingSize) && servingSize > 0) {
    const unit = String(food.servingSizeUnit ?? 'g').toLowerCase();
    push(
      food.householdServingFullText || `1 serving (${servingSize} ${unit})`,
      servingSizeToGrams(servingSize, unit),
    );
  }

  return portions.slice(0, MAX_PORTIONS);
}

/** Normalize an FDC food record into the shape the rest of the app consumes. */
export function normalizeFood(food) {
  const per100g = extractPer100g(food.foodNutrients);
  const portions = extractPortions(food);
  return {
    id: `fdc-${food.fdcId}`,
    fdcId: food.fdcId,
    description: toTitle(food.description),
    brand: toTitle(food.brandName || food.brandOwner || '') || null,
    category: food.foodCategory?.description ?? food.foodCategory ?? null,
    dataType: food.dataType ?? 'Unknown',
    source: 'fdc',
    per100g,
    portions,
  };
}

async function request(path, { signal } = {}) {
  const url = `${API_BASE}${path}${path.includes('?') ? '&' : '?'}api_key=${encodeURIComponent(API_KEY)}`;

  let response;
  try {
    response = await fetch(url, { signal });
  } catch (error) {
    if (error?.name === 'AbortError') throw error;
    throw new FdcError(
      'Could not reach FoodData Central. Check your network connection.',
      { kind: 'network' },
    );
  }

  if (response.status === 429) {
    throw new FdcError(
      USING_DEMO_KEY
        ? 'The shared DEMO_KEY hit its hourly rate limit. Add your own free API key to keep searching.'
        : 'FoodData Central rate limit reached. Wait a moment and try again.',
      { kind: 'rate-limit', status: 429 },
    );
  }
  if (response.status === 403 || response.status === 401) {
    throw new FdcError(
      'FoodData Central rejected the API key. Check VITE_FDC_API_KEY in your .env.local file.',
      { kind: 'auth', status: response.status },
    );
  }
  if (!response.ok) {
    throw new FdcError(`FoodData Central returned status ${response.status}.`, {
      kind: 'http',
      status: response.status,
    });
  }

  try {
    return await response.json();
  } catch {
    throw new FdcError('FoodData Central returned a response we could not read.', {
      kind: 'parse',
    });
  }
}

export async function searchFoods(query, { signal, pageSize = 20, dataTypes = DATA_TYPES } = {}) {
  const trimmed = String(query ?? '').trim();
  if (!trimmed) return [];

  const params = new URLSearchParams({
    query: trimmed,
    pageSize: String(pageSize),
    dataType: dataTypes.join(','),
    requireAllWords: 'true',
  });

  const data = await request(`/foods/search?${params.toString()}`, { signal });
  const foods = Array.isArray(data?.foods) ? data.foods : [];
  return foods.map(normalizeFood);
}

// Search hits carry no household portions, so the detail endpoint has to be
// called to offer anything beyond "100 g". Cache it: expanding the same food
// twice should not spend another request against the hourly quota.
const detailCache = new Map();

export async function getFood(fdcId, { signal } = {}) {
  const key = String(fdcId);
  if (detailCache.has(key)) return detailCache.get(key);

  const data = await request(`/food/${encodeURIComponent(fdcId)}?format=full`, { signal });
  const food = normalizeFood(data);
  detailCache.set(key, food);
  return food;
}
