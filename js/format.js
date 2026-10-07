// Turns Recipe v1 values into display text.
// Display only: no scaling or unit conversion here (Milestone 08).

const FRACTIONS = [
  [0.25, '¼'], [0.333, '⅓'], [0.5, '½'], [0.667, '⅔'], [0.75, '¾']
];

export function formatNumber(n) {
  const whole = Math.floor(n);
  const rest = n - whole;
  if (rest < 0.01) return String(whole);
  for (const [value, glyph] of FRACTIONS) {
    if (Math.abs(rest - value) < 0.02) return whole ? `${whole}${glyph}` : glyph;
  }
  return String(Math.round(n * 100) / 100);
}

const UNIT_LABELS = {
  g: ['g', 'g'],
  kg: ['kg', 'kg'],
  ml: ['ml', 'ml'],
  l: ['l', 'l'],
  tsp: ['tsp', 'tsp'],
  tbsp: ['tbsp', 'tbsp'],
  cup: ['cup', 'cups'],
  fl_oz: ['fl oz', 'fl oz'],
  oz: ['oz', 'oz'],
  lb: ['lb', 'lb'],
  piece: ['piece', 'pieces'],
  clove: ['clove', 'cloves'],
  slice: ['slice', 'slices'],
  pinch: ['pinch', 'pinches'],
  can: ['can', 'cans'],
  bunch: ['bunch', 'bunches']
};

// "500 g", "2 cloves", "8–12", "½ cup", "To taste", "1 handful"
export function formatAmount({ quantity, quantityMax, unit }) {
  if (unit === 'to_taste') return 'To taste';
  if (quantity === null || quantity === undefined) return '';

  const number = quantityMax ? `${formatNumber(quantity)}–${formatNumber(quantityMax)}` : formatNumber(quantity);
  if (!unit || unit === 'none') return number;

  const plural = (quantityMax || quantity) > 1;
  const label = UNIT_LABELS[unit] ? UNIT_LABELS[unit][plural ? 1 : 0] : unit; // custom unit: as typed
  return `${number} ${label}`;
}

// 30 → "30 min", 75 → "1 h 15 min", 120 → "2 h"
export function formatMinutes(total) {
  if (!total) return '';
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  if (!hours) return `${minutes} min`;
  return minutes ? `${hours} h ${minutes} min` : `${hours} h`;
}

export function totalMinutes(recipe) {
  return (recipe.prepMinutes || 0) + (recipe.cookMinutes || 0);
}

// Attribution line, or null when the recipe is simply the user's own.
export function formatProvenance(provenance) {
  if (!provenance) return null;
  const { sourceType, sourceName, sourceUrl, basedOn } = provenance;

  if (basedOn && basedOn.title) {
    return basedOn.author ? `Adapted from ${basedOn.title} by ${basedOn.author}` : `Adapted from ${basedOn.title}`;
  }
  if (sourceType === 'own' || (!sourceName && !sourceUrl)) return null;

  const name = sourceName || sourceUrl;
  switch (sourceType) {
    case 'person': return `Recipe from ${name}`;
    case 'book': return `From the book ${name}`;
    case 'website': return `From ${name}`;
    default: return `Source: ${name}`;
  }
}

// 2048 → "2 KB", 3400000 → "3.2 MB"
export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
}
