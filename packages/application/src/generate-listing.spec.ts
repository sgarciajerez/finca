import { describe, expect, it, vi } from 'vitest';
import { exampleProperty, examplePreferences } from '../../../tests/fixtures/listing';
import { GenerateListing } from './generate-listing';
describe('GenerateListing', () => {
  it('normalizes input and returns a validated provider response', async () => {
    // Arrange
    const generator = { generate: vi.fn().mockResolvedValue('  Descripción confirmada.  ') };
    const useCase = new GenerateListing(generator);
    // Act
    const result = await useCase.execute(
      { ...exampleProperty, city: ' Sevilla ' },
      examplePreferences,
    );
    // Assert
    expect(result).toBe('Descripción confirmada.');
    expect(generator.generate).toHaveBeenCalledWith(exampleProperty, examplePreferences);
  });
  it('rejects an invalid property before invoking the generator', async () => {
    // Arrange
    const generator = { generate: vi.fn() };
    const useCase = new GenerateListing(generator);
    // Act
    const action = useCase.execute({ ...exampleProperty, areaM2: 0 }, examplePreferences);
    // Assert
    await expect(action).rejects.toThrow('La ficha');
    expect(generator.generate).not.toHaveBeenCalled();
  });
  it('rejects invalid preferences before invoking the generator', async () => {
    // Arrange
    const generator = { generate: vi.fn() };
    const useCase = new GenerateListing(generator);
    // Act
    const action = useCase.execute(exampleProperty, { tone: 'invent', length: 'standard' });
    // Assert
    await expect(action).rejects.toThrow();
    expect(generator.generate).not.toHaveBeenCalled();
  });
  it('propagates a provider failure', async () => {
    // Arrange
    const useCase = new GenerateListing({
      generate: vi.fn().mockRejectedValue(new Error('offline')),
    });
    // Act
    const action = useCase.execute(exampleProperty, examplePreferences);
    // Assert
    await expect(action).rejects.toThrow('offline');
  });
  it('rejects empty provider output', async () => {
    // Arrange
    const useCase = new GenerateListing({ generate: vi.fn().mockResolvedValue(' ') });
    // Act
    const action = useCase.execute(exampleProperty, examplePreferences);
    // Assert
    await expect(action).rejects.toThrow();
  });
});
