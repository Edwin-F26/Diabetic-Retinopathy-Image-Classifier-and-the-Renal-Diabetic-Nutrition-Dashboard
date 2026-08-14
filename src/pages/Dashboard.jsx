import AlertsPanel from '../components/AlertsPanel';
import DailyTotals from '../components/DailyTotals';
import FoodSearch from '../components/FoodSearch';
import Hero from '../components/Hero';
import MealLog from '../components/MealLog';
import TargetsPanel from '../components/TargetsPanel';
import TrendCharts from '../components/TrendCharts';

export default function Dashboard() {
  return (
    <>
      <Hero />

      <div className="layout">
        <div className="layout__main">
          <DailyTotals />
          <MealLog />
          <TrendCharts />
        </div>

        <aside className="layout__aside" aria-label="Logging and limits">
          <FoodSearch />
          <AlertsPanel />
          <TargetsPanel />
        </aside>
      </div>
    </>
  );
}
