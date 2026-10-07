// Turns what a person types as an amount into numbers, and back.
// Accepts: "2", "0.5", "0,5", "1/2", "1 1/2", "½", "1½", "2-3", "2–3", "2 to 3".
// No screen code here.

const GLYPHS = { '¼': 0.25, '½': 0.5, '¾': 0.75, '⅓': 1 / 3, '⅔': 2 / 3, '⅛': 0.125, '⅜': 0.375, '⅝': 0.625, '⅞': 0.875 };

function parseSingle(text) {
  let t = text.trim().replace(',', '.');
  if (!t) return null;

  // Unicode fraction, alone or after a whole number: "½", "1½", "1 ½"
  const glyph = t.slice(-1);
  if (GLYPHS[glyph] !== undefined) {
    const whole = t.slice(0, -1).trim();
    if (!whole) return GLYPHS[glyph];
    return /^\d+$/.test(whole) ? Number(whole) + GLYPHS[glyph] : NaN;
  }

  // "1 1/2"
  let m = t.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (m) return Number(m[3]) ? Number(m[1]) + Number(m[2]) / Number(m[3]) : NaN;

  // "1/2"
  m = t.match(/^(\d+)\/(\d+)$/);
  if (m) return Number(m[2]) ? Number(m[1]) / Number(m[2]) : NaN;

  // "2", "0.5", ".5"
  if (/^(\d+\.?\d*|\.\d+)$/.test(t)) return Number(t);

  return NaN;
}

// → { ok: true, quantity, quantityMax } or { ok: false }
export function parseQuantity(text) {
  const t = (text || '').trim();
  if (!t) return { ok: true, quantity: null, quantityMax: null };

  const parts = t.split(/\s*(?:-|–|—|\bto\b)\s*/i);
  if (parts.length > 2) return { ok: false };

  const quantity = parseSingle(parts[0]);
  const quantityMax = parts.length === 2 ? parseSingle(parts[1]) : null;

  const bad = (n) => n === null || Number.isNaN(n) || n < 0;
  if (bad(quantity) || (parts.length === 2 && bad(quantityMax))) return { ok: false };
  if (quantityMax !== null && quantityMax <= quantity) return { ok: false };

  return { ok: true, quantity, quantityMax };
}

// Number → editable text without losing precision: 0.5 → "½", 1.25 → "1¼", 0.2 → "0.2"
function numberToText(n) {
  const whole = Math.floor(n);
  const rest = n - whole;
  if (rest < 1e-9) return String(whole);
  for (const [glyph, value] of Object.entries(GLYPHS)) {
    if (Math.abs(rest - value) < 1e-6) return whole ? `${whole}${glyph}` : glyph;
  }
  return String(Math.round(n * 1000) / 1000);
}

// Numbers → editable text, e.g. 8 + 12 → "8–12"
export function quantityToText(quantity, quantityMax) {
  if (quantity === null || quantity === undefined) return '';
  return quantityMax ? `${numberToText(quantity)}–${numberToText(quantityMax)}` : numberToText(quantity);
}
