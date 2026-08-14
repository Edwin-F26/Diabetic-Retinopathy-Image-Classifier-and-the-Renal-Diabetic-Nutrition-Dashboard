import { useNutrition } from '../state/nutritionContext';
import { formatAmount, formatPercent } from '../lib/format';
import { IconAlert, IconCheck, MetricIcon } from './Icons';

const ADVICE = {
  sodium:
    'Swap canned or cured items for fresh, and rinse canned vegetables to shed some of the added salt.',
  potassium:
    'High-potassium picks today are usually potatoes, tomatoes, bananas, beans, and dairy. Leaching or double-boiling potatoes cuts a meaningful share.',
  phosphorus:
    'Watch for “PHOS” on ingredient lists — additive phosphorus is absorbed far more completely than the phosphorus in whole foods.',
  protein:
    'Trim portion sizes of meat, dairy, and legumes rather than cutting a whole food group.',
  fluid:
    'Soups, ice, gelatin, and juicy fruit all count toward fluid. Ice chips and sour candy help with thirst.',
  netCarbs:
    'Shift some carbohydrate toward higher-fiber choices, or move a portion into a later meal to flatten the curve.',
  glycemicLoad:
    'Pairing carbohydrate with protein or fat, and choosing less-processed starches, lowers the glycemic load of the same gram count.',
  energy: 'Consider whether the extra calories are coming from drinks or snacks.',
};

const STATUS_HEADLINE = {
  caution: 'Approaching',
  warning: 'Nearly at',
  over: 'Over',
};

function PanelShell({ children, tone = '' }) {
  return (
    <section className={`panel reveal ${tone}`} aria-labelledby="alerts-heading">
      {children}
    </section>
  );
}

export default function AlertsPanel() {
  const { alerts, entries } = useNutrition();

  if (entries.length === 0) {
    return (
      <PanelShell tone="panel--calm">
        <div className="panel__heading">
          <span className="panel__icon">
            <IconAlert size={18} />
          </span>
          <div>
            <h2 className="panel__title" id="alerts-heading">
              Warnings
            </h2>
            <p className="panel__subtitle">
              Nothing to warn about yet — log a food to start tracking.
            </p>
          </div>
        </div>
      </PanelShell>
    );
  }

  if (alerts.length === 0) {
    return (
      <PanelShell tone="panel--calm">
        <div className="panel__heading">
          <span className="panel__icon panel__icon--ok">
            <IconCheck size={18} />
          </span>
          <div>
            <h2 className="panel__title" id="alerts-heading">
              All clear
            </h2>
            <p className="panel__subtitle">
              Every tracked metric is below 70% of its daily limit so far.
            </p>
          </div>
        </div>
      </PanelShell>
    );
  }

  return (
    <PanelShell>
      <header className="panel__header">
        <div className="panel__heading">
          <span className="panel__icon panel__icon--warn">
            <IconAlert size={18} />
          </span>
          <div>
            <h2 className="panel__title" id="alerts-heading">
              Warnings
            </h2>
            <p className="panel__subtitle">
              {alerts.length} metric{alerts.length === 1 ? '' : 's'} need attention
              today.
            </p>
          </div>
        </div>
      </header>

      <ul className="alert-list" role="list">
        {alerts.map((metric, index) => (
          <li
            key={metric.key}
            className={`alert alert--${metric.status} reveal`}
            style={{ '--delay': `${index * 70}ms` }}
            role="alert"
          >
            <div className="alert__head">
              <span className="alert__icon">
                <MetricIcon metricKey={metric.key} size={16} />
              </span>
              <p className="alert__title">
                {STATUS_HEADLINE[metric.status]} your {metric.label.toLowerCase()}{' '}
                limit
              </p>
              <span className="alert__badge">{formatPercent(metric.ratio)}</span>
            </div>
            <p className="alert__detail">
              {formatAmount(metric.value, metric.unit)} {metric.unit} logged against
              a {formatAmount(metric.limit, metric.unit)} {metric.unit} limit
              {metric.remaining >= 0
                ? ` — ${formatAmount(metric.remaining, metric.unit)} ${metric.unit} left.`
                : ` — ${formatAmount(Math.abs(metric.remaining), metric.unit)} ${metric.unit} over.`}
            </p>
            {ADVICE[metric.key] && <p className="alert__advice">{ADVICE[metric.key]}</p>}
          </li>
        ))}
      </ul>
    </PanelShell>
  );
}
