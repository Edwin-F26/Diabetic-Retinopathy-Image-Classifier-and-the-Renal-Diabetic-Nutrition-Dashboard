import { useState } from 'react';
import { buildSampleDay } from '../data/sampleDay';
import { MEALS } from '../lib/nutrition';
import { useNutrition } from '../state/nutritionContext';
import { formatAmount } from '../lib/format';
import { IconSparkles, IconTrash, MealIcon } from './Icons';

const ROW_METRICS = [
  { key: 'energy', unit: 'kcal', short: 'kcal' },
  { key: 'netCarbs', unit: 'g', short: 'net carb' },
  { key: 'sodium', unit: 'mg', short: 'Na' },
  { key: 'potassium', unit: 'mg', short: 'K' },
  { key: 'phosphorus', unit: 'mg', short: 'P' },
];

function EntryRow({ entry, index, onRemove, onUpdate, onMove }) {
  const [editing, setEditing] = useState(false);
  const [grams, setGrams] = useState(String(Math.round(entry.grams)));

  const commit = () => {
    const next = Number(grams);
    if (Number.isFinite(next) && next > 0) {
      onUpdate(entry.id, next, `${Math.round(next)} g`);
    }
    setEditing(false);
  };

  return (
    <li className="entry reveal" style={{ '--delay': `${index * 40}ms` }}>
      <div className="entry__main">
        <p className="entry__name">
          {entry.description}
          {entry.brand && <span className="entry__brand">{entry.brand}</span>}
        </p>

        {editing ? (
          <div className="entry__edit">
            <label className="visually-hidden" htmlFor={`grams-${entry.id}`}>
              Weight in grams for {entry.description}
            </label>
            <input
              id={`grams-${entry.id}`}
              className="input input--tiny"
              type="number"
              min="1"
              step="1"
              value={grams}
              autoFocus
              onChange={(event) => setGrams(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') commit();
                if (event.key === 'Escape') setEditing(false);
              }}
            />
            <span className="entry__edit-unit">g</span>
            <button type="button" className="button button--tiny" onClick={commit}>
              Save
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="entry__portion"
            onClick={() => {
              setGrams(String(Math.round(entry.grams)));
              setEditing(true);
            }}
          >
            {entry.portionLabel} · {formatAmount(entry.grams, 'g')} g
            <span className="entry__portion-hint">edit</span>
          </button>
        )}
      </div>

      <ul className="entry__stats">
        {ROW_METRICS.map((metric) => (
          <li key={metric.key} className="entry__stat">
            <span className="entry__stat-value">
              {formatAmount(entry.nutrients[metric.key], metric.unit)}
            </span>
            <span className="entry__stat-label">{metric.short}</span>
          </li>
        ))}
      </ul>

      <div className="entry__actions">
        <label className="visually-hidden" htmlFor={`meal-${entry.id}`}>
          Move {entry.description} to another meal
        </label>
        <select
          id={`meal-${entry.id}`}
          className="select select--tiny"
          value={entry.meal}
          onChange={(event) => onMove(entry.id, event.target.value)}
        >
          {MEALS.map((meal) => (
            <option key={meal.id} value={meal.id}>
              {meal.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="icon-button icon-button--danger"
          onClick={() => onRemove(entry.id)}
          aria-label={`Remove ${entry.description}`}
        >
          <IconTrash size={16} />
        </button>
      </div>
    </li>
  );
}

function EmptyDay({ onLoadSample }) {
  return (
    <div className="empty-day">
      <img
        className="empty-day__art"
        src="/images/empty-plate.png"
        alt=""
        width="200"
        height="200"
        loading="lazy"
      />
      <h3 className="empty-day__title">Nothing on the plate yet</h3>
      <p className="empty-day__text">
        Search a food in the panel above to start today&apos;s log — or drop in a
        realistic sample day to see how the dashboard reacts when limits get
        pushed.
      </p>
      <button type="button" className="button button--primary" onClick={onLoadSample}>
        <IconSparkles size={16} />
        Load a sample day
      </button>
    </div>
  );
}

export default function MealLog() {
  const {
    entries,
    mealTotals,
    removeEntry,
    updatePortion,
    moveEntry,
    clearDay,
    addEntries,
    selectedDate,
  } = useNutrition();

  return (
    <section className="panel reveal" aria-labelledby="meal-log-heading">
      <header className="panel__header">
        <div className="panel__heading">
          <span className="panel__icon">
            <MealIcon meal="lunch" size={18} />
          </span>
          <div>
            <h2 className="panel__title" id="meal-log-heading">
              Meals
            </h2>
            <p className="panel__subtitle">
              {entries.length === 0
                ? 'Nothing logged yet.'
                : `${entries.length} item${entries.length === 1 ? '' : 's'} across the day.`}
            </p>
          </div>
        </div>
        {entries.length > 0 && (
          <button type="button" className="button button--ghost" onClick={clearDay}>
            Clear day
          </button>
        )}
      </header>

      {entries.length === 0 ? (
        <EmptyDay onLoadSample={() => addEntries(buildSampleDay(), selectedDate)} />
      ) : (
        MEALS.map((meal) => {
          const mealEntries = entries.filter((entry) => entry.meal === meal.id);
          const totals = mealTotals[meal.id];

          return (
            <div key={meal.id} className="meal-block">
              <div className="meal-block__head">
                <h3 className="meal-block__title">
                  <span className={`meal-block__icon meal-block__icon--${meal.id}`}>
                    <MealIcon meal={meal.id} size={15} />
                  </span>
                  {meal.label}
                  <span className="meal-block__count">{mealEntries.length}</span>
                </h3>
                {mealEntries.length > 0 && (
                  <p className="meal-block__totals">
                    {formatAmount(totals.energy, 'kcal')} kcal ·{' '}
                    {formatAmount(totals.netCarbs, 'g')} g net carb ·{' '}
                    {formatAmount(totals.sodium, 'mg')} mg Na ·{' '}
                    {formatAmount(totals.potassium, 'mg')} mg K ·{' '}
                    {formatAmount(totals.phosphorus, 'mg')} mg P
                  </p>
                )}
              </div>

              {mealEntries.length === 0 ? (
                <p className="meal-block__empty">No items yet.</p>
              ) : (
                <ul className="entry-list">
                  {mealEntries.map((entry, index) => (
                    <EntryRow
                      key={entry.id}
                      entry={entry}
                      index={index}
                      onRemove={removeEntry}
                      onUpdate={updatePortion}
                      onMove={moveEntry}
                    />
                  ))}
                </ul>
              )}
            </div>
          );
        })
      )}
    </section>
  );
}
