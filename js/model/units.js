// Unit codes from D-028, grouped for the unit picker. No screen code here.

export const UNIT_GROUPS = [
  { label: 'No unit', units: [['none', '— (no unit)']] },
  { label: 'Weight', units: [['g', 'g'], ['kg', 'kg'], ['oz', 'oz'], ['lb', 'lb']] },
  { label: 'Volume', units: [['ml', 'ml'], ['l', 'l'], ['tsp', 'tsp'], ['tbsp', 'tbsp'], ['cup', 'cup'], ['fl_oz', 'fl oz']] },
  { label: 'Count', units: [['piece', 'piece'], ['clove', 'clove'], ['slice', 'slice'], ['pinch', 'pinch'], ['can', 'can'], ['bunch', 'bunch']] },
  { label: 'Other', units: [['to_taste', 'to taste']] }
];

export const KNOWN_UNITS = new Set(UNIT_GROUPS.flatMap((group) => group.units.map(([code]) => code)));

// Anything not in the list is a custom unit, saved as typed (e.g. "handful").
export function isKnownUnit(unit) {
  return KNOWN_UNITS.has(unit);
}
