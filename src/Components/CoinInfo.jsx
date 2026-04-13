import './CoinInfo.css';

function CoinInfo({ flagUrl, name, code, rank, population, region }) {
  const popLabel =
    population != null && !Number.isNaN(Number(population))
      ? Number(population).toLocaleString('en-US')
      : '—';
  const regionLabel = region ?? '—';

  return (
    <li className="coin-info">
      <span className="coin-info__rank">{rank}</span>
      {flagUrl ? (
        <img
          className="coin-info__icon"
          src={flagUrl}
          alt=""
          width={40}
          height={40}
        />
      ) : (
        <span className="coin-info__icon coin-info__icon--placeholder" aria-hidden />
      )}
      <div className="coin-info__identity">
        <span className="coin-info__name">{name}</span>
        <span className="coin-info__code">{code}</span>
      </div>
      <span className="coin-info__pop">{popLabel}</span>
      <span className="coin-info__region">{regionLabel}</span>
    </li>
  );
}

export default CoinInfo;
