import { useState, useEffect, useMemo } from 'react';
import CoinInfo from '../Components/CoinInfo';
import DashboardCharts from '../Components/DashboardCharts';
import MainShell from '../layouts/MainShell';

const LIST_LIMIT = 30;

const REGION_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'Africa', label: 'Africa' },
  { id: 'Americas', label: 'Americas' },
  { id: 'Asia', label: 'Asia' },
  { id: 'Europe', label: 'Europe' },
  { id: 'Oceania', label: 'Oceania' },
];

function formatPopulation(value) {
  if (value == null || Number.isNaN(value)) return '—';
  return Math.round(value).toLocaleString('en-US');
}

function median(sortedAsc) {
  const n = sortedAsc.length;
  if (n === 0) return null;
  const mid = Math.floor(n / 2);
  if (n % 2 === 1) return sortedAsc[mid];
  return (sortedAsc[mid - 1] + sortedAsc[mid]) / 2;
}

function percentile(sortedAsc, p) {
  const n = sortedAsc.length;
  if (n === 0) return null;
  if (n === 1) return sortedAsc[0];
  const idx = (n - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sortedAsc[lo];
  return sortedAsc[lo] + (sortedAsc[hi] - sortedAsc[lo]) * (idx - lo);
}

function parsePopulationBound(str) {
  const t = String(str ?? '').trim();
  if (t === '') return null;
  const n = Number(t);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.floor(n);
}

export default function Dashboard() {
  const [list, setList] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchScope, setSearchScope] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [popMinStr, setPopMinStr] = useState('');
  const [popMaxStr, setPopMaxStr] = useState('');

  useEffect(() => {
    let cancelled = false;

    const fetchCountries = async () => {
      setLoadError(null);
      const url =
        'https://restcountries.com/v3.1/all?fields=name,population,region,flags,cca2,cca3';
      try {
        const response = await fetch(url);
        const data = await response.json();
        if (cancelled) return;
        if (!response.ok) {
          setLoadError('Could not load country data.');
          setList([]);
          return;
        }
        if (!Array.isArray(data)) {
          setList([]);
          return;
        }
        const sorted = [...data].sort(
          (a, b) => (b.population ?? 0) - (a.population ?? 0),
        );
        setList(sorted.slice(0, LIST_LIMIT));
      } catch {
        if (!cancelled) {
          setLoadError('Network error while loading countries.');
          setList([]);
        }
      }
    };

    fetchCountries();

    return () => {
      cancelled = true;
    };
  }, []);

  const popBounds = useMemo(() => {
    if (!list?.length) return { min: 0, max: 1 };
    const pops = list.map((c) => Number(c.population) || 0);
    return {
      min: Math.min(...pops),
      max: Math.max(...pops),
    };
  }, [list]);

  const sliderStep = useMemo(() => {
    const span = popBounds.max - popBounds.min;
    if (span <= 0) return 1;
    return Math.max(1, Math.round(span / 120));
  }, [popBounds]);

  const filteredList = useMemo(() => {
    if (!list) return [];
    const q = searchQuery.trim().toLowerCase();
    let rows = list;
    if (q) {
      rows = rows.filter((c) => {
        const common = (c.name?.common ?? '').toLowerCase();
        const official = (c.name?.official ?? '').toLowerCase();
        const code2 = (c.cca2 ?? '').toLowerCase();
        const code3 = (c.cca3 ?? '').toLowerCase();
        if (searchScope === 'names') {
          return common.includes(q) || official.includes(q);
        }
        if (searchScope === 'codes') {
          return code2.includes(q) || code3.includes(q);
        }
        return (
          common.includes(q) ||
          official.includes(q) ||
          code2.includes(q) ||
          code3.includes(q)
        );
      });
    }
    if (regionFilter !== 'all') {
      rows = rows.filter((c) => c.region === regionFilter);
    }
    const minB = parsePopulationBound(popMinStr);
    const maxB = parsePopulationBound(popMaxStr);
    if (minB != null && maxB != null && minB > maxB) {
      return [];
    }
    if (minB != null) {
      rows = rows.filter((c) => (Number(c.population) || 0) >= minB);
    }
    if (maxB != null) {
      rows = rows.filter((c) => (Number(c.population) || 0) <= maxB);
    }
    return rows;
  }, [
    list,
    searchQuery,
    searchScope,
    regionFilter,
    popMinStr,
    popMaxStr,
  ]);

  const boundsInvalid = useMemo(() => {
    const minB = parsePopulationBound(popMinStr);
    const maxB = parsePopulationBound(popMaxStr);
    return minB != null && maxB != null && minB > maxB;
  }, [popMinStr, popMaxStr]);

  const summary = useMemo(() => {
    if (!list || list.length === 0) return null;
    const populations = list.map((c) => Number(c.population) || 0);
    const sortedAsc = [...populations].sort((a, b) => a - b);
    const n = sortedAsc.length;
    const totalPop = populations.reduce((sum, p) => sum + p, 0);
    const mean = totalPop / n;
    const med = median(sortedAsc);
    const min = sortedAsc[0];
    const max = sortedAsc[n - 1];
    const q1 = percentile(sortedAsc, 0.25);
    const q3 = percentile(sortedAsc, 0.75);
    const iqr = q1 != null && q3 != null ? q3 - q1 : null;
    const regions = new Set(list.map((c) => c.region).filter(Boolean));

    return {
      total: n,
      combinedPopulation: totalPop,
      regionCount: regions.size,
      meanPopulation: mean,
      medianPopulation: med,
      minPopulation: min,
      maxPopulation: max,
      q1,
      q3,
      iqr,
    };
  }, [list]);

  const hero = (
    <section className="app-hero">
      <div className="app-hero__copy">
        <p className="app-hero__eyebrow">Public API · no key</p>
        <h1 className="app-hero__title">Where people concentrate</h1>
        <p className="app-hero__lede">
          The most populous nations shape languages, cities, and trade. Use
          search, region, and population bounds together—then follow
          curiosity into the outliers.
        </p>
      </div>
      {summary && (
        <div
          className="app-hero__stats"
          aria-label="Summary statistics for the loaded snapshot"
        >
          <p className="app-hero__stats-note">
            Based on population for the top {summary.total} countries in this
            snapshot.
          </p>
          <div className="app-hero__stats-grid">
            <div className="app-stat">
              <span className="app-stat__label">Countries in snapshot</span>
              <span className="app-stat__value">{summary.total}</span>
              <span className="app-stat__hint">Items in the dataset</span>
            </div>
            <div className="app-stat">
              <span className="app-stat__label">Mean population</span>
              <span className="app-stat__value">
                {formatPopulation(summary.meanPopulation)}
              </span>
              <span className="app-stat__hint">Average across rows</span>
            </div>
            <div className="app-stat">
              <span className="app-stat__label">Median population</span>
              <span className="app-stat__value">
                {formatPopulation(summary.medianPopulation)}
              </span>
              <span className="app-stat__hint">50th percentile</span>
            </div>
            <div className="app-stat">
              <span className="app-stat__label">Range (min–max)</span>
              <span className="app-stat__value app-stat__value--compact">
                {formatPopulation(summary.minPopulation)} –{' '}
                {formatPopulation(summary.maxPopulation)}
              </span>
              <span className="app-stat__hint">Full spread</span>
            </div>
            <div className="app-stat">
              <span className="app-stat__label">IQR (Q3 − Q1)</span>
              <span className="app-stat__value">
                {formatPopulation(summary.iqr)}
              </span>
              <span className="app-stat__hint">
                Q1 {formatPopulation(summary.q1)} · Q3{' '}
                {formatPopulation(summary.q3)}
              </span>
            </div>
            <div className="app-stat">
              <span className="app-stat__label">Regions represented</span>
              <span className="app-stat__value">{summary.regionCount}</span>
              <span className="app-stat__hint">Distinct continents</span>
            </div>
            <div className="app-stat app-stat--wide">
              <span className="app-stat__label">Combined population</span>
              <span className="app-stat__value app-stat__value--lg">
                {summary.combinedPopulation.toLocaleString('en-US')}
              </span>
              <span className="app-stat__hint">Sum of all rows above</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );

  return (
    <MainShell beforeGrid={hero}>
      {loadError && (
        <p className="app-banner app-banner--error" role="alert">
          {loadError}
        </p>
      )}

      {!loadError && list === null && (
        <p className="app-banner" role="status">
          Loading country data…
        </p>
      )}

      {!loadError && list && list.length === 0 && (
        <p className="app-banner" role="status">
          No country data returned.
        </p>
      )}

      {list && list.length > 0 && (
        <>
          <DashboardCharts list={list} />

          <div className="controls-card">
            <div className="controls-card__search">
              <label className="controls-card__label" htmlFor="country-search">
                Search (text)
              </label>
              <p className="controls-card__hint" id="country-search-hint">
                Filters by substring on names and/or codes depending on the
                option below. All filters apply <strong>together</strong>.
              </p>
              <input
                id="country-search"
                className="controls-card__input"
                type="search"
                placeholder="Try United, India, US, deu…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoComplete="off"
                spellCheck="false"
                aria-describedby="country-search-hint"
              />
              <fieldset className="controls-card__fieldset">
                <legend className="controls-card__legend" id="search-scope-legend">
                  Search applies to
                </legend>
                <div
                  className="radio-row"
                  role="radiogroup"
                  aria-labelledby="search-scope-legend"
                >
                  {[
                    { id: 'all', label: 'Names & codes' },
                    { id: 'names', label: 'Names only' },
                    { id: 'codes', label: 'ISO codes only' },
                  ].map(({ id, label }) => (
                    <label key={id} className="radio-item">
                      <input
                        type="radio"
                        name="search-scope"
                        value={id}
                        checked={searchScope === id}
                        onChange={() => setSearchScope(id)}
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>

            <div className="controls-card__select-block">
              <label
                className="controls-card__label"
                htmlFor="region-select"
                id="region-select-label"
              >
                Region (dropdown)
              </label>
              <p className="controls-card__hint" id="region-select-hint">
                Continent category—separate from the text search and from
                population bounds.
              </p>
              <select
                id="region-select"
                className="controls-card__select"
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                aria-labelledby="region-select-label"
                aria-describedby="region-select-hint"
              >
                {REGION_FILTERS.map(({ id, label }) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="controls-card__bounds">
              <p className="controls-card__label" id="bounds-label">
                Population bounds (numbers + sliders)
              </p>
              <p className="controls-card__hint" id="bounds-hint">
                Leave a field empty for no limit. Sliders stay in sync with
                the inputs. Bounds filter on the <strong>population</strong>{' '}
                field (people), not on name or region.
              </p>
              <div className="bounds-grid" aria-labelledby="bounds-label" aria-describedby="bounds-hint">
                <div className="bounds-field">
                  <label className="bounds-field__label" htmlFor="pop-min-input">
                    Minimum
                  </label>
                  <input
                    id="pop-min-input"
                    className="controls-card__input controls-card__input--num"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    placeholder="No lower bound"
                    value={popMinStr}
                    onChange={(e) => setPopMinStr(e.target.value)}
                  />
                  <input
                    id="pop-min-range"
                    className="controls-card__range"
                    type="range"
                    min={0}
                    max={popBounds.max}
                    step={sliderStep}
                    value={
                      parsePopulationBound(popMinStr) ??
                      0
                    }
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setPopMinStr(v <= 0 ? '' : String(v));
                    }}
                    aria-label="Adjust minimum population with a slider"
                  />
                </div>
                <div className="bounds-field">
                  <label className="bounds-field__label" htmlFor="pop-max-input">
                    Maximum
                  </label>
                  <input
                    id="pop-max-input"
                    className="controls-card__input controls-card__input--num"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    placeholder="No upper bound"
                    value={popMaxStr}
                    onChange={(e) => setPopMaxStr(e.target.value)}
                  />
                  <input
                    id="pop-max-range"
                    className="controls-card__range"
                    type="range"
                    min={0}
                    max={popBounds.max}
                    step={sliderStep}
                    value={
                      parsePopulationBound(popMaxStr) ?? popBounds.max
                    }
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      if (v >= popBounds.max) setPopMaxStr('');
                      else setPopMaxStr(String(v));
                    }}
                    aria-label="Adjust maximum population with a slider"
                  />
                </div>
              </div>
              {boundsInvalid && (
                <p className="controls-card__warn" role="alert">
                  Minimum cannot be greater than maximum. Adjust the bounds.
                </p>
              )}
            </div>
          </div>

          <p
            className="app-list-meta"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {list && filteredList.length !== list.length ? (
              <>
                Showing {filteredList.length} of {list.length} countries
                (search / region filters)
              </>
            ) : (
              <>
                Showing all {filteredList.length} countr
                {filteredList.length === 1 ? 'y' : 'ies'} in this snapshot
              </>
            )}
            {filteredList.length > 0 &&
              filteredList.length < 10 &&
              ' · widen filters to see more rows'}
          </p>

          <div
            className="table-panel"
            role="region"
            aria-label="Filtered list of countries"
          >
            {filteredList.length === 0 ? (
              <p className="table-panel__empty" role="status">
                {boundsInvalid
                  ? 'Population minimum is greater than maximum—adjust the bounds.'
                  : 'No countries match your search and filters.'}
              </p>
            ) : (
              <>
                <div className="country-table__head" aria-hidden="true">
                  <span>#</span>
                  <span className="country-table__head-spacer" />
                  <span>Country</span>
                  <span className="country-table__head-num">Population</span>
                  <span>Region</span>
                </div>
                <ul className="country-table__body">
                  {filteredList.map((country, index) => (
                    <CoinInfo
                      key={country.cca2}
                      flagUrl={country.flags?.png ?? country.flags?.svg}
                      name={country.name?.common ?? '—'}
                      code={country.cca2}
                      rank={index + 1}
                      population={country.population}
                      region={country.region}
                    />
                  ))}
                </ul>
              </>
            )}
          </div>
        </>
      )}
    </MainShell>
  );
}
