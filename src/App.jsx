import './App.css';
import Dashboard from './pages/Dashboard';
import NutritionProvider from './state/NutritionProvider';
import { Logo } from './components/Icons';

export default function App() {
  return (
    <NutritionProvider>
      <div className="app">
        <div className="app__aurora" aria-hidden>
          <span className="app__blob app__blob--one" />
          <span className="app__blob app__blob--two" />
          <span className="app__blob app__blob--three" />
        </div>

        <header className="app-header">
          <div className="app-header__inner">
            <div className="brand">
              <Logo size={40} />
              <div className="brand__text">
                <p className="brand__name">Renal &amp; Diabetic Nutrition</p>
                <p className="brand__tag">
                  Carbs, sodium, potassium &amp; phosphorus in one dashboard
                </p>
              </div>
            </div>

            <a
              className="app-header__source"
              href="https://fdc.nal.usda.gov/"
              target="_blank"
              rel="noreferrer"
            >
              <span className="app-header__source-dot" aria-hidden />
              USDA FoodData Central
            </a>
          </div>
        </header>

        <main className="app-body">
          <Dashboard />
        </main>

        <footer className="app-footer">
          <div className="app-footer__inner">
            <Logo size={26} />
            <p>
              Educational project. Nutrient values come from USDA FoodData Central;
              glycemic load is estimated. Not a substitute for advice from your
              nephrologist, endocrinologist, or renal dietitian.
            </p>
          </div>
        </footer>
      </div>
    </NutritionProvider>
  );
}
