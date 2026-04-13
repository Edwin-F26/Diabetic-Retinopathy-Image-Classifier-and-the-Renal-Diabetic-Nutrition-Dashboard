import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const VIZ_OPTIONS = [
  {
    id: 'countries-hbar',
    label: 'Top countries · horizontal bars',
    hint: 'Compare the ten largest populations side by side.',
  },
  {
    id: 'countries-line',
    label: 'Top countries · rank curve',
    hint: 'See how population drops from rank 1 through 15—steep cliffs are common.',
  },
  {
    id: 'regions-donut',
    label: 'Regions · donut shares',
    hint: 'Each slice is a share of this snapshot’s combined population.',
  },
  {
    id: 'regions-vbar',
    label: 'Regions · column bars',
    hint: 'Same regional totals as the donut, easier for comparing magnitudes.',
  },
];

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

function LineTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;
  return (
    <div className="dashboard-chart-tooltip">
      <strong className="dashboard-chart-tooltip__title">
        Rank {row.rank}: {row.fullName}
      </strong>
      <span className="dashboard-chart-tooltip__value">
        {Number(row.population).toLocaleString('en-US')} people
      </span>
    </div>
  );
}

function RegionBarTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;
  const pct = row.total > 0 ? ((row.value / row.total) * 100).toFixed(1) : '0';
  return (
    <div className="dashboard-chart-tooltip">
      <strong className="dashboard-chart-tooltip__title">{row.name}</strong>
      <span className="dashboard-chart-tooltip__value">
        {Number(row.value).toLocaleString('en-US')} people ({pct}% of snapshot)
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

const ANNOTATION = {
  'countries-hbar':
    'Annotation: bar length is raw population—the longest bar is not “scaled” to 100%; compare lengths directly.',
  'countries-line':
    'Annotation: the line connects ranks in order; a sharp early drop means a few countries dwarf the next tier.',
  'regions-donut':
    'Annotation: slices sum to 100% of this page’s combined population (top countries in the snapshot only).',
  'regions-vbar':
    'Annotation: bar height matches the donut’s slice sizes—pick whichever encoding you read faster.',
};

export default function DashboardCharts({
  list,
  visible,
  onVisibleChange,
  vizKind,
  onVizKindChange,
}) {
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

  const rankLineSeries = useMemo(() => {
    return [...list]
      .sort((a, b) => (b.population ?? 0) - (a.population ?? 0))
      .slice(0, 15)
      .map((c, i) => {
        const common = c.name?.common ?? c.cca2 ?? '—';
        return {
          rank: i + 1,
          name: truncateLabel(common, 14),
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

  const activeOption = VIZ_OPTIONS.find((o) => o.id === vizKind) ?? VIZ_OPTIONS[0];

  return (
    <section className="dashboard-charts" aria-label="Charts for this dataset">
      <div className="dashboard-charts__intro">
        <h2 className="dashboard-charts__heading">Explore the snapshot visually</h2>
        <p className="dashboard-charts__lede">
          The table below is filterable; charts here always use the full top-
          {list.length} pull. Use the switch to hide graphics when you want a
          calmer layout, and pick a visualization to emphasize countries or
          regions.
        </p>
      </div>

      <div className="dashboard-charts__toolbar">
        <div className="dashboard-charts__toolbar-row">
          <span className="dashboard-charts__toolbar-label" id="viz-visibility-label">
            Chart panel
          </span>
          <button
            type="button"
            className="dashboard-charts__toggle"
            aria-pressed={visible}
            aria-labelledby="viz-visibility-label"
            onClick={() => onVisibleChange(!visible)}
          >
            {visible ? 'Hide visualizations' : 'Show visualizations'}
          </button>
        </div>

        {visible && (
          <>
            <p className="dashboard-charts__toolbar-hint" id="viz-mode-hint">
              Choose one view at a time—each uses the same underlying rows but a
              different visual encoding.
            </p>
            <div
              className="dashboard-charts__viz-switch"
              role="radiogroup"
              aria-labelledby="viz-mode-label"
              aria-describedby="viz-mode-hint"
            >
              <span className="visually-hidden" id="viz-mode-label">
                Active visualization
              </span>
              {VIZ_OPTIONS.map((opt) => (
                <label
                  key={opt.id}
                  className={`dashboard-charts__viz-option${vizKind === opt.id ? ' dashboard-charts__viz-option--active' : ''}`}
                >
                  <input
                    type="radio"
                    className="dashboard-charts__viz-input"
                    name="viz-kind"
                    value={opt.id}
                    checked={vizKind === opt.id}
                    onChange={() => onVizKindChange(opt.id)}
                  />
                  <span className="dashboard-charts__viz-option-text">{opt.label}</span>
                </label>
              ))}
            </div>
          </>
        )}
      </div>

      {!visible && (
        <p className="dashboard-charts__hidden-note" role="status">
          Visualizations are hidden. Turn them back on with the button above when
          you want charts again.
        </p>
      )}

      {visible && (
        <>
          <p className="dashboard-charts__annotation" role="note">
            <strong>Current view.</strong> {activeOption.hint}
          </p>
          <p className="dashboard-charts__annotation dashboard-charts__annotation--sub">
            {ANNOTATION[vizKind] ?? ''}
          </p>

          <figure className="dashboard-chart-card dashboard-chart-card--solo">
            <div
              className="dashboard-chart-card__plot dashboard-chart-card__plot--solo"
              role="img"
              aria-label={activeOption.label}
            >
              {vizKind === 'countries-hbar' && (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    layout="vertical"
                    data={topByPopulation}
                    margin={{ top: 8, right: 24, left: 4, bottom: 8 }}
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
                      width={112}
                      tick={{ fill: axisColor, fontSize: 11 }}
                      stroke={gridColor}
                    />
                    <Tooltip
                      content={<BarTooltip />}
                      cursor={{ fill: 'color-mix(in srgb, var(--accent) 12%, transparent)' }}
                    />
                    <Bar
                      dataKey="population"
                      fill="var(--accent)"
                      radius={[0, 6, 6, 0]}
                      maxBarSize={26}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}

              {vizKind === 'countries-line' && (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={rankLineSeries} margin={{ top: 8, right: 16, left: 4, bottom: 8 }}>
                    <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="rank"
                      tick={{ fill: axisColor, fontSize: 11 }}
                      stroke={gridColor}
                      label={{ value: 'Population rank in snapshot', position: 'bottom', offset: 0, fill: axisColor, fontSize: 11 }}
                    />
                    <YAxis
                      tick={{ fill: axisColor, fontSize: 11 }}
                      stroke={gridColor}
                      tickFormatter={(v) => formatCompactPop(v)}
                    />
                    <Tooltip content={<LineTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="population"
                      stroke="var(--accent)"
                      strokeWidth={2}
                      dot={{ fill: 'var(--accent)', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}

              {vizKind === 'regions-donut' && (
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                    <Pie
                      data={populationByRegion}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="44%"
                      innerRadius={56}
                      outerRadius={118}
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
                      height={40}
                      formatter={(value) => (
                        <span className="dashboard-chart-legend">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}

              {vizKind === 'regions-vbar' && (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={populationByRegion} margin={{ top: 8, right: 16, left: 4, bottom: 64 }}>
                    <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: axisColor, fontSize: 11 }}
                      stroke={gridColor}
                      interval={0}
                      angle={-28}
                      textAnchor="end"
                      height={56}
                    />
                    <YAxis
                      tick={{ fill: axisColor, fontSize: 11 }}
                      stroke={gridColor}
                      tickFormatter={(v) => formatCompactPop(v)}
                    />
                    <Tooltip content={<RegionBarTooltip />} cursor={{ fill: 'color-mix(in srgb, var(--accent) 10%, transparent)' }} />
                    <Bar dataKey="value" fill="var(--accent)" radius={[6, 6, 0, 0]} maxBarSize={48}>
                      {populationByRegion.map((entry, i) => (
                        <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </figure>
        </>
      )}
    </section>
  );
}
