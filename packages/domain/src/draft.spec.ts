import { describe, expect, it } from 'vitest';
import { exampleDraft } from '../../../tests/fixtures/listing';
import { draftSchema } from './draft';
describe('draft schema', () => {
  it('accepts a versioned local draft', () => {
    // Arrange
    const draft = structuredClone(exampleDraft);
    // Act
    const result = draftSchema.safeParse(draft);
    // Assert
    expect(result.success).toBe(true);
  });
  it.each([
    { schemaVersion: 2 },
    { text: ' ' },
    { id: 'invalid' },
    { name: ' ' },
    { updatedAt: 'yesterday' },
  ])('rejects incompatible or incomplete persisted records', (change) => {
    // Arrange
    const draft = { ...exampleDraft, ...change };
    // Act
    const result = draftSchema.safeParse(draft);
    // Assert
    expect(result.success).toBe(false);
  });
});
