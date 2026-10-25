import { type Draft, type ListingPreferences, type Property } from '@finca/domain';
export const exampleProperty: Property = {
  operation: 'sale',
  type: 'flat',
  city: 'Sevilla',
  price: 285000,
  areaM2: 92,
  bedrooms: 3,
  bathrooms: 2,
  condition: 'good',
  extras: ['terrace', 'lift'],
  notes: '',
};
export const examplePreferences: ListingPreferences = { tone: 'professional', length: 'standard' };
export const exampleDraft: Draft = {
  schemaVersion: 1,
  id: 'a29c5cb7-2280-419f-adfa-092e48f8177c',
  name: 'Piso en Sevilla',
  property: exampleProperty,
  preferences: examplePreferences,
  text: 'Un texto confirmado.',
  createdAt: '2026-10-25T10:00:00.000Z',
  updatedAt: '2026-10-25T10:00:00.000Z',
  source: 'example',
};
