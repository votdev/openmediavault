/**
 * This file is part of OpenMediaVault.
 *
 * @license   https://www.gnu.org/licenses/gpl.html GPL Version 3
 * @author    Volker Theile <volker.theile@openmediavault.org>
 * @copyright Copyright (c) 2009-2026 Volker Theile
 *
 * OpenMediaVault is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 *
 * OpenMediaVault is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 */
import { Component, inject } from '@angular/core';
import { FormGroupDirective } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

import { AbstractFormFieldComponent } from '~/app/core/components/intuition/form/components/abstract-form-field-component';

@Component({
  selector: 'omv-form-checkbox',
  templateUrl: './form-checkbox.component.html',
  styleUrls: ['./form-checkbox.component.scss'],
  standalone: false
})
export class FormCheckboxComponent extends AbstractFormFieldComponent {
  private errorStateMatcher = inject(ErrorStateMatcher);
  private parentForm = inject(FormGroupDirective, { optional: true });

  /**
   * The checkbox is not wrapped by a `mat-form-field`, thus it has to
   * decide on its own when to display the error. Use the same rule as
   * Material: the control is invalid and was touched or the form was
   * submitted.
   */
  get errorState(): boolean {
    return this.errorStateMatcher.isErrorState(
      this.formGroup.get(this.config.name),
      this.parentForm
    );
  }
}
