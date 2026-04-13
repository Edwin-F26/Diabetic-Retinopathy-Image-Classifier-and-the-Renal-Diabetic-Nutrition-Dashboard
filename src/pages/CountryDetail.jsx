import { useEffect, useState } from 'react';
import { Link, useParams, generatePath } from 'react-router-dom';
import MainShell from '../layouts/MainShell';

const DETAIL_FIELDS =
  'name,population,region,flags,cca2,cca3,capital,area,currencies,languages,borders,subregion,tld,timezones,maps,idd,latlng';

function formatPopulation(value) {
  if (value == null || Number.isNaN(value)) return '—';
  return Math.round(value).toLocaleString('en-US');
}

function formatArea(km2) {
  if (km2 == null || Number.isNaN(km2)) return '—';
  return `${Number(km2).toLocaleString('en-US')} km²`;
}

function formatLanguages(langs) {
  if (!langs || typeof langs !== 'object') return '—';
  return Object.values(langs).join(', ') || '—';
}

function formatCurrencies(cur) {
  if (!cur || typeof cur !== 'object') return '—';
  return Object.entries(cur)
    .map(([code, c]) => {
      const sym = c?.symbol ? ` ${c.symbol}` : '';
      return `${c?.name ?? code}${sym} (${code})`;
    })
    .join(', ');
}

function formatLatLng(ll) {
  if (!Array.isArray(ll) || ll.length < 2) return '—';
  const [lat, lng] = ll;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return '—';
  return `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`;
}

export default function CountryDetail() {
  const { cca2 } = useParams();
  const code = (cca2 ?? '').trim().toUpperCase();

  const [country, setCountry] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!code) {
      setError('Missing country code.');
      setCountry(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const run = async () => {
      try {
        const url = `https://restcountries.com/v3.1/alpha/${encodeURIComponent(code)}?fields=${DETAIL_FIELDS}`;
        const response = await fetch(url);
        const data = await response.json();
        if (cancelled) return;
        if (response.status === 404) {
          setError('Country not found.');
          setCountry(null);
          return;
        }
        if (!response.ok) {
          setError('Could not load country details.');
          setCountry(null);
          return;
        }
        const row = Array.isArray(data) ? data[0] : data;
        if (!row || !row.cca2) {
          setError('Country not found.');
          setCountry(null);
          return;
        }
        setCountry(row);
      } catch {
        if (!cancelled) {
          setError('Network error while loading details.');
          setCountry(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [code]);

  const flagUrl = country?.flags?.png ?? country?.flags?.svg;
  const mapsUrl = country?.maps?.googleMaps ?? country?.maps?.openStreetMaps;

  const detailPath = country
    ? generatePath('/country/:cca2', { cca2: country.cca2 })
    : '';
  const detailUrl =
    detailPath && typeof window !== 'undefined'
      ? `${window.location.origin}${detailPath}`
      : detailPath;

  return (
    <MainShell>
      <nav className="country-detail__nav" aria-label="Breadcrumb">
        <Link className="country-detail__back" to="/">
          ← Back to dashboard
        </Link>
      </nav>

      {loading && (
        <p className="app-banner" role="status">
          Loading country details…
        </p>
      )}

      {!loading && error && (
        <p className="app-banner app-banner--error" role="alert">
          {error}
        </p>
      )}

      {!loading && country && (
        <article className="country-detail">
          <header className="country-detail__header">
            {flagUrl ? (
              <img
                className="country-detail__flag"
                src={flagUrl}
                alt=""
                width={88}
                height={66}
              />
            ) : (
              <span
                className="country-detail__flag country-detail__flag--placeholder"
                aria-hidden
              />
            )}
            <div className="country-detail__titles">
              <h1 className="country-detail__name">
                {country.name?.common ?? '—'}
              </h1>
              <p className="country-detail__official">
                {country.name?.official ?? ''}
              </p>
              <p className="country-detail__codes">
                <span className="country-detail__code">{country.cca2}</span>
                {country.cca3 ? (
                  <>
                    {' '}
                    · <span className="country-detail__code">{country.cca3}</span>
                  </>
                ) : null}
              </p>
            </div>
          </header>

          <p className="country-detail__lede">
            Snapshot fields you already saw on the dashboard appear below with
            fuller context—plus capital, area, languages, and more from the same
            API.
          </p>

          <p className="country-detail__permalink-wrap">
            <span className="country-detail__permalink-label" id="country-permalink-label">
              Direct link to this page
            </span>
            <a
              className="country-detail__permalink"
              href={detailUrl || detailPath}
              aria-labelledby="country-permalink-label"
            >
              {detailUrl || detailPath}
            </a>
          </p>

          <dl className="country-detail__facts">
            <div className="country-detail__row">
              <dt>Population</dt>
              <dd>{formatPopulation(country.population)}</dd>
            </div>
            <div className="country-detail__row">
              <dt>Region</dt>
              <dd>{country.region ?? '—'}</dd>
            </div>
            <div className="country-detail__row">
              <dt>Subregion</dt>
              <dd>{country.subregion ?? '—'}</dd>
            </div>
            <div className="country-detail__row">
              <dt>Capital</dt>
              <dd>
                {Array.isArray(country.capital) && country.capital.length
                  ? country.capital.join(', ')
                  : '—'}
              </dd>
            </div>
            <div className="country-detail__row">
              <dt>Area</dt>
              <dd>{formatArea(country.area)}</dd>
            </div>
            <div className="country-detail__row">
              <dt>Languages</dt>
              <dd>{formatLanguages(country.languages)}</dd>
            </div>
            <div className="country-detail__row">
              <dt>Currencies</dt>
              <dd>{formatCurrencies(country.currencies)}</dd>
            </div>
            <div className="country-detail__row">
              <dt>Time zones</dt>
              <dd>
                {Array.isArray(country.timezones) && country.timezones.length
                  ? country.timezones.join(', ')
                  : '—'}
              </dd>
            </div>
            <div className="country-detail__row">
              <dt>Top-level domains</dt>
              <dd>
                {Array.isArray(country.tld) && country.tld.length
                  ? country.tld.join(', ')
                  : '—'}
              </dd>
            </div>
            <div className="country-detail__row">
              <dt>Calling code</dt>
              <dd>
                {(() => {
                  const root = country.idd?.root;
                  const suf = country.idd?.suffixes;
                  if (!root) return '—';
                  if (Array.isArray(suf) && suf.length) {
                    return suf.map((s) => `${root}${s}`).join(', ');
                  }
                  return root;
                })()}
              </dd>
            </div>
            <div className="country-detail__row">
              <dt>Coordinates</dt>
              <dd>{formatLatLng(country.latlng)}</dd>
            </div>
            <div className="country-detail__row">
              <dt>Border countries (ISO3)</dt>
              <dd>
                {Array.isArray(country.borders) && country.borders.length
                  ? country.borders.join(', ')
                  : 'None listed (e.g. island or no land borders)'}
              </dd>
            </div>
          </dl>

          {mapsUrl && (
            <p className="country-detail__maps">
              <a
                className="country-detail__maps-link"
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
              >
                Open map
              </a>
              <span className="country-detail__maps-hint"> · external site</span>
            </p>
          )}
        </article>
      )}
    </MainShell>
  );
}
