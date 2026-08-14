/** Round a metric to a sensible precision for its unit and format it. */
export function formatAmount(value, unit) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  if (unit === 'mg' || unit === 'mL' || unit === 'kcal') {
    return Math.round(n).toLocaleString('en-US');
  }
  if (Math.abs(n) >= 100) return Math.round(n).toLocaleString('en-US');
  if (Math.abs(n) >= 10) return n.toFixed(1);
  return n.toFixed(1).replace(/\.0$/, '');
}

export function formatWithUnit(value, unit) {
  return `${formatAmount(value, unit)} ${unit}`;
}

export function formatPercent(ratio) {
  const n = Number(ratio);
  if (!Number.isFinite(n)) return '0%';
  return `${Math.round(n * 100)}%`;
}

export function formatGrams(grams) {
  const n = Number(grams);
  if (!Number.isFinite(n)) return '—';
  return n >= 10 ? `${Math.round(n)} g` : `${n.toFixed(1)} g`;
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
