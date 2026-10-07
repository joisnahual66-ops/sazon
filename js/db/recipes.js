// Recipe storage. Screens use these functions instead of talking to the database.

import { db } from './database.js';

// Saves (creates or replaces) one Recipe v1 record and stamps updatedAt.
// Full validation belongs to js/model/ (Task 004B); this only guards the essentials.
export async function saveRecipe(recipe) {
  if (!recipe || !recipe.id) throw new Error('Recipe needs an id');
  if (!recipe.title || !String(recipe.title).trim()) throw new Error('Recipe needs a title');

  const now = new Date().toISOString();
  const record = { ...recipe, createdAt: recipe.createdAt || now, updatedAt: now };
  await db.recipes.put(record);
  return record;
}

// One recipe by its UUID, or null.
export async function getRecipe(id) {
  if (!id) return null;
  return (await db.recipes.get(id)) || null;
}

// All recipes, most recently updated first.
export async function listRecipes() {
  return db.recipes.orderBy('updatedAt').reverse().toArray();
}

export async function deleteRecipe(id) {
  await db.recipes.delete(id);
}

export async function countRecipes() {
  return db.recipes.count();
}

// Adds recipes exactly as given (keeps their own timestamps). Used for seeding.
export async function addRecipesAsIs(recipes) {
  await db.recipes.bulkAdd(recipes);
}
