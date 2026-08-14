import { DEFAULT_PRESET_ID, getPreset } from '../data/targetPresets';
import { nutrientsForPortion, toDateKey } from '../lib/nutrition';

export const STORAGE_KEY = 'renal-diabetic-dashboard/v1';

export function createInitialState() {
  const preset = getPreset(DEFAULT_PRESET_ID);
  return {
    selectedDate: toDateKey(),
    presetId: preset.id,
    targets: { ...preset.targets },
    entriesByDate: {},
  };
}

/**
 * Rehydrate from localStorage, tolerating a missing, corrupt, or partial
 * payload — a bad stored value should never stop the app from starting.
 */
export function loadState() {
  const base = createInitialState();
  if (typeof window === 'undefined') return base;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const saved = JSON.parse(raw);
    return {
      ...base,
      selectedDate: toDateKey(),
      presetId: saved.presetId ?? base.presetId,
      targets: { ...base.targets, ...(saved.targets ?? {}) },
      entriesByDate:
        saved.entriesByDate && typeof saved.entriesByDate === 'object'
          ? saved.entriesByDate
          : {},
    };
  } catch {
    return base;
  }
}

export function saveState(state) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        presetId: state.presetId,
        targets: state.targets,
        entriesByDate: state.entriesByDate,
      }),
    );
  } catch {
    // Storage can be full or blocked in private mode; the session still works.
  }
}

let entryCounter = 0;
function createEntryId() {
  entryCounter += 1;
  return `entry-${Date.now().toString(36)}-${entryCounter}`;
}

/** Build a log entry from a normalized food plus the chosen portion. */
export function createEntry({ food, meal, grams, portionLabel }) {
  const safeGrams = Math.max(0, Number(grams) || 0);
  return {
    id: createEntryId(),
    fdcId: food.fdcId ?? null,
    description: food.description,
    brand: food.brand ?? null,
    dataType: food.dataType ?? null,
    source: food.source ?? 'fdc',
    meal,
    grams: safeGrams,
    portionLabel: portionLabel ?? `${safeGrams} g`,
    per100g: food.per100g,
    nutrients: nutrientsForPortion(food, safeGrams),
    loggedAt: new Date().toISOString(),
  };
}

function withEntriesForDate(state, dateKey, updater) {
  const current = state.entriesByDate[dateKey] ?? [];
  const next = updater(current);
  const entriesByDate = { ...state.entriesByDate };
  if (next.length === 0) {
    delete entriesByDate[dateKey];
  } else {
    entriesByDate[dateKey] = next;
  }
  return { ...state, entriesByDate };
}

export function nutritionReducer(state, action) {
  switch (action.type) {
    case 'select-date':
      return { ...state, selectedDate: action.dateKey };

    case 'add-entry': {
      const dateKey = action.dateKey ?? state.selectedDate;
      return withEntriesForDate(state, dateKey, (entries) => [
        ...entries,
        action.entry,
      ]);
    }

    case 'remove-entry':
      return withEntriesForDate(state, action.dateKey ?? state.selectedDate, (entries) =>
        entries.filter((entry) => entry.id !== action.entryId),
      );

    case 'update-portion': {
      const dateKey = action.dateKey ?? state.selectedDate;
      return withEntriesForDate(state, dateKey, (entries) =>
        entries.map((entry) => {
          if (entry.id !== action.entryId) return entry;
          const grams = Math.max(0, Number(action.grams) || 0);
          return {
            ...entry,
            grams,
            portionLabel: action.portionLabel ?? `${Math.round(grams)} g`,
            nutrients: nutrientsForPortion(
              { per100g: entry.per100g, description: entry.description, brand: entry.brand },
              grams,
            ),
          };
        }),
      );
    }

    case 'move-entry':
      return withEntriesForDate(state, action.dateKey ?? state.selectedDate, (entries) =>
        entries.map((entry) =>
          entry.id === action.entryId ? { ...entry, meal: action.meal } : entry,
        ),
      );

    case 'clear-day':
      return withEntriesForDate(state, action.dateKey ?? state.selectedDate, () => []);

    case 'replace-day': {
      const dateKey = action.dateKey ?? state.selectedDate;
      return withEntriesForDate(state, dateKey, () => action.entries);
    }

    case 'apply-preset': {
      const preset = getPreset(action.presetId);
      return { ...state, presetId: preset.id, targets: { ...preset.targets } };
    }

    case 'set-target': {
      const value = Number(action.value);
      return {
        ...state,
        // Editing any single limit means the numbers no longer match a preset.
        presetId: 'custom',
        targets: {
          ...state.targets,
          [action.metricKey]: Number.isFinite(value) && value > 0 ? value : 0,
        },
      };
    }

    default:
      return state;
  }
}
