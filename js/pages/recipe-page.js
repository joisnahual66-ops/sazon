// Recipe Detail page: reads one recipe from the device database and shows it.
// Address: recipe.html?id=<recipe UUID>  (D-055). Without an id, shows the most recent recipe.

import { getRecipe, listRecipes } from '../db/recipes.js';
import { ensureSeed } from '../db/seed.js';
import { renderRecipeDetail, renderRecipeNotFound } from '../screens/recipe-detail.js';
import { bottomNav } from '../ui/bottom-nav.js';
import { devStrip } from '../dev/dev-strip.js';

const app = document.getElementById('app');
const params = new URLSearchParams(location.search);

async function show() {
  await ensureSeed();

  const id = params.get('id');
  const recipe = id ? await getRecipe(id) : (await listRecipes())[0] || null;

  if (!recipe) {
    app.replaceChildren(renderRecipeNotFound(), bottomNav('recipes'));
    return;
  }

  document.title = `${recipe.title} · Sazón`;
  const screen = renderRecipeDetail(recipe);
  if (params.has('dev')) screen.append(devStrip(recipe));
  app.replaceChildren(screen, bottomNav('recipes'));
}

show().catch((error) => {
  console.error('Could not open the recipe database:', error);
  app.replaceChildren(renderRecipeNotFound(), bottomNav('recipes'));
});
