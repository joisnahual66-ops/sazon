// Create/Edit page.
//   edit.html          → new recipe
//   edit.html?id=UUID  → edit that stored recipe
// Validation and saving happen here; the form screen only edits the draft.

import { getRecipe, saveRecipe } from '../db/recipes.js';
import { emptyDraft, draftFromRecipe, validateDraft } from '../model/recipe.js';
import { renderRecipeForm } from '../screens/recipe-form.js';
import { renderRecipeNotFound } from '../screens/recipe-detail.js';

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

  // Unsaved-changes protection: compare the draft with how it started.
  const original = JSON.stringify(draft);
  let leaving = false;
  const hasChanges = () => !leaving && JSON.stringify(draft) !== original;

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
      form.setSaving(true);
      try {
        const stored = await saveRecipe(recipe);
        leaveTo(`./recipe.html?id=${encodeURIComponent(stored.id)}`);
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
