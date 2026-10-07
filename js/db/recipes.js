// Recipe storage. Screens use these functions instead of talking to the database.

import { db } from './database.js';

// Saves (creates or replaces) one Recipe v1 record and stamps updatedAt.
// Full validation belongs to js/model/; this only guards the essentials.
//
// Photos (D-065): everything happens in ONE database transaction, so either all of it
// is saved or none of it is:
//   options.newPhoto        — photo record to store (its id is already in recipe.photoId)
//   options.previousPhotoId — the photo the recipe had before editing; deleted only if
//                             the saved recipe no longer uses it (replaced or removed)
export async function saveRecipe(recipe, options = {}) {
  if (!recipe || !recipe.id) throw new Error('Recipe needs an id');
  if (!recipe.title || !String(recipe.title).trim()) throw new Error('Recipe needs a title');

  const now = new Date().toISOString();
  const record = { ...recipe, createdAt: recipe.createdAt || now, updatedAt: now };
  const { newPhoto, previousPhotoId } = options;

  await db.transaction('rw', db.recipes, db.photos, async () => {
    if (newPhoto) await db.photos.put(newPhoto);
    await db.recipes.put(record);
    if (previousPhotoId && previousPhotoId !== record.photoId) await db.photos.delete(previousPhotoId);
  });
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

// Deletes a recipe together with its photo, so no photo is left behind.
export async function deleteRecipe(id) {
  await db.transaction('rw', db.recipes, db.photos, async () => {
    const recipe = await db.recipes.get(id);
    if (recipe && recipe.photoId) await db.photos.delete(recipe.photoId);
    await db.recipes.delete(id);
  });
}

export async function countRecipes() {
  return db.recipes.count();
}

// Adds recipes exactly as given (keeps their own timestamps). Used for seeding.
export async function addRecipesAsIs(recipes) {
  await db.recipes.bulkAdd(recipes);
}
