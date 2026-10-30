import { afterEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { AssistantStore } from './assistant.store';
import { DRAFT_REPOSITORY, LISTING_GENERATOR } from './assistant.tokens';
import { MemoryDraftRepository } from '../../../tests/support/memory-draft-repository';
import { exampleDraft, exampleProperty } from '../../../tests/fixtures/listing';
afterEach(() => TestBed.resetTestingModule());
function arrange() {
  const repository = new MemoryDraftRepository();
  const generator = { generate: vi.fn().mockResolvedValue('Ejemplo confirmado.') };
  TestBed.configureTestingModule({
    providers: [
      AssistantStore,
      { provide: DRAFT_REPOSITORY, useValue: repository },
      { provide: LISTING_GENERATOR, useValue: generator },
    ],
  });
  return { store: TestBed.inject(AssistantStore), repository, generator };
}
describe('AssistantStore', () => {
  it('preserves the current text and property when generation fails', async () => {
    // Arrange
    const { store, generator } = arrange();
    await store.generate(exampleProperty);
    store.text.set('Mi edición.');
    generator.generate.mockRejectedValue(new Error('offline'));
    // Act
    await store.generate({ ...exampleProperty, city: 'Cádiz' });
    // Assert
    expect(store.text()).toBe('Mi edición.');
    expect(store.property()?.city).toBe('Sevilla');
    expect(store.loading()).toBe(false);
    expect(store.error()).toContain('se conservan');
  });
  it('preserves the current text when persistence fails', async () => {
    // Arrange
    const { store, repository } = arrange();
    await store.generate(exampleProperty);
    store.text.set('Mi edición.');
    vi.spyOn(repository, 'put').mockRejectedValue(new Error('quota'));
    // Act
    await store.save();
    // Assert
    expect(store.text()).toBe('Mi edición.');
    expect(store.saving()).toBe(false);
    expect(store.error()).toContain('No se pudo guardar');
  });
  it('ignores a second save while the first write is pending', async () => {
    // Arrange
    const { store, repository } = arrange();
    await store.generate(exampleProperty);
    let finish: () => void = () => undefined;
    vi.spyOn(repository, 'put').mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    // Act
    const first = store.save();
    const second = store.save();
    finish();
    await Promise.all([first, second]);
    // Assert
    expect(repository.put).toHaveBeenCalledTimes(1);
    expect(store.saving()).toBe(false);
  });
  it('keeps edits made during a pending save marked as unsaved', async () => {
    // Arrange
    const { store, repository } = arrange();
    await store.generate(exampleProperty);
    store.text.set('Versión enviada al almacenamiento.');
    let finish: () => void = () => undefined;
    let started: () => void = () => undefined;
    const writeStarted = new Promise<void>((resolve) => {
      started = resolve;
    });
    vi.spyOn(repository, 'put').mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
          started();
        }),
    );
    // Act
    const saving = store.save();
    await writeStarted;
    store.text.set('Edición posterior, todavía sin guardar.');
    finish();
    await saving;
    // Assert
    expect(store.text()).toBe('Edición posterior, todavía sin guardar.');
    expect(store.isDirty()).toBe(true);
    expect(repository.put).toHaveBeenCalledWith(
      expect.objectContaining({ text: 'Versión enviada al almacenamiento.' }),
    );
  });
  it('does not attach a pending save to a different draft opened meanwhile', async () => {
    // Arrange
    const { store, repository } = arrange();
    await repository.put(exampleDraft);
    await store.generate(exampleProperty);
    store.text.set('Nuevo borrador pendiente.');
    let finish: () => void = () => undefined;
    let started: () => void = () => undefined;
    const writeStarted = new Promise<void>((resolve) => {
      started = resolve;
    });
    vi.spyOn(repository, 'put').mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
          started();
        }),
    );
    // Act
    const saving = store.save();
    await writeStarted;
    store.open(exampleDraft);
    finish();
    await saving;
    await store.save();
    // Assert
    expect(store.text()).toBe(exampleDraft.text);
    expect(repository.put).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: exampleDraft.id, text: exampleDraft.text }),
    );
  });
});
