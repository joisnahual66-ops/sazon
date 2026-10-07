// Recipe Detail page: picks a recipe and shows it.
// Today the recipe is the development sample; later it will be read from the device.

import { sampleRecipe } from '../data/sample-recipe.js';
import { renderRecipeDetail } from '../screens/recipe-detail.js';
import { bottomNav } from '../ui/bottom-nav.js';

const recipe = sampleRecipe;

document.title = `${recipe.title} · Sazón`;
document.getElementById('app').replaceChildren(
  renderRecipeDetail(recipe),
  bottomNav('recipes')
);
