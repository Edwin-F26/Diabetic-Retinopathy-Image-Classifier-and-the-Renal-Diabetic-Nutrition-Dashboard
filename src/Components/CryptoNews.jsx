import { useState, useEffect } from 'react';
import './CryptoNews.css';

const FEED_URL =
  'https://api.spaceflightnewsapi.net/v4/articles/?limit=18';

const MAX_ARTICLES = 18;

function formatNewsTime(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function newsSiteLabel(item) {
  const ns = item?.news_site;
  if (ns == null) return null;
  if (typeof ns === 'string') return ns;
  if (typeof ns === 'object' && ns.name) return ns.name;
  return null;
}

const CryptoNews = () => {
  const [articles, setArticles] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await fetch(FEED_URL);
        const data = await response.json();
        if (cancelled) return;
        if (!response.ok) {
          setError('Could not load space news.');
          setArticles([]);
          return;
        }
        const rows = Array.isArray(data?.results) ? data.results : [];
        setArticles(rows.slice(0, MAX_ARTICLES));
      } catch {
        if (!cancelled) {
          setError('Could not load space news.');
          setArticles([]);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const skeletonRows = 7;

  return (
    <nav className="crypto-news" aria-labelledby="crypto-news-heading">
      <div className="crypto-news__shell">
        <header className="crypto-news__header">
          <div className="crypto-news__header-top">
            <h2 id="crypto-news-heading" className="crypto-news__title">
              Space news
            </h2>
            <span
              className="crypto-news__badge"
              title="Spaceflight News API"
            >
              Feed
            </span>
          </div>
          <p className="crypto-news__subtitle">
            Headlines from the Spaceflight News API—scroll for more.
          </p>
        </header>

        <div
          className="crypto-news__scroll"
          role="region"
          aria-label="News article list"
        >
          {error && (
            <p className="crypto-news__message" role="alert">
              {error}
            </p>
          )}
          {!error && articles === null && (
            <>
              <p className="crypto-news__sr-only">Loading news articles.</p>
              <ul className="crypto-news__skeleton" aria-hidden="true">
                {Array.from({ length: skeletonRows }, (_, i) => (
                  <li key={i} className="crypto-news__skeleton-row">
                    <span className="crypto-news__skeleton-line crypto-news__skeleton-line--long" />
                    <span className="crypto-news__skeleton-line crypto-news__skeleton-line--mid" />
                    <span className="crypto-news__skeleton-line crypto-news__skeleton-line--short" />
                  </li>
                ))}
              </ul>
            </>
          )}
          {!error && articles && articles.length === 0 && (
            <div className="crypto-news__empty">
              <p className="crypto-news__empty-title">Nothing to show yet</p>
              <p className="crypto-news__empty-hint">
                Check back soon for new stories.
              </p>
            </div>
          )}
          {articles && articles.length > 0 && (
            <ul className="crypto-news__list">
              {articles.map((item) => {
                const site = newsSiteLabel(item);
                return (
                <li key={item.id} className="crypto-news__item">
                  <a
                    className="crypto-news__link"
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="crypto-news__headline">{item.title}</span>
                    <span className="crypto-news__meta">
                      {site && (
                        <span className="crypto-news__source">{site}</span>
                      )}
                      {item.published_at != null && (
                        <time
                          className="crypto-news__time"
                          dateTime={item.published_at}
                        >
                          {formatNewsTime(item.published_at)}
                        </time>
                      )}
                    </span>
                  </a>
                </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
};

export default CryptoNews;
