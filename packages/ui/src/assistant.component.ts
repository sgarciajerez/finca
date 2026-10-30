import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  HostListener,
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
  | { kind: 'new-listing' }
  | { kind: 'load-example' }
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
  private readonly destroyRef = inject(DestroyRef);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly confirmationDialog =
    viewChild.required<ElementRef<HTMLDialogElement>>('confirmationDialog');
  readonly renameDialog = viewChild.required<ElementRef<HTMLDialogElement>>('renameDialog');
  readonly propertyForm = viewChild.required(PropertyFormComponent);
  readonly confirmation = signal<Confirmation | null>(null);
  readonly renameTarget = signal<Draft | null>(null);
  readonly query = signal('');
  readonly neighborGreeting = signal(false);
  private greetingTimer: ReturnType<typeof setTimeout> | undefined;
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
  formatPrice(price: number, operation: Property['operation']): string {
    const amount = new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(price);
    return operation === 'rent' ? `${amount} / mes` : amount;
  }
  formatUpdatedAt(value: string): string {
    return new Intl.DateTimeFormat('es-ES', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  }
  readonly confirmationTitle = computed(() => {
    const action = this.confirmation();
    return action?.kind === 'delete'
      ? '¿Eliminar este borrador?'
      : action?.kind === 'clear'
        ? '¿Vaciar la biblioteca?'
        : action?.kind === 'new-listing'
          ? '¿Empezar un anuncio nuevo?'
          : action?.kind === 'load-example'
            ? '¿Cargar datos de ejemplo?'
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
    this.destroyRef.onDestroy(() => clearTimeout(this.greetingTimer));
    afterNextRender(() => void this.store.refresh());
  }
  @HostListener('window:beforeunload', ['$event'])
  protectUnsavedWork(event: BeforeUnloadEvent): void {
    if (!this.store.isDirty() && !this.propertyForm().hasUnsavedChanges()) return;
    event.preventDefault();
    event.returnValue = '';
  }
  greetNeighbor(): void {
    this.neighborGreeting.set(false);
    clearTimeout(this.greetingTimer);
    requestAnimationFrame(() => this.neighborGreeting.set(true));
    this.greetingTimer = setTimeout(() => this.neighborGreeting.set(false), 3600);
  }
  private focusHeading(): void {
    const headingId = {
      property: 'property-heading',
      editor: 'editor-heading',
      drafts: 'drafts-heading',
    }[this.store.screen()];
    requestAnimationFrame(() =>
      this.host.nativeElement.querySelector<HTMLElement>(`#${headingId}`)?.focus(),
    );
  }
  navigate(screen: AssistantScreen): void {
    this.store.screen.set(screen);
    this.store.message.set('');
    this.focusHeading();
  }
  requestNewListing(): void {
    if (this.store.isDirty() || this.propertyForm().hasUnsavedChanges()) {
      this.ask({ kind: 'new-listing' });
      return;
    }
    this.startNewListing();
  }
  requestExample(): void {
    if (this.propertyForm().hasUnsavedChanges()) {
      this.ask({ kind: 'load-example' });
      return;
    }
    this.propertyForm().loadExample();
  }
  private startNewListing(): void {
    this.propertyForm().clear();
    this.store.property.set(undefined);
    this.store.text.set('');
    this.store.preferences.set({ tone: 'professional', length: 'standard' });
    this.store.abandonCurrentDraft();
    this.store.screen.set('property');
    this.store.message.set('Ficha nueva. Añade únicamente datos confirmados.');
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
    if (this.store.isDirty() || this.propertyForm().hasUnsavedChanges()) {
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
    if (action.kind === 'new-listing') this.startNewListing();
    if (action.kind === 'load-example') this.propertyForm().loadExample();
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
