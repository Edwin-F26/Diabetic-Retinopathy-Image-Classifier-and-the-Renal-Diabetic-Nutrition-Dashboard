import { useEffect, useId, useMemo, useState } from 'react';
import { getFood } from '../lib/fdc';
import { nutrientsForPortion, pickDefaultPortion } from '../lib/nutrition';
import { formatAmount } from '../lib/format';
import { IconPlus, MetricIcon } from './Icons';

const PREVIEW_METRICS = [
  { key: 'energy', label: 'Energy', unit: 'kcal' },
  { key: 'netCarbs', label: 'Net carbs', unit: 'g' },
  { key: 'glycemicLoad', label: 'Est. GL', unit: '' },
  { key: 'sodium', label: 'Sodium', unit: 'mg' },
  { key: 'potassium', label: 'Potassium', unit: 'mg' },
  { key: 'phosphorus', label: 'Phosphorus', unit: 'mg' },
];

/** Search results ship without household portions, so they have to be fetched. */
function needsDetail(food) {
  return food.source === 'fdc' && food.fdcId != null && food.portions.length <= 1;
}

export default function PortionPicker({ food, onLog, onCancel }) {
  const fieldId = useId();
  const [detail, setDetail] = useState(null);
  const [portionLabel, setPortionLabel] = useState(null);
  const [servings, setServings] = useState('1');

  useEffect(() => {
    if (!needsDetail(food)) return undefined;

    const controller = new AbortController();
    let cancelled = false;

    getFood(food.fdcId, { signal: controller.signal })
      .then((full) => {
        if (!cancelled) setDetail({ id: food.id, food: full });
      })
      .catch((err) => {
        // Portions are a nicety; on failure the 100 g option still works.
        if (!cancelled && err?.name !== 'AbortError') {
          setDetail({ id: food.id, food: null });
        }
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [food]);

  const resolved = detail?.id === food.id && detail.food ? detail.food : food;
  const isLoadingPortions = needsDetail(food) && detail?.id !== food.id;

  const defaultPortion = useMemo(
    () => pickDefaultPortion(resolved.portions),
    [resolved.portions],
  );

  const selectedPortion =
    resolved.portions.find((p) => p.label === portionLabel) ?? defaultPortion;

  const servingCount = Number(servings);
  const validServings = Number.isFinite(servingCount) && servingCount > 0;
  const grams = validServings ? selectedPortion.grams * servingCount : 0;

  const preview = useMemo(
    () => nutrientsForPortion(resolved, grams),
    [resolved, grams],
  );

  const logLabel = validServings
    ? `${servingCount === 1 ? '' : `${servingCount} × `}${selectedPortion.label}`
    : selectedPortion.label;

  return (
    <div className="portion">
      <div className="portion__controls">
        <div className="field field--inline">
          <label className="field__label" htmlFor={`${fieldId}-portion`}>
            Portion
            {isLoadingPortions && (
              <span className="field__loading"> loading measures…</span>
            )}
          </label>
          <select
            id={`${fieldId}-portion`}
            className="select"
            value={selectedPortion.label}
            onChange={(event) => setPortionLabel(event.target.value)}
          >
            {resolved.portions.map((portion) => (
              <option key={portion.label} value={portion.label}>
                {portion.label}
              </option>
            ))}
          </select>
        </div>

        <div className="field field--inline field--narrow">
          <label className="field__label" htmlFor={`${fieldId}-servings`}>
            Servings
          </label>
          <input
            id={`${fieldId}-servings`}
            className="input"
            type="number"
            min="0.25"
            step="0.25"
            inputMode="decimal"
            value={servings}
            onChange={(event) => setServings(event.target.value)}
          />
        </div>

        <p className="portion__weight">
          = <strong>{formatAmount(grams, 'g')} g</strong>
        </p>
      </div>

      <dl className="portion__preview">
        {PREVIEW_METRICS.map((metric, index) => (
          <div
            key={metric.key}
            className="portion__preview-item reveal"
            style={{ '--delay': `${index * 35}ms` }}
          >
            <dt>
              <span className="portion__preview-icon">
                <MetricIcon metricKey={metric.key} size={13} />
              </span>
              {metric.label}
            </dt>
            <dd>
              {formatAmount(preview[metric.key], metric.unit)}
              {metric.unit && <span className="unit"> {metric.unit}</span>}
            </dd>
          </div>
        ))}
      </dl>

      <div className="portion__actions">
        <button
          type="button"
          className="button button--primary"
          disabled={!validServings || grams <= 0}
          onClick={() => onLog({ food: resolved, grams, portionLabel: logLabel })}
        >
          <IconPlus size={16} />
          Add to log
        </button>
        <button type="button" className="button button--ghost" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
