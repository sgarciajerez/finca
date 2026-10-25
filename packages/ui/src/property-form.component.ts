import { ChangeDetectionStrategy, Component, output, signal, input, effect } from '@angular/core';
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
  readonly prepared = output<Property>();
  readonly initial = input<Property | undefined>();
  constructor() {
    effect(() => {
      const property = this.initial();
      if (!property) return;
      this.form.patchValue(property);
      for (const extra of this.extraOptions)
        this.form.controls[extra.value].setValue(property.extras.includes(extra.value));
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
    operation: new FormControl<'sale' | 'rent'>('sale', { nonNullable: true }),
    type: new FormControl<Property['type']>('flat', { nonNullable: true }),
    city: new FormControl('Sevilla', { nonNullable: true }),
    price: new FormControl<number | null>(285000),
    areaM2: new FormControl<number | null>(92),
    bedrooms: new FormControl<number | null>(3),
    bathrooms: new FormControl<number | null>(2),
    condition: new FormControl<Property['condition']>('good', { nonNullable: true }),
    notes: new FormControl('', { nonNullable: true }),
    terrace: new FormControl(true, { nonNullable: true }),
    lift: new FormControl(true, { nonNullable: true }),
    garage: new FormControl(false, { nonNullable: true }),
    storage: new FormControl(false, { nonNullable: true }),
    garden: new FormControl(false, { nonNullable: true }),
    pool: new FormControl(false, { nonNullable: true }),
  });
  hasError(field: PropertyField): boolean {
    return this.errors().includes(field);
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
      return;
    }
    this.errors.set([]);
    this.prepared.emit(result.value);
  }
}
