import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  output,
  signal,
  input,
  effect,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { parseProperty, type Property, type PropertyField } from '@finca/domain';
@Component({
  selector: 'finca-property-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './property-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyFormComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly prepared = output<Property>();
  readonly exampleRequested = output<void>();
  readonly initial = input<Property | undefined>();
  constructor() {
    effect(() => {
      const property = this.initial();
      if (!property) return;
      this.form.patchValue(property);
      for (const extra of this.extraOptions)
        this.form.controls[extra.value].setValue(property.extras.includes(extra.value));
      this.form.markAsPristine();
    });
  }
  readonly errors = signal<PropertyField[]>([]);
  readonly extraOptions = [
    { value: 'terrace', label: 'Terraza' },
    { value: 'lift', label: 'Ascensor' },
    { value: 'garage', label: 'Garaje' },
    { value: 'storage', label: 'Trastero' },
    { value: 'garden', label: 'Jardín' },
    { value: 'pool', label: 'Piscina' },
  ] as const;
  readonly types = [
    { value: 'flat', label: 'Piso' },
    { value: 'house', label: 'Casa' },
    { value: 'penthouse', label: 'Ático' },
  ] as const;
  readonly conditions = [
    { value: 'unknown', label: 'Sin confirmar' },
    { value: 'good', label: 'Buen estado' },
    { value: 'renovated', label: 'Reformado' },
    { value: 'needs-renovation', label: 'A reformar' },
  ] as const;
  readonly form = new FormGroup({
    operation: new FormControl<'sale' | 'rent' | null>(null),
    type: new FormControl<Property['type'] | null>(null),
    city: new FormControl('', { nonNullable: true }),
    price: new FormControl<number | null>(null),
    areaM2: new FormControl<number | null>(null),
    bedrooms: new FormControl<number | null>(null),
    bathrooms: new FormControl<number | null>(null),
    condition: new FormControl<Property['condition']>('unknown', { nonNullable: true }),
    notes: new FormControl('', { nonNullable: true }),
    terrace: new FormControl(false, { nonNullable: true }),
    lift: new FormControl(false, { nonNullable: true }),
    garage: new FormControl(false, { nonNullable: true }),
    storage: new FormControl(false, { nonNullable: true }),
    garden: new FormControl(false, { nonNullable: true }),
    pool: new FormControl(false, { nonNullable: true }),
  });
  hasError(field: PropertyField): boolean {
    return this.errors().includes(field);
  }
  loadExample(): void {
    this.form.reset({
      operation: 'sale',
      type: 'flat',
      city: 'Sevilla',
      price: 285000,
      areaM2: 92,
      bedrooms: 3,
      bathrooms: 2,
      condition: 'good',
      notes: '',
      terrace: true,
      lift: true,
      garage: false,
      storage: false,
      garden: false,
      pool: false,
    });
    this.form.markAsPristine();
    this.errors.set([]);
  }
  clear(): void {
    this.form.reset({
      operation: null,
      type: null,
      city: '',
      price: null,
      areaM2: null,
      bedrooms: null,
      bathrooms: null,
      condition: 'unknown',
      notes: '',
      terrace: false,
      lift: false,
      garage: false,
      storage: false,
      garden: false,
      pool: false,
    });
    this.form.markAsPristine();
    this.errors.set([]);
  }
  hasUnsavedChanges(): boolean {
    return this.form.dirty;
  }
  submit(): void {
    const { terrace, lift, garage, storage, garden, pool, ...fields } = this.form.getRawValue();
    const selected = { terrace, lift, garage, storage, garden, pool };
    const result = parseProperty({
      ...fields,
      extras: this.extraOptions
        .filter((extra) => selected[extra.value])
        .map((extra) => extra.value),
    });
    if (!result.ok) {
      this.errors.set(result.fields);
      requestAnimationFrame(() => {
        const control = this.host.nativeElement.querySelector<HTMLElement>(
          `[formControlName="${result.fields[0] === 'extras' ? 'terrace' : result.fields[0]}"]`,
        );
        control?.focus({ preventScroll: true });
        control?.scrollIntoView?.({ block: 'center' });
      });
      return;
    }
    this.errors.set([]);
    this.form.markAsPristine();
    this.prepared.emit(result.value);
  }
}
