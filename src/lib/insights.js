import { shiftDateKey } from './nutrition';

/**
 * Where a metric starts costing points. Nothing is penalised below 90% of the
 * limit, and a metric is fully penalised once it reaches 150%.
 */
const PENALTY_FLOOR = 0.9;
const PENALTY_CEILING = 1.5;

function penaltyFor(ratio) {
  const span = PENALTY_CEILING - PENALTY_FLOOR;
  return Math.min(1, Math.max(0, (ratio - PENALTY_FLOOR) / span));
}

/**
 * A single 0–100 read on the day: 100 while everything sits comfortably inside
 * its limit, falling as metrics push past 90% and bottoming out when several
 * are badly over. Returns null when there is nothing to score yet.
 */
export function dailyBalance(metrics, hasEntries) {
  const limited = metrics.filter((metric) => metric.limit > 0);
  if (!hasEntries || limited.length === 0) return null;

  const penalty =
    limited.reduce((sum, metric) => sum + penaltyFor(metric.ratio), 0) / limited.length;

  return {
    score: Math.round((1 - penalty) * 100),
    withinLimit: limited.filter((metric) => metric.ratio <= 1).length,
    tracked: limited.length,
  };
}

export function balanceTone(score) {
  if (score >= 85) return 'ok';
  if (score >= 65) return 'caution';
  if (score >= 45) return 'warning';
  return 'over';
}

const BALANCE_MESSAGES = {
  ok: 'Everything is comfortably inside its limit.',
  caution: 'A couple of metrics are creeping up. Worth a look before your next meal.',
  warning: 'Several limits are close or crossed. Lighter choices from here.',
  over: 'Multiple limits are well past target today.',
};

export function balanceMessage(score) {
  return BALANCE_MESSAGES[balanceTone(score)];
}

/**
 * Consecutive days ending at `dateKey` that have at least one logged item. An
 * empty current day does not break the run — the day is not over yet — so the
 * count simply starts from the day before.
 */
export function loggingStreak(entriesByDate, dateKey) {
  const hasEntries = (key) => (entriesByDate[key]?.length ?? 0) > 0;

  let cursor = hasEntries(dateKey) ? dateKey : shiftDateKey(dateKey, -1);
  let streak = 0;

  while (hasEntries(cursor) && streak < 400) {
    streak += 1;
    cursor = shiftDateKey(cursor, -1);
  }

  return streak;
}
