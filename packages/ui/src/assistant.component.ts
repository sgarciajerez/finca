import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { type Property } from '@finca/domain';
import { PropertyFormComponent } from './property-form.component';
@Component({
  selector: 'finca-assistant',
  standalone: true,
  imports: [PropertyFormComponent],
  templateUrl: './assistant.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssistantComponent {
  readonly environment = input<'web' | 'extension'>('web');
  readonly property = signal<Property | null>(null);
}
