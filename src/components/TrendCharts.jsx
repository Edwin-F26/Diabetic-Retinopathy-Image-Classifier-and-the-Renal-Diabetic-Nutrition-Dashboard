import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { TRACKED_METRICS } from '../data/nutrients';
import { statusForRatio } from '../data/targetPresets';
import { MEALS, formatDateKey } from '../lib/nutrition';
import { formatAmount } from '../lib/format';
import { useNutrition } from '../state/nutritionContext';
import { IconChart } from './Icons';

const STATUS_COLORS = {
  ok: 'var(--ok)',
  caution: 'var(--caution)',
  warning: 'var(--warning)',
  over: 'var(--danger)',
};

const MEAL_COLORS = ['#7c6cf5', '#14b8a6', '#4f7bf7', '#f59e0b'];

function WeeklyTooltip({ active, payload, unit }) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;
  return (
    <div className="chart-tooltip">
      <strong>{row.fullLabel}</strong>
      <span>
        {formatAmount(row.value, unit)} {unit}
        {row.limit > 0 && ` of ${formatAmount(row.limit, unit)} ${unit}`}
      </span>
    </div>
  );
}

function MealTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
  return (
    <div className="chart-tooltip">
      <strong>{label}</strong>
      {payload.map((item) => (
        <span key={item.dataKey}>
          {item.name}: {formatAmount(item.value, unit)} {unit}
        </span>
      ))}
      <span className="chart-tooltip__total">
        Total {formatAmount(total, unit)} {unit}
      </span>
    </div>
  );
}

export default function TrendCharts() {
  const { weeklySeries, targets, entriesByDate, selectedDate } = useNutrition();
  const [metricKey, setMetricKey] = useState('potassium');
  const [view, setView] = useState('weekly');

  const metric =
    TRACKED_METRICS.find((item) => item.key === metricKey) ?? TRACKED_METRICS[0];
  const limit = Number(targets[metric.key]) || 0;

  const weeklyData = useMemo(
    () =>
      weeklySeries.map(({ dateKey, totals }) => {
        const value = Number(totals[metric.key]) || 0;
        const ratio = limit > 0 ? value / limit : 0;
        return {
          dateKey,
          label: formatDateKey(dateKey, { weekday: 'short' }),
          fullLabel: formatDateKey(dateKey, { month: 'short', day: 'numeric' }),
          value,
          limit,
          status: limit > 0 ? statusForRatio(ratio) : 'ok',
        };
      }),
    [weeklySeries, metric.key, limit],
  );

  /** Same seven days, split by meal, so timing patterns are visible. */
  const mealData = useMemo(
    () =>
      weeklySeries.map(({ dateKey }) => {
        const dayEntries = entriesByDate[dateKey] ?? [];
        const row = {
          label: formatDateKey(dateKey, { weekday: 'short' }),
          dateKey,
        };
        for (const meal of MEALS) {
          row[meal.id] = dayEntries
            .filter((entry) => entry.meal === meal.id)
            .reduce((sum, entry) => sum + (Number(entry.nutrients[metric.key]) || 0), 0);
        }
        return row;
      }),
    [weeklySeries, entriesByDate, metric.key],
  );

  const hasData = weeklyData.some((row) => row.value > 0);

  return (
    <section className="panel reveal" aria-labelledby="trends-heading">
      <header className="panel__header">
        <div className="panel__heading">
          <span className="panel__icon">
            <IconChart size={18} />
          </span>
          <div>
            <h2 className="panel__title" id="trends-heading">
              Seven-day trend
            </h2>
            <p className="panel__subtitle">
              Week ending {formatDateKey(selectedDate, { month: 'long', day: 'numeric' })}.
              Bars are colored by how close that day came to the limit.
            </p>
          </div>
        </div>
      </header>

      <div className="chart-controls">
        <div className="field field--inline">
          <label className="field__label" htmlFor="trend-metric">
            Metric
          </label>
          <select
            id="trend-metric"
            className="select"
            value={metricKey}
            onChange={(event) => setMetricKey(event.target.value)}
          >
            {TRACKED_METRICS.map((item) => (
              <option key={item.key} value={item.key}>
                {item.label} ({item.unit})
              </option>
            ))}
          </select>
        </div>

        <div className="segmented" role="radiogroup" aria-label="Chart view">
          {[
            { id: 'weekly', label: 'Daily totals' },
            { id: 'meals', label: 'Split by meal' },
          ].map((option) => (
            <label
              key={option.id}
              className={`segmented__option${view === option.id ? ' segmented__option--active' : ''}`}
            >
              <input
                type="radio"
                name="trend-view"
                value={option.id}
                checked={view === option.id}
                onChange={() => setView(option.id)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {!hasData ? (
        <p className="notice" role="status">
          No history yet for {metric.label.toLowerCase()}. Log a few foods and the
          trend will fill in day by day.
        </p>
      ) : (
        <figure className="chart">
          <div className="chart__plot" role="img" aria-label={`${metric.label} over the last seven days`}>
            <ResponsiveContainer width="100%" height={300}>
              {view === 'weekly' ? (
                <BarChart data={weeklyData} margin={{ top: 12, right: 16, left: 4, bottom: 4 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" stroke="var(--border)" tick={{ fill: 'var(--text)', fontSize: 12 }} />
                  <YAxis
                    stroke="var(--border)"
                    tick={{ fill: 'var(--text)', fontSize: 12 }}
                    tickFormatter={(v) => formatAmount(v, metric.unit)}
                  />
                  <Tooltip
                    content={<WeeklyTooltip unit={metric.unit} />}
                    cursor={{ fill: 'color-mix(in srgb, var(--accent) 10%, transparent)' }}
                  />
                  {limit > 0 && (
                    <ReferenceLine
                      y={limit}
                      stroke="var(--danger)"
                      strokeDasharray="5 4"
                      label={{
                        value: `Limit ${formatAmount(limit, metric.unit)}`,
                        position: 'insideTopRight',
                        fill: 'var(--danger)',
                        fontSize: 11,
                      }}
                    />
                  )}
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={48}>
                    {weeklyData.map((row) => (
                      <Cell key={row.dateKey} fill={STATUS_COLORS[row.status]} />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                <BarChart data={mealData} margin={{ top: 12, right: 16, left: 4, bottom: 4 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" stroke="var(--border)" tick={{ fill: 'var(--text)', fontSize: 12 }} />
                  <YAxis
                    stroke="var(--border)"
                    tick={{ fill: 'var(--text)', fontSize: 12 }}
                    tickFormatter={(v) => formatAmount(v, metric.unit)}
                  />
                  <Tooltip
                    content={<MealTooltip unit={metric.unit} />}
                    cursor={{ fill: 'color-mix(in srgb, var(--accent) 10%, transparent)' }}
                  />
                  <Legend
                    formatter={(value) => <span className="chart-legend">{value}</span>}
                  />
                  {limit > 0 && (
                    <ReferenceLine y={limit} stroke="var(--danger)" strokeDasharray="5 4" />
                  )}
                  {MEALS.map((meal, index) => (
                    <Bar
                      key={meal.id}
                      dataKey={meal.id}
                      name={meal.label}
                      stackId="meals"
                      fill={MEAL_COLORS[index % MEAL_COLORS.length]}
                      maxBarSize={48}
                      radius={index === MEALS.length - 1 ? [6, 6, 0, 0] : undefined}
                    />
                  ))}
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
          <figcaption className="chart__caption">{metric.blurb}</figcaption>
        </figure>
      )}
    </section>
  );
}
