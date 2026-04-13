import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import './App.css';
import Dashboard from './pages/Dashboard';
import CountryDetail from './pages/CountryDetail';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <header className="app-header">
          <div className="app-header__inner">
            <Link to="/" className="app-brand app-brand--link">
              <span className="app-brand__mark" aria-hidden />
              <div>
                <p className="app-brand__name">Population Atlas</p>
                <p className="app-brand__tag">Top countries by population</p>
              </div>
            </Link>
            <p className="app-header__meta">
              Data: <span className="app-header__pill">REST Countries</span>
            </p>
          </div>
        </header>

        <div className="app-body">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/country/:cca2" element={<CountryDetail />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
