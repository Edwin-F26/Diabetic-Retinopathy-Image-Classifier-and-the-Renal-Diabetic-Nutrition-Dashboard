import { createContext, useContext } from 'react';

export const NutritionContext = createContext(null);

export function useNutrition() {
  const value = useContext(NutritionContext);
  if (!value) {
    throw new Error('useNutrition must be used inside a NutritionProvider.');
  }
  return value;
}
