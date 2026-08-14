import { useId, useState } from 'react';
import { TRACKED_METRICS } from '../data/nutrients';
import { TARGET_PRESETS, getPreset } from '../data/targetPresets';
import { useNutrition } from '../state/nutritionContext';
import { IconSliders, MetricIcon } from './Icons';

export default function TargetsPanel() {
  const { targets, presetId, applyPreset, setTarget } = useNutrition();
  const [expanded, setExpanded] = useState(false);
  const fieldId = useId();

  const isCustom = presetId === 'custom';
  const preset = isCustom ? null : getPreset(presetId);

  return (
    <section className="panel reveal" aria-labelledby="targets-heading">
      <header className="panel__header">
        <div className="panel__heading">
          <span className="panel__icon">
            <IconSliders size={18} />
          </span>
          <div>
            <h2 className="panel__title" id="targets-heading">
              Daily limits
            </h2>
            <p className="panel__subtitle">
              Start from a clinical profile, then adjust to match your care team.
            </p>
          </div>
        </div>
        <button
          type="button"
          className="button button--ghost"
          aria-expanded={expanded}
          onClick={() => setExpanded((open) => !open)}
        >
          {expanded ? 'Hide numbers' : 'Edit numbers'}
        </button>
      </header>

      <div className="field">
        <label className="field__label" htmlFor={`${fieldId}-preset`}>
          Clinical profile
        </label>
        <select
          id={`${fieldId}-preset`}
          className="select"
          value={presetId}
          onChange={(event) => applyPreset(event.target.value)}
        >
          {TARGET_PRESETS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
          {isCustom && <option value="custom">Custom limits</option>}
        </select>
        <p className="field__hint">
          {preset ? preset.summary : 'You have edited at least one limit by hand.'}
        </p>
      </div>

      {expanded && (
        <div className="target-grid">
          {TRACKED_METRICS.map((metric, index) => (
            <div
              key={metric.key}
              className="target-field reveal"
              style={{ '--delay': `${index * 35}ms` }}
            >
              <label className="target-field__label" htmlFor={`${fieldId}-${metric.key}`}>
                <span className="target-field__name">
                  <MetricIcon metricKey={metric.key} size={14} />
                  {metric.label}
                </span>
                <span className="target-field__unit">{metric.unit}</span>
              </label>
              <input
                id={`${fieldId}-${metric.key}`}
                className="input"
                type="number"
                min="0"
                step={metric.unit === 'mg' || metric.unit === 'mL' ? 50 : 5}
                value={targets[metric.key] ?? 0}
                onChange={(event) => setTarget(metric.key, event.target.value)}
              />
            </div>
          ))}
        </div>
      )}

      <p className="disclaimer">
        These defaults come from published KDOQI and ADA ranges for groups of
        patients. They are an educational starting point, not medical advice —
        confirm your own numbers with your nephrologist or dietitian.
      </p>
    </section>
  );
}
