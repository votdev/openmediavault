import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder, FormControl, Validators } from '@angular/forms';

import { FormCheckboxComponent } from '~/app/core/components/intuition/form/components/form-checkbox/form-checkbox.component';
import { IntuitionModule } from '~/app/core/components/intuition/intuition.module';
import { PageContextService } from '~/app/core/services/page-context.service';
import { TestingModule } from '~/app/testing.module';

describe('FormCheckboxComponent', () => {
  let component: FormCheckboxComponent;
  let fixture: ComponentFixture<FormCheckboxComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IntuitionModule, TestingModule],
      providers: [PageContextService]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormCheckboxComponent);
    component = fixture.componentInstance;
    component.config = {
      type: 'checkbox',
      name: 'foo'
    };
    const formBuilder = TestBed.inject(FormBuilder);
    component.formGroup = formBuilder.group({ foo: [false] });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('error state', () => {
    beforeEach(() => {
      component.config.hint = 'A hint';
      component.formGroup.get('foo').setErrors({ constraint: 'A constraint error' });
    });

    const show = () => {
      fixture.detectChanges();
      const el: HTMLElement = fixture.nativeElement;
      return {
        error: el.querySelector('mat-error')?.textContent?.trim(),
        hint: el.querySelector('mat-hint')?.textContent?.trim()
      };
    };

    it('should show the hint if the control is untouched', () => {
      expect(component.errorState).toBe(false);
      expect(show()).toEqual({ error: undefined, hint: 'A hint' });
    });

    it('should show the error instead of the hint if the control is touched', () => {
      component.formGroup.get('foo').markAsTouched();
      expect(component.errorState).toBe(true);
      expect(show()).toEqual({ error: 'A constraint error', hint: undefined });
    });

    it('should ignore errors of other controls', () => {
      component.formGroup.get('foo').setErrors(null);
      component.formGroup.addControl('bar', new FormControl('', Validators.required));
      component.formGroup.get('bar').markAsTouched();
      expect(component.formGroup.invalid).toBe(true);
      expect(component.errorState).toBe(false);
      expect(show()).toEqual({ error: undefined, hint: 'A hint' });
    });
  });
});
