// Photo storage (D-016, D-020). Screens use these functions instead of the database.
// A photo record: { id, display: Blob, thumb: Blob, width, height, createdAt }

import { db } from './database.js';

export async function getPhoto(id) {
  if (!id) return null;
  return (await db.photos.get(id)) || null;
}

// For the temporary storage check: how many photos and how much space they use.
export async function photoStats() {
  let count = 0;
  let bytes = 0;
  await db.photos.each((photo) => {
    count += 1;
    bytes += (photo.display ? photo.display.size : 0) + (photo.thumb ? photo.thumb.size : 0);
  });
  return { count, bytes };
}

export function photoRecord(id, processed) {
  return {
    id,
    display: processed.display,
    thumb: processed.thumb,
    width: processed.width,
    height: processed.height,
    createdAt: new Date().toISOString()
  };
}
