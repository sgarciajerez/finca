import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { type Draft, type ListingPreferences, type Property } from '@finca/domain';
import { PropertyFormComponent } from './property-form.component';
import { AssistantStore, type AssistantScreen } from './assistant.store';
type Confirmation =
  | { kind: 'replace'; property: Property }
  | { kind: 'open'; draft: Draft }
  | { kind: 'delete'; id: string }
  | { kind: 'clear' };
@Component({
  selector: 'finca-assistant',
  standalone: true,
  imports: [FormsModule, PropertyFormComponent],
  providers: [AssistantStore],
  templateUrl: './assistant.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssistantComponent {
  readonly environment = input<'web' | 'extension'>('web');
  readonly store = inject(AssistantStore);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly confirmationDialog =
    viewChild.required<ElementRef<HTMLDialogElement>>('confirmationDialog');
  readonly renameDialog = viewChild.required<ElementRef<HTMLDialogElement>>('renameDialog');
  readonly confirmation = signal<Confirmation | null>(null);
  readonly renameTarget = signal<Draft | null>(null);
  readonly query = signal('');
  renameName = '';
  readonly visibleDrafts = computed(() => {
    const query = this.query().trim().toLocaleLowerCase('es');
    return this.store
      .drafts()
      .filter((draft) =>
        `${draft.name} ${draft.property.city}`.toLocaleLowerCase('es').includes(query),
      );
  });
  readonly wordCount = computed(() =>
    this.store.text().trim() ? this.store.text().trim().split(/\s+/).length : 0,
  );
  readonly confirmationTitle = computed(() => {
    const action = this.confirmation();
    return action?.kind === 'delete'
      ? '¿Eliminar este borrador?'
      : action?.kind === 'clear'
        ? '¿Vaciar la biblioteca?'
        : '¿Reemplazar tus cambios?';
  });
  readonly confirmationText = computed(() =>
    this.confirmation()?.kind === 'delete' || this.confirmation()?.kind === 'clear'
      ? 'Esta acción no se puede deshacer. El texto abierto en el editor se conserva.'
      : 'Guarda un borrador si quieres conservar tu versión antes de reemplazar el texto.',
  );
  readonly toneOptions = [
    { value: 'professional', label: 'Profesional', help: 'Claro y directo' },
    { value: 'friendly', label: 'Cercano', help: 'Natural y personal' },
    { value: 'editorial', label: 'Editorial', help: 'Cuidado y sobrio' },
  ] as const;
  constructor() {
    afterNextRender(() => void this.store.refresh());
  }
  private focusHeading(): void {
    requestAnimationFrame(() =>
      this.host.nativeElement.querySelector<HTMLElement>('#view-heading')?.focus(),
    );
  }
  navigate(screen: AssistantScreen): void {
    this.store.screen.set(screen);
    this.store.message.set('');
    this.focusHeading();
  }
  private ask(action: Confirmation): void {
    this.confirmation.set(action);
    this.confirmationDialog().nativeElement.showModal();
  }
  async prepare(property: Property): Promise<void> {
    if (this.store.isDirty()) {
      this.ask({ kind: 'replace', property });
      return;
    }
    await this.store.generate(property);
    this.focusHeading();
  }
  async regenerate(): Promise<void> {
    const property = this.store.property();
    if (property) await this.prepare(property);
  }
  setTone(tone: ListingPreferences['tone']): void {
    this.store.preferences.update((current) => ({ ...current, tone }));
  }
  setLength(length: ListingPreferences['length']): void {
    this.store.preferences.update((current) => ({ ...current, length }));
  }
  async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.store.text());
      this.store.message.set('Descripción copiada. Ya puedes pegarla en tu anuncio.');
    } catch {
      const editor = this.host.nativeElement.querySelector<HTMLTextAreaElement>('#ad-text');
      editor?.focus();
      editor?.select();
      this.store.message.set(
        'El navegador no permite copiar automáticamente. Selecciona el texto y usa el comando Copiar.',
      );
    }
  }
  open(draft: Draft): void {
    if (this.store.isDirty()) {
      this.ask({ kind: 'open', draft });
      return;
    }
    this.store.open(draft);
    this.focusHeading();
  }
  requestDelete(id: string): void {
    this.ask({ kind: 'delete', id });
  }
  requestClear(): void {
    this.ask({ kind: 'clear' });
  }
  async confirm(): Promise<void> {
    const action = this.confirmation();
    this.cancelConfirmation();
    if (!action) return;
    if (action.kind === 'replace') await this.store.generate(action.property);
    if (action.kind === 'open') this.store.open(action.draft);
    if (action.kind === 'delete') await this.store.remove(action.id);
    if (action.kind === 'clear') await this.store.clear();
    this.focusHeading();
  }
  cancelConfirmation(): void {
    this.confirmationDialog().nativeElement.close();
    this.confirmation.set(null);
  }
  requestRename(draft: Draft): void {
    this.renameTarget.set(draft);
    this.renameName = draft.name;
    this.renameDialog().nativeElement.showModal();
  }
  closeRename(): void {
    this.renameDialog().nativeElement.close();
    this.renameTarget.set(null);
  }
  async rename(): Promise<void> {
    const target = this.renameTarget();
    if (target && this.renameName.trim() && (await this.store.rename(target, this.renameName))) {
      this.closeRename();
      this.focusHeading();
    }
  }
}
