// Create/Edit page.
//   edit.html          → new recipe
//   edit.html?id=UUID  → edit that stored recipe
// Validation, photo processing and saving happen here; the form screen only edits the draft.

import { getRecipe, saveRecipe } from '../db/recipes.js';
import { getPhoto, photoRecord } from '../db/photos.js';
import { emptyDraft, draftFromRecipe, validateDraft, newId } from '../model/recipe.js';
import { processPhoto, UnsupportedImageError } from '../media/resize-image.js';
import { formatBytes } from '../format.js';
import { renderRecipeForm } from '../screens/recipe-form.js';
import { renderRecipeNotFound } from '../screens/recipe-detail.js';
import { photoField } from '../ui/photo-field.js';

const app = document.getElementById('app');
const id = new URLSearchParams(location.search).get('id');

async function start() {
  let draft;
  if (id) {
    const stored = await getRecipe(id);
    if (!stored) {
      app.replaceChildren(renderRecipeNotFound());
      return;
    }
    draft = draftFromRecipe(stored);
  } else {
    draft = emptyDraft();
  }

  const isNew = !id;
  document.title = `${isNew ? 'New recipe' : 'Edit recipe'} · Sazón`;

  // ----- Photo (D-065) -----
  // Nothing is written or deleted until Save. Cancelling never touches the stored photo.
  const storedPhotoId = draft.photoId || null;
  const photo = { pending: null, removed: false, url: null };
  const photoChanged = () => photo.pending !== null || (photo.removed && storedPhotoId !== null);

  const showUrl = (blob) => {
    if (photo.url) URL.revokeObjectURL(photo.url);
    photo.url = URL.createObjectURL(blob);
    return photo.url;
  };

  let initialPhoto = null;
  if (storedPhotoId) {
    const stored = await getPhoto(storedPhotoId);
    if (stored) {
      initialPhoto = {
        url: showUrl(stored.display),
        info: `DEV · stored photo ${formatBytes(stored.display.size)} (${stored.width}×${stored.height}) + thumbnail ${formatBytes(stored.thumb.size)}`
      };
    }
  }

  const photoSection = photoField({
    initial: initialPhoto,
    async onPick(file) {
      let processed;
      try {
        processed = await processPhoto(file);
      } catch (error) {
        const friendly = new Error('photo');
        friendly.userMessage = error instanceof UnsupportedImageError
          ? 'This photo’s format can’t be opened on this phone. Try a regular JPEG photo.'
          : 'That photo couldn’t be prepared. Please try another one.';
        throw friendly;
      }
      photo.pending = processed;
      photo.removed = false;
      return {
        url: showUrl(processed.display),
        info: `DEV · original ${formatBytes(processed.originalBytes)} → photo ${formatBytes(processed.display.size)} (${processed.width}×${processed.height}) + thumbnail ${formatBytes(processed.thumb.size)}`
      };
    },
    onRemove() {
      photo.pending = null;
      photo.removed = true;
    }
  });

  // ----- Unsaved-changes protection -----
  const original = JSON.stringify(draft);
  let leaving = false;
  const hasChanges = () => !leaving && (JSON.stringify(draft) !== original || photoChanged());

  window.addEventListener('beforeunload', (event) => {
    if (hasChanges()) {
      event.preventDefault();
      event.returnValue = '';
    }
  });

  const leaveTo = (url) => {
    leaving = true;
    location.replace(url);
  };

  const form = renderRecipeForm(draft, {
    isNew,
    photoSection,
    onCancel() {
      if (hasChanges() && !confirm('Discard your changes?')) return;
      leaveTo(isNew ? './' : `./recipe.html?id=${encodeURIComponent(draft.id)}`);
    },
    async onSave() {
      const { errors, recipe } = validateDraft(draft);
      if (errors.length) {
        form.showErrors(errors);
        return;
      }

      let newPhoto = null;
      if (photo.pending) {
        const photoId = newId();
        newPhoto = photoRecord(photoId, photo.pending);
        recipe.photoId = photoId;
      } else if (photo.removed) {
        recipe.photoId = null;
      } else {
        recipe.photoId = storedPhotoId;
      }

      form.setSaving(true);
      try {
        const saved = await saveRecipe(recipe, { newPhoto, previousPhotoId: storedPhotoId });
        leaveTo(`./recipe.html?id=${encodeURIComponent(saved.id)}`);
      } catch (error) {
        console.error('Save failed:', error);
        form.setSaving(false);
        form.showErrors([{ field: null, message: 'Your recipe couldn’t be saved on this device. Nothing you typed was lost — please try Save again.' }]);
      }
    }
  });

  app.replaceChildren(form.element);
}

start().catch((error) => {
  console.error('Could not open the form:', error);
  app.replaceChildren(renderRecipeNotFound());
});
