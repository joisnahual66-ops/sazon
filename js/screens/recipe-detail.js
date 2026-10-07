// Recipe Detail screen: builds the whole screen from one Recipe v1 object.
// It knows nothing about where the recipe comes from (sample now, device database later).
// Layout (D-053): Photo → Identity → Metadata → Ingredients → Let's cook → Notes → Source.

import { h, icon } from '../ui/dom.js';
import { formatAmount, formatMinutes, totalMinutes, formatProvenance } from '../format.js';

const CARD_COLORS = ['salmon', 'mint', 'cream', 'yellow', 'lavender', 'aqua'];
const STEP_COLORS = ['yellow', 'salmon', 'mint', 'lavender'];

function colorClass(color) {
  return `bg-${CARD_COLORS.includes(color) ? color : 'yellow'}`;
}

/* ---------- Sections ---------- */

function topBar() {
  return h('header', { class: 'top-bar' },
    h('a', { class: 'icon-btn', href: './', 'aria-label': 'Back' }, icon('back'))
  );
}

function hero(recipe) {
  // Favorite and Share are visual only in Milestone 03.
  const favorite = h('button', {
    class: 'icon-btn icon-btn--filled',
    type: 'button',
    'aria-label': recipe.isFavorite ? 'Remove from favorites' : 'Add to favorites',
    'aria-pressed': recipe.isFavorite ? 'true' : 'false'
  }, icon('heart'));

  const share = h('button', { class: 'icon-btn icon-btn--filled', type: 'button', 'aria-label': 'Share recipe' }, icon('share'));

  // No photo storage yet: always the placeholder inside the mask.
  const photo = h('div', { class: 'photo-frame' },
    h('div', { class: 'photo-frame__image photo-frame__placeholder', role: 'img', 'aria-label': `Photo of ${recipe.title}` })
  );

  return h('section', { class: 'rd-hero' },
    h('div', { class: `rd-hero__card ${colorClass(recipe.appearance && recipe.appearance.color)}` },
      photo,
      h('div', { class: 'rd-hero__actions' }, favorite, share)
    ),
    h('h1', { class: 't-title rd-hero__title' }, recipe.title),
    recipe.description ? h('p', { class: 't-body t-soft' }, recipe.description) : null
  );
}

// Total time, optional calories and "Serves N" (D-058).
function metadata(recipe) {
  const items = [];
  const minutes = totalMinutes(recipe);
  if (minutes) items.push(['clock', formatMinutes(minutes)]);
  if (recipe.caloriesPerServing) items.push(['flame', `${recipe.caloriesPerServing} kcal`]);
  if (recipe.servings) items.push(['users', `Serves ${recipe.servings}`]);
  if (!items.length) return null;

  return h('div', { class: 'meta-row rd-meta' },
    items.map(([name, text]) => h('span', { class: 'meta' }, icon(name, 'icon--sm'), text))
  );
}

function servingsStepper(servings) {
  // Visual only: scaling arrives in Milestone 08.
  return h('div', { class: 'stepper', role: 'group', 'aria-label': 'Servings' },
    h('button', { class: 'icon-btn stepper__minus', type: 'button', 'aria-label': 'Fewer servings' }, icon('minus')),
    h('span', { class: 'stepper__value' }, h('strong', {}, String(servings)), ' servings'),
    h('button', { class: 'icon-btn stepper__plus', type: 'button', 'aria-label': 'More servings' }, icon('plus'))
  );
}

function unitToggle() {
  // Visual only: conversion arrives in Milestone 08.
  return h('div', { class: 'segmented', role: 'group', 'aria-label': 'Units' },
    h('button', { class: 'segmented__option', type: 'button', 'aria-pressed': 'true' }, 'Metric'),
    h('button', { class: 'segmented__option', type: 'button', 'aria-pressed': 'false' }, 'Imperial')
  );
}

function ingredientRow(item) {
  return h('li', { class: 'ingredient' },
    h('span', { class: 'ingredient__amount' }, formatAmount(item)),
    h('span', { class: 'ingredient__name' },
      item.name,
      item.note ? h('span', { class: 'ingredient__note' }, item.note) : null
    )
  );
}

function ingredients(recipe) {
  if (!recipe.ingredients || !recipe.ingredients.length) return null;

  // Keep the recipe's order; start a new group whenever the section changes.
  const groups = [];
  for (const item of recipe.ingredients) {
    const last = groups[groups.length - 1];
    if (last && last.section === (item.section || null)) last.items.push(item);
    else groups.push({ section: item.section || null, items: [item] });
  }

  return h('section', { class: 'rd-card rd-ingredients', 'aria-labelledby': 'rd-ingredients-title' },
    h('h2', { class: 't-section', id: 'rd-ingredients-title' }, 'Ingredients'),
    h('div', { class: 'rd-ingredients__controls' }, servingsStepper(recipe.servings), unitToggle()),
    groups.map((group) => [
      group.section ? h('h3', { class: 'rd-subhead' }, group.section) : null,
      h('ul', { class: 'ingredient-list' }, group.items.map(ingredientRow))
    ])
  );
}

function steps(recipe) {
  if (!recipe.steps || !recipe.steps.length) return null;

  return h('section', { class: 'rd-steps', 'aria-labelledby': 'rd-steps-title' },
    h('h2', { class: 't-title', id: 'rd-steps-title' }, 'Let’s cook'),
    h('ol', { class: 'step-list' },
      recipe.steps.map((step, i) =>
        h('li', { class: 'step' },
          h('span', { class: `step__number bg-${STEP_COLORS[i % STEP_COLORS.length]}`, 'aria-hidden': 'true' }, String(i + 1)),
          h('p', { class: 'step__text' }, step.text)
        )
      )
    )
  );
}

function notes(recipe) {
  if (!recipe.notes || !recipe.notes.trim()) return null;
  return h('section', { class: 'rd-card rd-notes bg-yellow', 'aria-labelledby': 'rd-notes-title' },
    h('h2', { class: 't-section', id: 'rd-notes-title' }, 'Notes'),
    h('p', { class: 't-body' }, recipe.notes.trim())
  );
}

function source(recipe) {
  const line = formatProvenance(recipe.provenance);
  if (!line) return null;

  const url = recipe.provenance.sourceUrl;
  const safeUrl = url && /^https?:\/\//i.test(url) ? url : null;

  return h('footer', { class: 'rd-source' },
    h('span', { class: 'rd-source__rule', 'aria-hidden': 'true' }),
    h('p', { class: 't-section' }, line),
    safeUrl ? h('a', { class: 't-meta rd-source__link', href: safeUrl, target: '_blank', rel: 'noopener' }, 'View original') : null
  );
}

/* ---------- Screen ---------- */

export function renderRecipeDetail(recipe) {
  return h('main', { class: 'rd' },
    topBar(),
    hero(recipe),
    metadata(recipe),
    ingredients(recipe),
    steps(recipe),
    notes(recipe),
    source(recipe)
  );
}
