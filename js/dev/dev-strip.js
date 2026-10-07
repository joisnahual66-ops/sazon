// TEMPORARY (Task 004A verification). A small line at the bottom of Recipe Detail,
// shown only when the address contains "dev", proving where the recipe came from.

import { h } from '../ui/dom.js';

export function devStrip(recipe) {
  return h('p', { class: 'dev-strip' },
    `DEV · Loaded from device database (IndexedDB) · id ${recipe.id.slice(0, 8)}… · stored ${recipe.updatedAt} · photo: ${recipe.photoId ? recipe.photoId.slice(0, 8) + '… (from IndexedDB)' : 'none'}`
  );
}
