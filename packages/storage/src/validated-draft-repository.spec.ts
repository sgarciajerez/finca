import { describe, expect, it, vi } from 'vitest';
import { exampleDraft } from '../../../tests/fixtures/listing';
import { ValidatedDraftRepository } from './validated-draft-repository';
import { type RecordStore } from './record-store';
const createStore = (): RecordStore => {
  const records = new Map<string, unknown>();
  return {
    list: async () => [...records.values()],
    put: async (id, value) => {
      records.set(id, value);
    },
    remove: async (id) => {
      records.delete(id);
    },
    clear: async () => {
      records.clear();
    },
  };
};
describe('ValidatedDraftRepository', () => {
  it('round-trips, replaces, removes and clears versioned records', async () => {
    // Arrange
    const repository = new ValidatedDraftRepository(createStore());
    // Act
    await repository.put(exampleDraft);
    await repository.put({ ...exampleDraft, name: 'Nuevo nombre' });
    const saved = await repository.list();
    await repository.remove(exampleDraft.id);
    const removed = await repository.list();
    await repository.put(exampleDraft);
    await repository.clear();
    const cleared = await repository.list();
    // Assert
    expect(saved).toHaveLength(1);
    expect(saved[0]?.name).toBe('Nuevo nombre');
    expect(removed).toEqual([]);
    expect(cleared).toEqual([]);
  });
  it('orders drafts by most recent update', async () => {
    // Arrange
    const repository = new ValidatedDraftRepository(createStore());
    const recent = {
      ...exampleDraft,
      id: 'dfd8227d-f189-4b5a-9ea0-7631ee84ebaf',
      updatedAt: '2026-10-25T12:00:00.000Z',
    };
    // Act
    await repository.put(exampleDraft);
    await repository.put(recent);
    const result = await repository.list();
    // Assert
    expect(result.map((draft) => draft.id)).toEqual([recent.id, exampleDraft.id]);
  });
  it('reports invalid persisted records without deleting them', async () => {
    // Arrange
    const store = createStore();
    await store.put('broken', { schemaVersion: 99 });
    const repository = new ValidatedDraftRepository(store);
    // Act
    const action = repository.list();
    // Assert
    await expect(action).rejects.toThrow();
    expect(await store.list()).toHaveLength(1);
  });
  it('propagates storage errors', async () => {
    // Arrange
    const store = createStore();
    vi.spyOn(store, 'put').mockRejectedValue(new Error('unavailable'));
    const repository = new ValidatedDraftRepository(store);
    // Act
    const action = repository.put(exampleDraft);
    // Assert
    await expect(action).rejects.toThrow('unavailable');
  });
});
