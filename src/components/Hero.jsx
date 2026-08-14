import BalanceRing from './BalanceRing';
import {
  IconChevronLeft,
  IconChevronRight,
  IconSparkles,
  MetricIcon,
} from './Icons';
import { balanceMessage } from '../lib/insights';
import { formatAmount, formatPercent } from '../lib/format';
import { formatDateKey, shiftDateKey, toDateKey } from '../lib/nutrition';
import { useNutrition } from '../state/nutritionContext';

const PILL_KEYS = ['energy', 'netCarbs', 'sodium', 'potassium', 'phosphorus'];

export default function Hero() {
  const { metrics, entries, balance, streak, selectedDate, selectDate } =
    useNutrition();

  const today = toDateKey();
  const isToday = selectedDate === today;
  const pills = PILL_KEYS.map((key) =>
    metrics.find((metric) => metric.key === key),
  ).filter(Boolean);

  const tightest = [...metrics]
    .filter((metric) => metric.limit > 0)
    .sort((a, b) => b.ratio - a.ratio)[0];

  return (
    <section className="hero reveal" aria-label="Today at a glance">
      <div className="hero__glow" aria-hidden />

      <div className="hero__top">
        <div className="datenav">
          <button
            type="button"
            className="datenav__button"
            onClick={() => selectDate(shiftDateKey(selectedDate, -1))}
            aria-label="Previous day"
          >
            <IconChevronLeft size={18} />
          </button>

          <div className="datenav__label">
            <span className="datenav__date">
              {formatDateKey(selectedDate, { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
            {isToday && <span className="datenav__badge">Today</span>}
          </div>

          <button
            type="button"
            className="datenav__button"
            onClick={() => selectDate(shiftDateKey(selectedDate, 1))}
            disabled={selectedDate >= today}
            aria-label="Next day"
          >
            <IconChevronRight size={18} />
          </button>
        </div>

        <div className="hero__badges">
          {streak > 0 && (
            <span className="badge badge--streak">
              <IconSparkles size={15} />
              {streak}-day streak
            </span>
          )}
          {!isToday && (
            <button
              type="button"
              className="badge badge--action"
              onClick={() => selectDate(today)}
            >
              Jump to today
            </button>
          )}
        </div>
      </div>

      <div className="hero__body">
        <BalanceRing
          score={balance?.score ?? null}
          label="Daily balance"
          caption={
            balance
              ? `${balance.withinLimit} of ${balance.tracked} limits on track`
              : 'Nothing logged yet'
          }
        />

        <div className="hero__copy">
          <h1 className="hero__title">
            {balance ? balanceMessage(balance.score) : 'Let’s build today’s plate.'}
          </h1>
          <p className="hero__lede">
            {balance && tightest ? (
              <>
                <strong>{tightest.label}</strong> is your tightest number right
                now at {formatPercent(tightest.ratio)} of its limit
                {tightest.remaining >= 0
                  ? `, leaving ${formatAmount(tightest.remaining, tightest.unit)} ${tightest.unit} for the rest of the day.`
                  : `, already ${formatAmount(Math.abs(tightest.remaining), tightest.unit)} ${tightest.unit} over.`}
              </>
            ) : (
              <>
                Search a food on the right to start tracking carbohydrate,
                sodium, potassium, and phosphorus against your daily limits.
              </>
            )}
          </p>

          <ul className="hero__pills">
            {pills.map((metric, index) => (
              <li
                key={metric.key}
                className={`pill pill--${metric.status} reveal`}
                style={{ '--delay': `${index * 60}ms` }}
              >
                <span className="pill__icon">
                  <MetricIcon metricKey={metric.key} size={17} />
                </span>
                <span className="pill__text">
                  <span className="pill__label">{metric.label}</span>
                  <span className="pill__value">
                    {formatAmount(metric.value, metric.unit)}
                    <span className="pill__unit">{metric.unit}</span>
                  </span>
                </span>
                <span className="pill__bar" aria-hidden>
                  <span style={{ width: `${Math.min(metric.ratio, 1) * 100}%` }} />
                </span>
              </li>
            ))}
          </ul>

          {entries.length > 0 && (
            <p className="hero__meta">
              {entries.length} item{entries.length === 1 ? '' : 's'} logged today
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
