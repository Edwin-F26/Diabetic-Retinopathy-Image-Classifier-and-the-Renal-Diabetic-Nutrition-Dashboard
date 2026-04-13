import CryptoNews from '../Components/CryptoNews';

export default function MainShell({ beforeGrid, children }) {
  return (
    <>
      {beforeGrid}
      <div className="app-grid">
        <div className="app-grid__primary">{children}</div>
        <aside className="app-grid__aside" aria-label="Space news feed">
          <CryptoNews />
        </aside>
      </div>
    </>
  );
}
