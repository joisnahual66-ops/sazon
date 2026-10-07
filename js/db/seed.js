// DEVELOPMENT SEED (temporary). On first run, when there are no recipes,
// stores the Tacos de pollo sample so screens have real stored data to read.
// Remove once recipes can be created in the app (Task 004B or later).

import { sampleRecipe } from '../data/sample-recipe.js';
import { countRecipes, addRecipesAsIs } from './recipes.js';

export const SEED_RECIPE_ID = sampleRecipe.id;

let pending = null;

// Safe to call from every page: runs once per page load, never duplicates.
// Returns { addedNow: true } only on the launch that actually stored the seed.
export function ensureSeed() {
  if (!pending) {
    pending = (async () => {
      if ((await countRecipes()) > 0) return { addedNow: false };
      try {
        await addRecipesAsIs([structuredClone(sampleRecipe)]);
        return { addedNow: true };
      } catch (error) {
        // Another open page stored it at the same moment: same fixed id, so no duplicate.
        if (error && error.name === 'BulkError') return { addedNow: false };
        throw error;
      }
    })();
  }
  return pending;
}
