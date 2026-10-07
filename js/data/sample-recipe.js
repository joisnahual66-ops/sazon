// Development sample: one Recipe v1 object (DECISIONS.md Appendix A).
// Later this is replaced by a recipe read from the device database.
// Plausible food content, not a nutrition reference.

export const sampleRecipe = {
  id: '8599fd4c-1b6f-49b6-b5c2-c794beade087',
  schemaVersion: 1,
  title: 'Tacos de pollo',
  description: 'Juicy spiced chicken tacos with fresh salsa, onion and avocado.',
  categoryIds: ['cat_mexican'],
  servings: 4,
  prepMinutes: 10,
  cookMinutes: 20,
  caloriesPerServing: 420,
  ingredients: [
    { id: '54b6354d-8316-4100-9fc8-a58d5214fe1c', quantity: 500, quantityMax: null, unit: 'g', name: 'Chicken breast', note: 'boneless', section: null },
    { id: '4f2d193f-4666-4ac4-9c27-3caa0609b90e', quantity: 1, quantityMax: null, unit: 'none', name: 'Onion', note: 'finely chopped', section: null },
    { id: '5788f645-1214-4dad-8224-7cdffcbfdfde', quantity: 2, quantityMax: null, unit: 'clove', name: 'Garlic', note: 'minced', section: null },
    { id: 'f0f0a2a4-7e1d-4791-add9-a1938336972a', quantity: 60, quantityMax: null, unit: 'ml', name: 'Lime juice', note: null, section: null },
    { id: 'af99fae0-a5b2-477a-b192-37f06f9f7e34', quantity: 2, quantityMax: null, unit: 'tbsp', name: 'Olive oil', note: null, section: null },
    { id: '97b8b1e5-c222-4cff-a454-6832a85aabec', quantity: 1, quantityMax: null, unit: 'tsp', name: 'Cumin', note: null, section: null },
    { id: '14ba793e-5472-4dc8-9066-a7a0f7999d87', quantity: 1, quantityMax: null, unit: 'tsp', name: 'Paprika', note: null, section: null },
    { id: '548a6142-ee2e-4ce9-9347-be84f4277461', quantity: null, quantityMax: null, unit: 'to_taste', name: 'Salt', note: null, section: null },
    { id: '58009bbc-7c19-41b2-9cc0-d150e8ecd48b', quantity: 8, quantityMax: 12, unit: 'none', name: 'Corn tortillas', note: 'small', section: 'To serve' },
    { id: '139cf799-331c-4a49-82a5-9073d9013255', quantity: 1, quantityMax: null, unit: 'none', name: 'Avocado', note: 'sliced', section: 'To serve' },
    { id: '94c25c09-3ec1-43c2-8a8d-75d1224e9b39', quantity: 0.5, quantityMax: null, unit: 'cup', name: 'Salsa verde', note: null, section: 'To serve' },
    { id: 'dd55bdf4-6d05-4f12-8acd-54ffb8c9dc14', quantity: 1, quantityMax: null, unit: 'bunch', name: 'Cilantro', note: 'leaves only', section: 'To serve' }
  ],
  steps: [
    { id: '7444a7f7-b214-421c-8d2e-5b17a3696552', text: 'Season the chicken with olive oil, cumin, paprika and salt. Cook in a hot pan for 6–7 minutes per side, until golden and cooked through.', photoId: null },
    { id: '3f6755aa-ddcc-41d2-b6e1-dbe6b9882023', text: 'Let it rest for 5 minutes, then shred with two forks and toss with the lime juice.', photoId: null },
    { id: 'e23463d1-9638-4c5d-aaac-b8e410399112', text: 'Soften the onion and garlic in the same pan for 2 minutes, then return the chicken and mix.', photoId: null },
    { id: 'ec498dc2-8729-43d6-b568-2cfcf6ccecf5', text: 'Warm the tortillas on a dry pan, about 30 seconds per side.', photoId: null },
    { id: '30175f90-2fde-47c7-a448-c05ba07f8bf3', text: 'Fill each tortilla with chicken and top with salsa, avocado and cilantro.', photoId: null }
  ],
  notes: 'Mamá always squeezes extra lime on top right before serving. The chicken keeps for 2 days in the fridge — reheat it in a pan, not the microwave.',
  photoId: null,
  appearance: { color: 'salmon', mask: 'blob-1', treatment: 'natural' },
  isFavorite: true,
  provenance: {
    sourceType: 'person',
    sourceName: 'Mamá',
    sourceUrl: null,
    basedOn: null
  },
  createdAt: '2026-10-07T09:30:00Z',
  updatedAt: '2026-10-07T09:30:00Z'
};
