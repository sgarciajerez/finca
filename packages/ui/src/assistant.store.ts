import { inject, Injectable, signal } from '@angular/core';
import { GenerateListing, SaveDraft } from '@finca/application';
import { type Draft, type ListingPreferences, type Property } from '@finca/domain';
import { DRAFT_REPOSITORY, LISTING_GENERATOR } from './assistant.tokens';
export type AssistantScreen = 'property' | 'editor' | 'drafts';
@Injectable()
export class AssistantStore {
  private readonly repository = inject(DRAFT_REPOSITORY);
  private readonly generateListing = new GenerateListing(inject(LISTING_GENERATOR));
  private readonly saveDraft = new SaveDraft(
    this.repository,
    () => crypto.randomUUID(),
    () => new Date(),
  );
  readonly screen = signal<AssistantScreen>('property');
  readonly property = signal<Property | undefined>(undefined);
  readonly text = signal('');
  readonly preferences = signal<ListingPreferences>({ tone: 'professional', length: 'standard' });
  readonly drafts = signal<Draft[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly message = signal('');
  private currentId: string | undefined;
  private savedText = '';
  private savedProperty: Property | undefined;
  private savedPreferences: ListingPreferences = { tone: 'professional', length: 'standard' };
  private workspaceRevision = 0;
  isDirty(): boolean {
    return (
      this.text() !== this.savedText ||
      JSON.stringify(this.property()) !== JSON.stringify(this.savedProperty) ||
      this.preferences().tone !== this.savedPreferences.tone ||
      this.preferences().length !== this.savedPreferences.length
    );
  }
  async refresh(): Promise<void> {
    try {
      this.drafts.set(await this.repository.list());
    } catch {
      this.error.set(
        'No se pudo abrir la biblioteca local. Tu texto sigue disponible; puedes copiarlo. Si los datos están dañados, puedes borrarlos desde Borradores.',
      );
    }
  }
  async generate(property: Property): Promise<void> {
    if (this.loading()) return;
    this.loading.set(true);
    this.error.set('');
    this.message.set('');
    try {
      const text = await this.generateListing.execute(property, this.preferences());
      // Commit only after generation succeeds: failures preserve both text and property.
      if (JSON.stringify(property) !== JSON.stringify(this.property())) this.currentId = undefined;
      this.property.set(property);
      this.text.set(text);
      this.workspaceRevision += 1;
      this.screen.set('editor');
      this.message.set('Ejemplo preparado sin IA. Revisa y edita el texto.');
    } catch {
      this.error.set('No se pudo preparar el ejemplo. Tu ficha y tus cambios se conservan.');
    } finally {
      this.loading.set(false);
    }
  }
  async save(): Promise<void> {
    const property = this.property();
    if (!property || this.saving()) return;
    const textAtSave = this.text();
    const preferencesAtSave = this.preferences();
    const idAtSave = this.currentId;
    const revisionAtSave = this.workspaceRevision;
    this.saving.set(true);
    this.error.set('');
    try {
      const draft = await this.saveDraft.execute({
        property,
        preferences: preferencesAtSave,
        text: textAtSave,
        ...(idAtSave ? { existingId: idAtSave } : {}),
      });
      // A write only confirms the snapshot sent to storage. Edits made while it
      // was pending remain dirty and must still be protected from navigation.
      if (this.workspaceRevision === revisionAtSave && this.currentId === idAtSave) {
        this.currentId = draft.id;
        this.savedText = draft.text;
        this.savedProperty = draft.property;
        this.savedPreferences = draft.preferences;
      }
      this.message.set('Borrador guardado en este navegador.');
      await this.refresh();
    } catch {
      this.error.set(
        'No se pudo guardar el borrador. No hemos borrado el texto: copia una versión y vuelve a intentarlo.',
      );
    } finally {
      this.saving.set(false);
    }
  }
  open(draft: Draft): void {
    this.workspaceRevision += 1;
    this.currentId = draft.id;
    this.property.set(draft.property);
    this.preferences.set(draft.preferences);
    this.text.set(draft.text);
    this.savedText = draft.text;
    this.savedProperty = draft.property;
    this.savedPreferences = draft.preferences;
    this.screen.set('editor');
    this.message.set('Borrador recuperado.');
  }
  abandonCurrentDraft(): void {
    this.workspaceRevision += 1;
    this.currentId = undefined;
    this.savedText = '';
    this.savedProperty = undefined;
    this.savedPreferences = { tone: 'professional', length: 'standard' };
    this.error.set('');
  }
  async rename(draft: Draft, name: string): Promise<boolean> {
    this.error.set('');
    try {
      await this.repository.put({
        ...draft,
        name: name.trim(),
        updatedAt: new Date().toISOString(),
      });
      await this.refresh();
      this.message.set('Nombre actualizado.');
      return true;
    } catch {
      this.error.set('No se pudo cambiar el nombre. El borrador original se conserva.');
      return false;
    }
  }
  async remove(id: string): Promise<void> {
    this.error.set('');
    try {
      await this.repository.remove(id);
      if (this.currentId === id) {
        this.currentId = undefined;
        this.savedText = '';
        this.savedProperty = undefined;
        this.savedPreferences = { tone: 'professional', length: 'standard' };
      }
      await this.refresh();
      this.message.set('Borrador eliminado.');
    } catch {
      this.error.set('No se pudo eliminar el borrador.');
    }
  }
  async clear(): Promise<void> {
    this.error.set('');
    try {
      await this.repository.clear();
      this.currentId = undefined;
      this.savedText = '';
      this.savedProperty = undefined;
      this.savedPreferences = { tone: 'professional', length: 'standard' };
      this.drafts.set([]);
      this.message.set('Borradores locales eliminados. Tu texto actual sigue en el editor.');
    } catch {
      this.error.set('No se pudo vaciar la biblioteca.');
    }
  }
}
