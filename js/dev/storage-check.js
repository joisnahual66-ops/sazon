// TEMPORARY (Task 004A verification). Builds the "Storage check" list on the start page
// so the database can be verified on the phone without developer tools.

import { h } from '../ui/dom.js';
import { DATABASE_NAME, SCHEMA_VERSION, requestPersistentStorage, storageEstimate } from '../db/database.js';
import { listRecipes, getRecipe } from '../db/recipes.js';
import { photoStats } from '../db/photos.js';
import { ensureSeed, SEED_RECIPE_ID } from '../db/seed.js';

function row(label, value, ok) {
  return h('li', { class: 'dev-check__row' },
    h('span', {}, label),
    h('strong', { class: ok === false ? 'dev-check__bad' : null }, value)
  );
}

function size(bytes) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
}

export async function runStorageCheck(container) {
  const rows = [];
  try {
    const seed = await ensureSeed();
    rows.push(row('Database', `Opened ✓ (${DATABASE_NAME}, schema v${SCHEMA_VERSION})`));
    rows.push(row('Seed recipe', seed.addedNow ? 'Stored now (first launch)' : 'Already stored ✓ (not added again)'));
    const all = await listRecipes();
    rows.push(row('Recipes in database', String(all.length)));
    rows.push(h('li', { class: 'dev-check__row' },
      h('span', {}, 'Open a stored recipe'),
      h('ul', { class: 'dev-check__recipes' }, all.map((r) =>
        h('li', {}, h('a', { href: `./recipe.html?id=${encodeURIComponent(r.id)}&dev` }, r.title))
      ))
    ));

    const photos = await photoStats();
    const linked = all.filter((r) => r.photoId).length;
    rows.push(row('Photos stored', `${photos.count} (${size(photos.bytes)}) · recipes with a photo: ${linked}`, photos.count === linked));

    const recipe = await getRecipe(SEED_RECIPE_ID);
    rows.push(row('Read back', recipe ? `${recipe.title} ✓` : 'Missing', !!recipe));

    const persist = await requestPersistentStorage();
    rows.push(row('Persistent storage', persist === 'granted' ? 'Granted ✓' : persist === 'unsupported' ? 'Not supported' : 'Not granted (browser may clear data if space runs low)', persist === 'granted'));

    const estimate = await storageEstimate();
    if (estimate) rows.push(row('Space used', `${size(estimate.usage)} of ${size(estimate.quota)} available`));
  } catch (error) {
    rows.push(row('Database', `Error: ${error.name || error}`, false));
  }

  container.replaceChildren(
    h('p', { class: 'dev-check__title' }, 'DEV · Storage check (temporary)'),
    h('ul', { class: 'dev-check__list' }, rows)
  );
}
