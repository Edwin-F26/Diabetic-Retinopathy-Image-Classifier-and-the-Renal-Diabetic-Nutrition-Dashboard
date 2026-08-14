import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { searchFoods, USING_DEMO_KEY } from '../lib/fdc';
import { searchOfflineFoods } from '../data/offlineFoods';
import useDebouncedValue from '../hooks/useDebouncedValue';
import { MEALS } from '../lib/nutrition';
import { useNutrition } from '../state/nutritionContext';
import PortionPicker from './PortionPicker';
import Toast from './Toast';
import { IconAlert, IconMinus, IconPlus, IconSearch, MealIcon } from './Icons';

const QUICK_SEARCHES = ['banana', 'chicken breast', 'white rice', 'greek yogurt'];
const MIN_QUERY_LENGTH = 2;
const SKELETON_ROWS = 4;

const EMPTY_SEARCH = { query: '', results: [], error: null, offline: false };

export default function FoodSearch() {
  const { addFood } = useNutrition();
  const [query, setQuery] = useState('');
  const [meal, setMeal] = useState(MEALS[0].id);
  const [search, setSearch] = useState(EMPTY_SEARCH);
  const [selectedFood, setSelectedFood] = useState(null);
  const [toast, setToast] = useState(null);

  const inputRef = useRef(null);
  const searchId = useId();
  const trimmed = useDebouncedValue(query, 400).trim();

  useEffect(() => {
    if (trimmed.length < MIN_QUERY_LENGTH) return undefined;

    const controller = new AbortController();
    let cancelled = false;

    searchFoods(trimmed, { signal: controller.signal })
      .then((foods) => {
        if (!cancelled) setSearch({ query: trimmed, results: foods, error: null, offline: false });
      })
      .catch((err) => {
        if (cancelled || err?.name === 'AbortError') return;
        // Keep the app usable when the API is unavailable by falling back to
        // the bundled pantry rather than showing an empty screen.
        setSearch({
          query: trimmed,
          results: searchOfflineFoods(trimmed),
          error: err.message ?? 'Food search failed.',
          offline: true,
        });
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [trimmed]);

  // Results are only shown when they belong to the query currently on screen,
  // which keeps stale matches from flashing while a new search is in flight.
  const isCurrent = trimmed.length >= MIN_QUERY_LENGTH && search.query === trimmed;
  const isLoading = trimmed.length >= MIN_QUERY_LENGTH && !isCurrent;
  const results = isCurrent ? search.results : [];
  const error = isCurrent ? search.error : null;

  const dismissToast = useCallback(() => setToast(null), []);

  const handleLog = ({ food, grams, portionLabel }) => {
    addFood({ food, meal, grams, portionLabel });
    setToast({
      key: Date.now(),
      title: food.description,
      detail: `${portionLabel} · added to ${MEALS.find((m) => m.id === meal)?.label.toLowerCase()}`,
    });
    setSelectedFood(null);
    inputRef.current?.focus();
  };

  return (
    <section className="panel panel--search reveal" aria-labelledby={`${searchId}-heading`}>
      <header className="panel__header">
        <div className="panel__heading">
          <span className="panel__icon panel__icon--accent">
            <IconSearch size={18} />
          </span>
          <div>
            <h2 className="panel__title" id={`${searchId}-heading`}>
              Log a food
            </h2>
            <p className="panel__subtitle">
              Search, pick a portion, done.
            </p>
          </div>
        </div>
      </header>

      <div className="field">
        <span className="field__label" id={`${searchId}-meal-label`}>
          Add to
        </span>
        <div
          className="meal-toggle"
          role="radiogroup"
          aria-labelledby={`${searchId}-meal-label`}
        >
          {MEALS.map((option) => (
            <label
              key={option.id}
              className={`meal-toggle__option${meal === option.id ? ' meal-toggle__option--active' : ''}`}
            >
              <input
                type="radio"
                name={`${searchId}-meal`}
                value={option.id}
                checked={meal === option.id}
                onChange={() => setMeal(option.id)}
              />
              <MealIcon meal={option.id} size={15} />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="field">
        <label className="visually-hidden" htmlFor={`${searchId}-input`}>
          Search foods
        </label>
        <div className="search-input">
          <span className="search-input__icon" aria-hidden>
            <IconSearch size={17} />
          </span>
          <input
            id={`${searchId}-input`}
            ref={inputRef}
            className="search-input__control"
            type="search"
            placeholder="Try oatmeal, salmon, whole wheat bread…"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSelectedFood(null);
            }}
            autoComplete="off"
            spellCheck="false"
            aria-describedby={`${searchId}-hint`}
          />
          {isLoading && <span className="search-input__spinner" aria-hidden />}
        </div>
        <p className="field__hint" id={`${searchId}-hint`}>
          Live results from USDA FoodData Central.
        </p>
      </div>

      <div className="quick-chips">
        {QUICK_SEARCHES.map((term) => (
          <button
            key={term}
            type="button"
            className="chip"
            onClick={() => {
              setQuery(term);
              setSelectedFood(null);
            }}
          >
            {term}
          </button>
        ))}
      </div>

      {error && (
        <p className="notice notice--warn" role="alert">
          <IconAlert size={16} />
          <span>
            {error}
            {search.offline && results.length > 0
              ? ' Showing matches from the built-in offline pantry instead.'
              : ''}
            {USING_DEMO_KEY && (
              <>
                {' '}
                <a
                  className="notice__link"
                  href="https://fdc.nal.usda.gov/api-key-signup"
                  target="_blank"
                  rel="noreferrer"
                >
                  Get a free API key
                </a>
              </>
            )}
          </span>
        </p>
      )}

      {isLoading && (
        <ul className="result-list" aria-hidden>
          {Array.from({ length: SKELETON_ROWS }, (_, i) => (
            <li key={i} className="skeleton-row" style={{ '--delay': `${i * 80}ms` }}>
              <span className="skeleton skeleton--title" />
              <span className="skeleton skeleton--meta" />
            </li>
          ))}
        </ul>
      )}

      {isCurrent && results.length === 0 && (
        <p className="notice" role="status">
          No foods matched “{trimmed}”. Try a simpler term, like a single
          ingredient.
        </p>
      )}

      {results.length > 0 && (
        <ul className="result-list">
          {results.map((food, index) => {
            const isOpen = selectedFood?.id === food.id;
            return (
              <li
                key={food.id}
                className={`result-item${isOpen ? ' result-item--open' : ''} reveal`}
                style={{ '--delay': `${Math.min(index, 8) * 40}ms` }}
              >
                <button
                  type="button"
                  className="result-item__main"
                  aria-expanded={isOpen}
                  onClick={() => setSelectedFood(isOpen ? null : food)}
                >
                  <span className="result-item__text">
                    <span className="result-item__name">{food.description}</span>
                    <span className="result-item__meta">
                      {food.brand && <span className="result-item__brand">{food.brand}</span>}
                      <span className="tag">{food.dataType}</span>
                    </span>
                    <span className="result-item__quick">
                      <span className="micro micro--carb">
                        {Math.round(food.per100g.carbs)}g carb
                      </span>
                      <span className="micro micro--k">
                        {Math.round(food.per100g.potassium)}mg K
                      </span>
                      <span className="micro micro--p">
                        {Math.round(food.per100g.phosphorus)}mg P
                      </span>
                      <span className="micro micro--muted">per 100 g</span>
                    </span>
                  </span>
                  <span className="result-item__chevron" aria-hidden>
                    {isOpen ? <IconMinus size={16} /> : <IconPlus size={16} />}
                  </span>
                </button>

                {isOpen && (
                  <PortionPicker
                    food={food}
                    onLog={handleLog}
                    onCancel={() => setSelectedFood(null)}
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}

      <Toast toast={toast} onDismiss={dismissToast} />
    </section>
  );
}
