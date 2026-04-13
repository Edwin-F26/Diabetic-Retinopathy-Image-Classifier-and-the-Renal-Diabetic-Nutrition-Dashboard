import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const PIE_COLORS = [
  '#2563eb',
  '#7c3aed',
  '#059669',
  '#d97706',
  '#dc2626',
  '#0891b2',
  '#db2777',
  '#4f46e5',
];

function truncateLabel(str, max) {
  if (!str) return '';
  return str.length > max ? `${str.slice(0, max - 1)}…` : str;
}

function formatCompactPop(n) {
  if (n == null || Number.isNaN(n)) return '—';
  const v = Number(n);
  if (v >= 1e9) return `${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(0)}K`;
  return v.toLocaleString('en-US');
}

function BarTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;
  return (
    <div className="dashboard-chart-tooltip">
      <strong className="dashboard-chart-tooltip__title">{row.fullName}</strong>
      <span className="dashboard-chart-tooltip__value">
        {Number(row.population).toLocaleString('en-US')} people
      </span>
    </div>
  );
}

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  const row = p?.payload ?? p;
  const name = row?.name ?? p?.name;
  const value = row?.value ?? p?.value;
  const total = row?.total;
  if (value == null || total == null) return null;
  const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
  return (
    <div className="dashboard-chart-tooltip">
      <strong className="dashboard-chart-tooltip__title">{name}</strong>
      <span className="dashboard-chart-tooltip__value">
        {Number(value).toLocaleString('en-US')} people ({pct}% of snapshot)
      </span>
    </div>
  );
}

export default function DashboardCharts({ list }) {
  const topByPopulation = useMemo(() => {
    return [...list]
      .sort((a, b) => (b.population ?? 0) - (a.population ?? 0))
      .slice(0, 10)
      .map((c) => {
        const common = c.name?.common ?? c.cca2 ?? '—';
        return {
          name: truncateLabel(common, 18),
          fullName: common,
          population: Math.round(Number(c.population) || 0),
        };
      });
  }, [list]);

  const populationByRegion = useMemo(() => {
    const map = new Map();
    for (const c of list) {
      const r = c.region || 'Unknown';
      map.set(r, (map.get(r) || 0) + Math.round(Number(c.population) || 0));
    }
    const rows = [...map.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    const total = rows.reduce((s, r) => s + r.value, 0);
    return rows.map((r) => ({ ...r, total }));
  }, [list]);

  const axisColor = 'var(--text)';
  const gridColor = 'var(--border)';

  return (
    <section className="dashboard-charts" aria-label="Charts for this dataset">
      <div className="dashboard-charts__intro">
        <h2 className="dashboard-charts__heading">Two views of the same snapshot</h2>
        <p className="dashboard-charts__lede">
          The table below is filterable; these charts always summarize the full
          top-{list.length} pull from the API so you can see structure before you
          narrow in.
        </p>
      </div>

      <div className="dashboard-charts__grid">
        <figure className="dashboard-chart-card">
          <figcaption className="dashboard-chart-card__caption">
            <h3 className="dashboard-chart-card__title">Who holds most people?</h3>
            <p className="dashboard-chart-card__story">
              The ten largest countries in this snapshot dominate the total—an
              uneven distribution where a few rows carry most of the population
              mass.
            </p>
          </figcaption>
          <div
            className="dashboard-chart-card__plot"
            role="img"
            aria-label="Horizontal bar chart of the ten most populous countries in the snapshot"
          >
            <ResponsiveContainer width="100%" height={360}>
              <BarChart
                layout="vertical"
                data={topByPopulation}
                margin={{ top: 8, right: 16, left: 4, bottom: 8 }}
              >
                <CartesianGrid stroke={gridColor} strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  dataKey="population"
                  tick={{ fill: axisColor, fontSize: 11 }}
                  tickFormatter={(v) => formatCompactPop(v)}
                  stroke={gridColor}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={108}
                  tick={{ fill: axisColor, fontSize: 11 }}
                  stroke={gridColor}
                />
                <Tooltip content={<BarTooltip />} cursor={{ fill: 'color-mix(in srgb, var(--accent) 12%, transparent)' }} />
                <Bar dataKey="population" fill="var(--accent)" radius={[0, 6, 6, 0]} maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </figure>

        <figure className="dashboard-chart-card">
          <figcaption className="dashboard-chart-card__caption">
            <h3 className="dashboard-chart-card__title">How population splits by region</h3>
            <p className="dashboard-chart-card__story">
              Aggregating the same rows by continent shows where humanity clusters
              in this slice—distinct from country rankings and sensitive to how
              the API labels regions.
            </p>
          </figcaption>
          <div
            className="dashboard-chart-card__plot dashboard-chart-card__plot--pie"
            role="img"
            aria-label="Pie chart of share of combined population by geographic region"
          >
            <ResponsiveContainer width="100%" height={360}>
              <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                <Pie
                  data={populationByRegion}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="46%"
                  innerRadius={52}
                  outerRadius={108}
                  paddingAngle={1}
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {populationByRegion.map((entry, i) => (
                    <Cell
                      key={entry.name}
                      fill={PIE_COLORS[i % PIE_COLORS.length]}
                      stroke="var(--bg)"
                      strokeWidth={1}
                    />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => <span className="dashboard-chart-legend">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </figure>
      </div>
    </section>
  );
}
