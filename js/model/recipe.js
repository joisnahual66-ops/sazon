// The recipe draft used by the Create/Edit form, and the rules for turning it into
// a valid Recipe v1 record (Appendix A). No screen code and no database code here.
//
// A draft has the Recipe v1 shape, except that the fields a person types numbers into
// hold the text as typed until Save:
//   servings, prepMinutes, cookMinutes, caloriesPerServing  → text
//   each ingredient's amount                                → ingredient.amountText
// validateDraft() turns that text into numbers and reports anything it can't understand.

import { parseQuantity, quantityToText } from './quantity.js';

export const SCHEMA_VERSION = 1;
export const SOURCE_TYPES = ['own', 'person', 'book', 'website', 'other'];
const CARD_COLORS = ['salmon', 'mint', 'cream', 'yellow', 'lavender', 'aqua'];

export function newId() {
  if (crypto.randomUUID) return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const hex = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

// Until categories exist, a new recipe gets a card color picked from its id,
// so different recipes don't all look the same.
function colorFor(id) {
  let sum = 0;
  for (const ch of id) sum += ch.charCodeAt(0);
  return CARD_COLORS[sum % CARD_COLORS.length];
}

export function emptyIngredient() {
  return { id: newId(), amountText: '', unit: 'none', name: '', note: '', section: '' };
}

export function emptyStep() {
  return { id: newId(), text: '', photoId: null };
}

export function emptyDraft() {
  const id = newId();
  return {
    id,
    schemaVersion: SCHEMA_VERSION,
    title: '',
    description: '',
    categoryIds: [],
    servings: '4',
    prepMinutes: '',
    cookMinutes: '',
    caloriesPerServing: '',
    ingredients: [emptyIngredient()],
    steps: [emptyStep()],
    notes: '',
    photoId: null,
    appearance: { color: colorFor(id), mask: 'blob-1', treatment: 'natural' },
    isFavorite: false,
    provenance: { sourceType: 'own', sourceName: '', sourceUrl: '', basedOn: null },
    createdAt: null,
    updatedAt: null
  };
}

const toText = (n) => (n === null || n === undefined ? '' : String(n));

// Stored Recipe v1 → editable draft (keeps id, createdAt and every field the form doesn't show).
export function draftFromRecipe(recipe) {
  const copy = structuredClone(recipe);
  return {
    ...copy,
    servings: toText(copy.servings),
    prepMinutes: toText(copy.prepMinutes),
    cookMinutes: toText(copy.cookMinutes),
    caloriesPerServing: toText(copy.caloriesPerServing),
    ingredients: (copy.ingredients || []).map((item) => ({
      id: item.id || newId(),
      amountText: quantityToText(item.quantity, item.quantityMax),
      unit: item.unit || 'none',
      name: item.name || '',
      note: item.note || '',
      section: item.section || ''
    })),
    steps: (copy.steps || []).map((step) => ({ ...step, id: step.id || newId(), text: step.text || '' })),
    notes: copy.notes || '',
    provenance: {
      sourceType: (copy.provenance && copy.provenance.sourceType) || 'own',
      sourceName: (copy.provenance && copy.provenance.sourceName) || '',
      sourceUrl: (copy.provenance && copy.provenance.sourceUrl) || '',
      basedOn: (copy.provenance && copy.provenance.basedOn) || null
    }
  };
}

const blank = (value) => !String(value ?? '').trim();
const clean = (value) => (blank(value) ? null : String(value).trim());

function wholeNumber(text, { min }) {
  const t = String(text ?? '').trim();
  if (!/^\d+$/.test(t)) return NaN;
  const n = Number(t);
  return n >= min ? n : NaN;
}

function optionalWhole(text) {
  if (blank(text)) return null;
  return wholeNumber(text, { min: 0 });
}

function optionalNumber(text) {
  if (blank(text)) return null;
  const n = Number(String(text).trim().replace(',', '.'));
  return Number.isFinite(n) && n >= 0 ? n : NaN;
}

// → { errors: [{ field, message }], recipe }   (recipe is null when there are errors)
// Never changes the draft, so nothing the person typed is lost.
export function validateDraft(draft) {
  const errors = [];

  const title = String(draft.title ?? '').trim();
  if (!title) errors.push({ field: 'title', message: 'Give your recipe a name.' });

  const servings = wholeNumber(draft.servings, { min: 1 });
  if (Number.isNaN(servings)) errors.push({ field: 'servings', message: 'Servings must be a whole number, 1 or more.' });

  const prepMinutes = optionalWhole(draft.prepMinutes);
  if (Number.isNaN(prepMinutes)) errors.push({ field: 'prepMinutes', message: 'Prep time must be a whole number of minutes.' });

  const cookMinutes = optionalWhole(draft.cookMinutes);
  if (Number.isNaN(cookMinutes)) errors.push({ field: 'cookMinutes', message: 'Cook time must be a whole number of minutes.' });

  const caloriesPerServing = optionalNumber(draft.caloriesPerServing);
  if (Number.isNaN(caloriesPerServing)) errors.push({ field: 'caloriesPerServing', message: 'Calories must be a number.' });

  // Ingredients: completely empty rows are skipped; partly filled rows must have a name.
  const ingredients = [];
  draft.ingredients.forEach((item, index) => {
    const empty = blank(item.name) && blank(item.amountText) && blank(item.note);
    if (empty) return;
    const label = `Ingredient ${index + 1}`;
    if (blank(item.name)) errors.push({ field: `ingredient:${item.id}:name`, message: `${label} needs a name.` });

    const unit = blank(item.unit) ? 'none' : String(item.unit).trim();
    const amount = unit === 'to_taste' ? { ok: true, quantity: null, quantityMax: null } : parseQuantity(item.amountText);
    if (!amount.ok) {
      errors.push({ field: `ingredient:${item.id}:amount`, message: `${label}: “${String(item.amountText).trim()}” isn’t an amount I understand. Try 2, 1/2, 0.5 or 2-3.` });
    }

    ingredients.push({
      id: item.id,
      quantity: amount.ok ? amount.quantity : null,
      quantityMax: amount.ok ? amount.quantityMax : null,
      unit,
      name: String(item.name ?? '').trim(),
      note: clean(item.note),
      section: clean(item.section)
    });
  });

  // Steps: empty steps are skipped.
  const steps = draft.steps
    .filter((step) => !blank(step.text))
    .map((step) => ({ id: step.id, text: String(step.text).trim(), photoId: step.photoId ?? null }));

  // Source
  const p = draft.provenance || {};
  const sourceType = SOURCE_TYPES.includes(p.sourceType) ? p.sourceType : 'own';
  let sourceUrl = sourceType === 'website' ? clean(p.sourceUrl) : null;
  if (sourceUrl && !/^https?:\/\//i.test(sourceUrl)) sourceUrl = `https://${sourceUrl}`;
  const provenance = {
    sourceType,
    sourceName: sourceType === 'own' ? null : clean(p.sourceName),
    sourceUrl,
    basedOn: p.basedOn || null
  };

  if (errors.length) return { errors, recipe: null };

  const recipe = {
    ...structuredClone(draft),
    schemaVersion: SCHEMA_VERSION,
    title,
    description: clean(draft.description) || '',
    categoryIds: Array.isArray(draft.categoryIds) ? draft.categoryIds : [],
    servings,
    prepMinutes,
    cookMinutes,
    caloriesPerServing,
    ingredients,
    steps,
    notes: clean(draft.notes) || '',
    provenance
  };
  return { errors: [], recipe };
}
