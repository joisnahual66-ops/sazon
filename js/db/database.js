// The device database (IndexedDB via Dexie). The ONLY file that configures Dexie.
// Screens never import this file; they use the functions in js/db/recipes.js.

import Dexie from '../vendor/dexie.mjs';

export const DATABASE_NAME = 'sazon';

export const db = new Dexie(DATABASE_NAME);

// Schema version 1 (D-015, D-016). Listed fields are indexes (used for lookups and
// sorting); every other Recipe v1 field is stored too, it just isn't indexed.
//   recipes:    by id; sortable by title / createdAt / updatedAt; findable by category
//   categories: by id; sortable by order            (filled in a later milestone)
//   photos:     by id                               (filled in a later milestone)
//   settings:   by id (single record "settings")    (filled in a later milestone)
// To change the schema later: add db.version(2).stores({...}) below, never edit version 1.
db.version(1).stores({
  recipes: 'id, title, createdAt, updatedAt, *categoryIds',
  categories: 'id, order',
  photos: 'id',
  settings: 'id'
});

export const SCHEMA_VERSION = 1;

// Ask the browser not to clear our data when the phone runs low on space.
// The browser may say no; the answer is reported, never assumed.
export async function requestPersistentStorage() {
  if (!navigator.storage || !navigator.storage.persist) return 'unsupported';
  if (await navigator.storage.persisted()) return 'granted';
  return (await navigator.storage.persist()) ? 'granted' : 'not granted';
}

export async function storageEstimate() {
  if (!navigator.storage || !navigator.storage.estimate) return null;
  const { usage, quota } = await navigator.storage.estimate();
  return { usage, quota };
}
