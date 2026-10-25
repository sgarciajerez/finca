import { afterEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { PropertyFormComponent } from './property-form.component';
afterEach(() => TestBed.resetTestingModule());
describe('PropertyFormComponent', () => {
  it('does not emit invalid data or clear the rest of the form', () => {
    // Arrange
    const fixture = TestBed.createComponent(PropertyFormComponent);
    const emit = vi.fn();
    fixture.componentInstance.prepared.subscribe(emit);
    fixture.componentInstance.form.controls.areaM2.setValue(-1);
    // Act
    fixture.componentInstance.submit();
    fixture.detectChanges();
    // Assert
    expect(emit).not.toHaveBeenCalled();
    expect(fixture.componentInstance.form.controls.city.value).toBe('Sevilla');
    expect(fixture.nativeElement.querySelector('[role=alert]').textContent).toContain(
      'Revisa los campos',
    );
  });
  it('emits only checked extras and normalized city data', () => {
    // Arrange
    const fixture = TestBed.createComponent(PropertyFormComponent);
    const emit = vi.fn();
    fixture.componentInstance.prepared.subscribe(emit);
    fixture.componentInstance.form.patchValue({ city: ' Sevilla ', terrace: false, lift: true });
    // Act
    fixture.componentInstance.submit();
    // Assert
    expect(emit).toHaveBeenCalledWith(
      expect.objectContaining({ city: 'Sevilla', extras: ['lift'] }),
    );
  });
});
