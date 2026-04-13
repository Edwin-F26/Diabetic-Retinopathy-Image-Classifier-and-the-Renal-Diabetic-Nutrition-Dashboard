export default function DashboardInsights({ listLength }) {
  return (
    <section
      className="dashboard-insights"
      aria-labelledby="dashboard-insights-heading"
    >
      <h2 id="dashboard-insights-heading" className="dashboard-insights__title">
        What makes this snapshot interesting?
      </h2>
      <div className="dashboard-insights__body">
        <p className="dashboard-insights__p">
          REST Countries returns every country, but this dashboard keeps only the{' '}
          <strong>top {listLength} by population</strong>. That choice is deliberate:
          global population is not evenly spread— a <strong>heavy tail</strong>{' '}
          means a few rows explain a large share of the total, while dozens of
          smaller states sit further down the full ranking. The charts highlight
          that skew; the table lets you hunt for specific places inside this
          slice.
        </p>
        <p className="dashboard-insights__p">
          <strong>Reading the graphics:</strong> the country views emphasize{' '}
          <em>who</em> dominates the list; the regional views show{' '}
          <em>where</em> those people are grouped using the API’s continent
          labels (not the same as cultural or economic blocs). Hover segments
          or bars for exact counts.
        </p>
        <div className="dashboard-insights__callout" role="note">
          <h3 className="dashboard-insights__callout-title">Filter ideas to try</h3>
          <ul className="dashboard-insights__list">
            <li>
              <strong>Stress-test search:</strong> switch scope to{' '}
              <em>Names only</em> and type a fragment like{' '}
              <kbd className="dashboard-insights__kbd">united</kbd> to see how
              many naming patterns match.
            </li>
            <li>
              <strong>Region + bounds:</strong> pick <em>Europe</em>, leave
              search empty, then set a <strong>maximum</strong> population (e.g.{' '}
              20&nbsp;000&nbsp;000) to list mid-sized European states in this
              top-{listLength} window.
            </li>
            <li>
              <strong>Codes only:</strong> choose <em>ISO codes only</em> and
              search <kbd className="dashboard-insights__kbd">in</kbd> to match
              India, Indonesia, etc.—useful when you think in ISO-2.
            </li>
            <li>
              <strong>Go deeper:</strong> open any row to the detail page for
              capitals, languages, and a stable permalink you can share.
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
