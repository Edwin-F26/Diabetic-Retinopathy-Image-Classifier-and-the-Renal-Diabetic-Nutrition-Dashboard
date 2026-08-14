import { useState } from 'react';
import { CONCERN_LABELS } from '../data/nutrients';
import { useNutrition } from '../state/nutritionContext';
import NutrientGauge from './NutrientGauge';
import ContributorList from './ContributorList';
import { IconTarget } from './Icons';

const CONCERN_ORDER = ['renal', 'diabetes', 'general'];

export default function DailyTotals() {
  const { metrics, entries } = useNutrition();
  const [selectedMetric, setSelectedMetric] = useState('potassium');

  const grouped = CONCERN_ORDER.map((concern) => ({
    concern,
    label: CONCERN_LABELS[concern],
    items: metrics.filter((metric) => metric.concern === concern),
  })).filter((group) => group.items.length > 0);

  const active = metrics.find((metric) => metric.key === selectedMetric);

  return (
    <section className="panel reveal" aria-labelledby="daily-totals-heading">
      <header className="panel__header">
        <div className="panel__heading">
          <span className="panel__icon">
            <IconTarget size={18} />
          </span>
          <div>
            <h2 className="panel__title" id="daily-totals-heading">
              Daily progress
            </h2>
            <p className="panel__subtitle">
              Tap any metric to see which foods are driving it.
            </p>
          </div>
        </div>
      </header>

      {grouped.map((group) => (
        <div key={group.concern} className="metric-group">
          <h3 className="metric-group__title">
            <span className={`metric-group__dot metric-group__dot--${group.concern}`} />
            {group.label}
          </h3>
          <div className="gauge-grid">
            {group.items.map((metric, index) => (
              <NutrientGauge
                key={metric.key}
                metric={metric}
                index={index}
                isSelected={metric.key === selectedMetric}
                onSelect={setSelectedMetric}
              />
            ))}
          </div>
        </div>
      ))}

      {active && <ContributorList metric={active} entries={entries} />}
    </section>
  );
}
