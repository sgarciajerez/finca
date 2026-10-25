import { describe, expect, it, vi } from 'vitest';
import { exampleDraft, exampleProperty, examplePreferences } from '../../../tests/fixtures/listing';
import { MemoryDraftRepository } from '../../../tests/support/memory-draft-repository';
import { SaveDraft } from './save-draft';
describe('SaveDraft', () => {
  it('creates a validated draft with injected identity and time', async () => {
    // Arrange
    const repository = new MemoryDraftRepository();
    const useCase = new SaveDraft(
      repository,
      () => exampleDraft.id,
      () => new Date(exampleDraft.createdAt),
    );
    // Act
    const result = await useCase.execute({
      property: exampleProperty,
      preferences: examplePreferences,
      text: 'Mi descripción.',
    });
    // Assert
    expect(result.id).toBe(exampleDraft.id);
    expect(result.createdAt).toBe(exampleDraft.createdAt);
    expect(result.source).toBe('example');
    expect((await repository.list())[0]).toEqual(result);
  });
  it('updates an existing draft preserving its name, identity and creation time', async () => {
    // Arrange
    const repository = new MemoryDraftRepository();
    await repository.put(exampleDraft);
    const createId = vi.fn();
    const useCase = new SaveDraft(repository, createId, () => new Date('2026-10-25T11:00:00.000Z'));
    // Act
    const result = await useCase.execute({
      property: exampleProperty,
      preferences: examplePreferences,
      text: 'Texto editado.',
      existingId: exampleDraft.id,
    });
    // Assert
    expect(result.name).toBe(exampleDraft.name);
    expect(result.createdAt).toBe(exampleDraft.createdAt);
    expect(result.updatedAt).toBe('2026-10-25T11:00:00.000Z');
    expect(createId).not.toHaveBeenCalled();
    expect(await repository.list()).toHaveLength(1);
  });
  it('does not silently recreate a draft that no longer exists', async () => {
    // Arrange
    const repository = new MemoryDraftRepository();
    const useCase = new SaveDraft(
      repository,
      () => exampleDraft.id,
      () => new Date(),
    );
    // Act
    const action = useCase.execute({
      property: exampleProperty,
      preferences: examplePreferences,
      text: 'Texto.',
      existingId: exampleDraft.id,
    });
    // Assert
    await expect(action).rejects.toThrow('ya no existe');
    expect(await repository.list()).toEqual([]);
  });
  it('rejects empty text before persisting', async () => {
    // Arrange
    const repository = new MemoryDraftRepository();
    const useCase = new SaveDraft(
      repository,
      () => exampleDraft.id,
      () => new Date(),
    );
    // Act
    const action = useCase.execute({
      property: exampleProperty,
      preferences: examplePreferences,
      text: ' ',
    });
    // Assert
    await expect(action).rejects.toThrow();
    expect(await repository.list()).toEqual([]);
  });
  it('reports write failures to the caller', async () => {
    // Arrange
    const repository = new MemoryDraftRepository();
    vi.spyOn(repository, 'put').mockRejectedValue(new Error('quota'));
    const useCase = new SaveDraft(
      repository,
      () => exampleDraft.id,
      () => new Date(),
    );
    // Act
    const action = useCase.execute({
      property: exampleProperty,
      preferences: examplePreferences,
      text: 'Texto.',
    });
    // Assert
    await expect(action).rejects.toThrow('quota');
  });
});
