import { useMemo } from 'react';
import { MEAL_LABELS, topContributors } from '../lib/nutrition';
import { formatAmount, formatPercent } from '../lib/format';
import { MealIcon, MetricIcon } from './Icons';

export default function ContributorList({ metric, entries }) {
  const contributors = useMemo(
    () => topContributors(entries, metric.key, 5),
    [entries, metric.key],
  );

  const total = metric.value || 0;

  return (
    <div className="contributors">
      <h3 className="contributors__title">
        <span className="contributors__title-icon">
          <MetricIcon metricKey={metric.key} size={16} />
        </span>
        Biggest sources of {metric.label.toLowerCase()} today
      </h3>

      {contributors.length === 0 ? (
        <p className="contributors__empty">
          Nothing logged yet contributes {metric.label.toLowerCase()}.
        </p>
      ) : (
        <ol className="contributors__list">
          {contributors.map((row, index) => {
            const share = total > 0 ? row.value / total : 0;
            return (
              <li
                key={row.id}
                className="contributors__row reveal"
                style={{ '--delay': `${index * 55}ms` }}
              >
                <div className="contributors__text">
                  <span className="contributors__name">{row.name}</span>
                  <span className="contributors__meal">
                    <MealIcon meal={row.meal} size={13} />
                    {MEAL_LABELS[row.meal]}
                  </span>
                </div>
                <div className="contributors__bar" aria-hidden>
                  <span style={{ width: `${Math.min(share, 1) * 100}%` }} />
                </div>
                <span className="contributors__value">
                  {formatAmount(row.value, metric.unit)} {metric.unit}
                  <span className="contributors__share">{formatPercent(share)}</span>
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
