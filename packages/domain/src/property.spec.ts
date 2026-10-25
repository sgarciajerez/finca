import { describe, expect, it } from 'vitest';
import { parseProperty, type Property } from './property';
const valid: Property = {
  operation: 'sale',
  type: 'flat',
  city: 'Sevilla',
  price: 285000,
  areaM2: 92,
  bedrooms: 3,
  bathrooms: 2,
  condition: 'good',
  extras: ['terrace'],
  notes: '',
};
describe('parseProperty', () => {
  it('normalizes the city while preserving confirmed features', () => {
    // Arrange
    const input = { ...valid, city: '  Sevilla  ' };
    // Act
    const result = parseProperty(input);
    // Assert
    expect(result).toEqual({ ok: true, value: valid });
  });
  it.each([
    ['areaM2', -1],
    ['areaM2', Infinity],
    ['price', 0],
    ['price', 100000001],
    ['city', '   '],
    ['bedrooms', 1.5],
    ['bathrooms', -1],
    ['operation', 'unknown'],
    ['extras', ['terrace', 'terrace']],
    ['extras', ['sea-view']],
    ['notes', 'x'.repeat(601)],
  ])('rejects invalid %s without coercing the input', (field, value) => {
    // Arrange
    const input = { ...valid, [field]: value };
    // Act
    const result = parseProperty(input);
    // Assert
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.fields).toContain(field);
  });
  it('rejects malformed input', () => {
    // Arrange
    const input = null;
    // Act
    const result = parseProperty(input);
    // Assert
    expect(result.ok).toBe(false);
  });
  it('does not accept extra fields', () => {
    // Arrange
    const input = { ...valid, secret: 'not a property field' };
    // Act
    const result = parseProperty(input);
    // Assert
    expect(result.ok).toBe(false);
  });
});
