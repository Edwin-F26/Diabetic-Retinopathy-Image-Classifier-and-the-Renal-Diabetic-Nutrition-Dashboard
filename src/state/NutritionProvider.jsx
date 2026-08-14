import { useCallback, useEffect, useMemo, useReducer } from 'react';
import { NutritionContext } from './nutritionContext';
import {
  createEntry,
  loadState,
  nutritionReducer,
  saveState,
} from './nutritionReducer';
import { TRACKED_METRICS } from '../data/nutrients';
import { statusForRatio } from '../data/targetPresets';
import { dailyBalance, loggingStreak } from '../lib/insights';
import {
  recentDateKeys,
  sumTotals,
  totalsByMeal,
} from '../lib/nutrition';

export default function NutritionProvider({ children }) {
  const [state, dispatch] = useReducer(nutritionReducer, undefined, loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const entries = useMemo(
    () => state.entriesByDate[state.selectedDate] ?? [],
    [state.entriesByDate, state.selectedDate],
  );

  const totals = useMemo(() => sumTotals(entries), [entries]);
  const mealTotals = useMemo(() => totalsByMeal(entries), [entries]);

  /**
   * One row per dashboard gauge: the running total, the user's limit, how far
   * along they are, and the resulting warning level.
   */
  const metrics = useMemo(
    () =>
      TRACKED_METRICS.map((metric) => {
        const limit = Number(state.targets[metric.key]) || 0;
        const value = Number(totals[metric.key]) || 0;
        const ratio = limit > 0 ? value / limit : 0;
        return {
          ...metric,
          value,
          limit,
          remaining: limit > 0 ? limit - value : null,
          ratio,
          status: limit > 0 ? statusForRatio(ratio) : 'ok',
        };
      }),
    [state.targets, totals],
  );

  const alerts = useMemo(
    () =>
      metrics
        .filter((metric) => metric.limit > 0 && metric.status !== 'ok')
        .sort((a, b) => b.ratio - a.ratio),
    [metrics],
  );

  const balance = useMemo(
    () => dailyBalance(metrics, entries.length > 0),
    [metrics, entries.length],
  );

  const streak = useMemo(
    () => loggingStreak(state.entriesByDate, state.selectedDate),
    [state.entriesByDate, state.selectedDate],
  );

  /** Seven-day history of each metric for the trend chart. */
  const weeklySeries = useMemo(() => {
    return recentDateKeys(state.selectedDate, 7).map((dateKey) => {
      const dayTotals = sumTotals(state.entriesByDate[dateKey] ?? []);
      return { dateKey, totals: dayTotals };
    });
  }, [state.entriesByDate, state.selectedDate]);

  const addFood = useCallback(({ food, meal, grams, portionLabel }) => {
    dispatch({
      type: 'add-entry',
      entry: createEntry({ food, meal, grams, portionLabel }),
    });
  }, []);

  const actions = useMemo(
    () => ({
      addFood,
      addEntries: (entryList, dateKey) =>
        dispatch({ type: 'replace-day', entries: entryList, dateKey }),
      removeEntry: (entryId) => dispatch({ type: 'remove-entry', entryId }),
      updatePortion: (entryId, grams, portionLabel) =>
        dispatch({ type: 'update-portion', entryId, grams, portionLabel }),
      moveEntry: (entryId, meal) => dispatch({ type: 'move-entry', entryId, meal }),
      clearDay: () => dispatch({ type: 'clear-day' }),
      selectDate: (dateKey) => dispatch({ type: 'select-date', dateKey }),
      applyPreset: (presetId) => dispatch({ type: 'apply-preset', presetId }),
      setTarget: (metricKey, value) =>
        dispatch({ type: 'set-target', metricKey, value }),
    }),
    [addFood],
  );

  const value = useMemo(
    () => ({
      selectedDate: state.selectedDate,
      presetId: state.presetId,
      targets: state.targets,
      entriesByDate: state.entriesByDate,
      entries,
      totals,
      mealTotals,
      metrics,
      alerts,
      balance,
      streak,
      weeklySeries,
      ...actions,
    }),
    [
      state.selectedDate,
      state.presetId,
      state.targets,
      state.entriesByDate,
      entries,
      totals,
      mealTotals,
      metrics,
      alerts,
      balance,
      streak,
      weeklySeries,
      actions,
    ],
  );

  return (
    <NutritionContext.Provider value={value}>{children}</NutritionContext.Provider>
  );
}
