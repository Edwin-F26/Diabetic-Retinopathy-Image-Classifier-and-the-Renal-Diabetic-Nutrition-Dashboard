import { ALERT_THRESHOLDS, STATUS_LABELS } from '../data/targetPresets';
import useCountUp from '../hooks/useCountUp';
import { formatAmount, formatPercent } from '../lib/format';
import { MetricIcon } from './Icons';

/**
 * A single metric's progress toward its daily limit. The caution and warning
 * thresholds are drawn on the track so the bar reads as a clinical range rather
 * than a plain percentage.
 *
 * The whole card is the selection control, so everything inside it is a span:
 * a button may only contain phrasing content.
 */
export default function NutrientGauge({ metric, onSelect, isSelected, index = 0 }) {
  const { label, unit, value, limit, ratio, status, remaining, blurb } = metric;
  const animatedValue = useCountUp(value);
  const animatedRatio = limit > 0 ? animatedValue / limit : 0;
  const fill = Math.min(animatedRatio, 1) * 100;
  const isOver = animatedRatio > 1;

  return (
    <article
      className={`gauge gauge--${status}${isSelected ? ' gauge--selected' : ''} reveal`}
      style={{ '--delay': `${index * 45}ms` }}
    >
      <button
        type="button"
        className="gauge__button"
        onClick={() => onSelect(metric.key)}
        aria-pressed={isSelected}
      >
        <span className="gauge__head">
          <span className="gauge__icon">
            <MetricIcon metricKey={metric.key} size={18} />
          </span>
          <span className="gauge__label">{label}</span>
          <span className={`gauge__status gauge__status--${status}`}>
            {limit > 0 ? STATUS_LABELS[status] : 'No limit'}
          </span>
        </span>

        <span className="gauge__amount">
          <span className="gauge__value">{formatAmount(animatedValue, unit)}</span>
          <span className="gauge__unit">{unit}</span>
          {limit > 0 && (
            <span className="gauge__limit">
              / {formatAmount(limit, unit)}
            </span>
          )}
        </span>

        <span
          className={`gauge__track gauge__track--${status}`}
          role="progressbar"
          aria-valuenow={Math.round(value)}
          aria-valuemin={0}
          aria-valuemax={Math.round(limit) || 100}
          aria-label={`${label}: ${formatAmount(value, unit)} of ${formatAmount(limit, unit)} ${unit}`}
        >
          <span
            className={`gauge__fill${isOver ? ' gauge__fill--over' : ''}`}
            style={{ width: `${fill}%` }}
          />
          <span
            className="gauge__tick"
            style={{ left: `${ALERT_THRESHOLDS.caution * 100}%` }}
            aria-hidden
          />
          <span
            className="gauge__tick gauge__tick--warn"
            style={{ left: `${ALERT_THRESHOLDS.warning * 100}%` }}
            aria-hidden
          />
        </span>

        <span className="gauge__footer">
          {limit > 0 ? (
            <>
              <span className="gauge__percent">{formatPercent(ratio)}</span>
              <span className="gauge__remaining">
                {remaining >= 0
                  ? `${formatAmount(remaining, unit)} ${unit} left`
                  : `${formatAmount(Math.abs(remaining), unit)} ${unit} over`}
              </span>
            </>
          ) : (
            <span className="gauge__remaining">Set a limit to track this.</span>
          )}
        </span>

        {blurb && <span className="gauge__blurb">{blurb}</span>}
      </button>
    </article>
  );
}
