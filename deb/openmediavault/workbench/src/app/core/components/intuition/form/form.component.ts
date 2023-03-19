/**
 * This file is part of OpenMediaVault.
 *
 * @license   http://www.gnu.org/licenses/gpl.html GPL Version 3
 * @author    Volker Theile <volker.theile@openmediavault.org>
 * @copyright Copyright (c) 2009-2023 Volker Theile
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
import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { marker as gettext } from '@ngneat/transloco-keys-manager/marker';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';

import {
  flattenFormFieldConfig,
  setupConfObjUuidFields
} from '~/app/core/components/intuition/functions.helper';
import { FormFieldName, FormValues } from '~/app/core/components/intuition/models/form.type';
import {
  FormFieldConfig,
  FormFieldConstraintValidator,
  FormFieldModifier
} from '~/app/core/components/intuition/models/form-field-config.type';
import { format, formatDeep, isFormatable } from '~/app/functions.helper';
import { CustomValidators } from '~/app/shared/forms/custom-validators';
import { ConstraintService } from '~/app/shared/services/constraint.service';

let nextUniqueId = 0;

@Component({
  selector: 'omv-intuition-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent implements AfterViewInit, OnInit, OnDestroy {
  @Input()
  id: string;

  @Input()
  config: FormFieldConfig[];

  @Input()
  context = {};

  // Event emitted whenever the form has been changed.
  // The event submits the latest form values and the configuration of
  // the field that has triggered the change as a tuple.
  @Output()
  readonly valueChangesBy = new EventEmitter<[FormValues, FormFieldConfig]>();

  public formGroup: FormGroup;

  private subscriptions: Subscription = new Subscription();

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.sanitizeConfig();
    this.createForm();
    // Initialize the `valueChangesBy` event.
    const allFields: Array<FormFieldConfig> = flattenFormFieldConfig(this.config);
    _.forEach(allFields, (field: FormFieldConfig) => {
      const control: AbstractControl = this.formGroup.get(field.name);
      this.subscriptions.add(
        control?.valueChanges.subscribe((value: any) => {
          // Get the current values (including any disabled controls) and
          // emit the event.
          const values: FormValues = this.formGroup.getRawValue();
          this.valueChangesBy.emit([values, field]);
        })
      );
    });
  }

  ngAfterViewInit(): void {
    // All form fields that are involved in a 'visible' or 'hidden' modifier
    // must be updated. This will trigger the evaluation of the constraint
    // which finally sets the correct (configured) state of the form field
    // after form initialization.
    const allFields: Array<FormFieldConfig> = flattenFormFieldConfig(this.config);
    const allFieldNames: Array<FormFieldName> = _.map(allFields, _.property('name'));
    const fieldsToUpdate: Array<FormFieldName> = [];
    _.forEach(allFields, (field: FormFieldConfig) => {
      _.forEach(field?.modifiers, (modifier) => {
        if (['visible', 'hidden'].includes(modifier.type)) {
          // Determine the fields involved in the constraint.
          const props = ConstraintService.getProps(modifier.constraint);
          fieldsToUpdate.push(...props);
        }
      });
    });
    _.forEach(_.uniq(fieldsToUpdate), (name: FormFieldName) => {
      const control: AbstractControl = this.formGroup.get(name);
      control?.updateValueAndValidity({ onlySelf: true, emitEvent: true });
    });
    // Process the value template configuration.
    _.forEach(allFields, (field: FormFieldConfig) => {
      if (
        ['folderBrowser', 'numberInput', 'textInput'].includes(field.type) &&
        isFormatable(field.valueTemplate)
      ) {
        // Get the list of field names whose events we are interested in.
        // If the list is not specified explicitly, then use the names of
        // all existing fields (excluding the own one).
        const deps: Array<FormFieldName> = _.isArray(field.valueTemplateDeps)
          ? field.valueTemplateDeps
          : _.pull(allFieldNames, field.name);
        this.subscriptions.add(
          this.valueChangesBy
            .pipe(
              // Skip those value changes that are triggered by fields we
              // are not interested in.
              filter((data: [FormValues, FormFieldConfig]) => deps.includes(data[1].name)),
              // Process the event if a given time has passed without
              // another event was triggered. This will prevent useless
              // updates of the form field, e.g. on page initialization
              // when all fields are set in a batch.
              debounceTime(5)
            )
            .subscribe((data: [FormValues, FormFieldConfig]) => {
              const values: FormValues = data[0];
              const control: AbstractControl = this.formGroup.get(field.name);
              if (control) {
                // Check if a constraint is specified when the value may
                // be set.
                switch (field.valueTemplateApplyIf) {
                  case 'pristine':
                    if (!control.pristine) {
                      return;
                    }
                    break;
                  case 'empty':
                    if (!_.isEmpty(control.value)) {
                      return;
                    }
                    break;
                }
                // Interpolate the template with the given form values.
                const value = formatDeep(field.valueTemplate, values);
                control.setValue(value);
              }
            })
        );
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  protected sanitizeConfig() {
    // Create unique form identifier.
    this.id = _.defaultTo(this.id, `omv-intuition-form-${++nextUniqueId}`);
    // Sanitize the configuration of individual form fields.
    const allFields: Array<FormFieldConfig> = flattenFormFieldConfig(this.config);
    _.forEach(allFields, (field: FormFieldConfig) => {
      switch (field.type) {
        case 'binaryUnitInput':
          _.defaultsDeep(field, {
            defaultUnit: 'B',
            fractionDigits: 0,
            validators: {
              patternType: 'binaryUnit'
            }
          });
          break;
        case 'datatable':
          _.defaultsDeep(field, {
            columnMode: 'flex',
            hasHeader: true,
            hasFooter: true,
            selectionType: 'multi',
            limit: 25,
            columns: [],
            actions: [],
            sorters: [],
            valueType: 'object'
          });
          break;
        case 'fileInput':
          _.defaultsDeep(field, {
            autocapitalize: 'none',
            rows: 4,
            wrap: 'soft',
            trim: false
          });
          break;
        case 'folderBrowser':
          _.defaultsDeep(field, {
            autocapitalize: 'none',
            dirVisible: false
          });
          break;
        case 'select':
        case 'sharedFolderSelect':
        case 'sshCertSelect':
        case 'sslCertSelect':
          _.defaultsDeep(field, {
            valueField: 'value',
            textField: 'text',
            hasEmptyOption: false,
            emptyOptionText: gettext('None'),
            store: {
              data: []
            }
          });
          if (_.isArray(field.store.data) && _.isUndefined(field.store.fields)) {
            _.merge(field.store, {
              fields: _.uniq([field.valueField, field.textField])
            });
          }
          if (['sharedFolderSelect', 'sshCertSelect', 'sslCertSelect'].includes(field.type)) {
            _.defaultsDeep(field, {
              hasCreateButton: true
            });
          }
          break;
        case 'passwordInput':
          _.defaultsDeep(field, {
            autocapitalize: 'none'
          });
          break;
        case 'textInput':
          _.defaultsDeep(field, {
            autocapitalize: 'none',
            valueTemplateApplyIf: 'always'
          });
          break;
        case 'textarea':
          _.defaultsDeep(field, {
            autocapitalize: 'none',
            rows: 4,
            wrap: 'soft'
          });
          break;
        case 'hint':
          _.defaultsDeep(field, {
            hintType: 'info',
            dismissible: false
          });
          break;
        case 'codeEditor':
          _.defaultsDeep(field, {
            lineNumbers: true
          });
          break;
        case 'tagInput':
          _.defaultsDeep(field, {
            separator: ','
          });
          break;
        case 'numberInput': {
          _.defaultsDeep(field, {
            valueTemplateApplyIf: 'always'
          });
          break;
        }
      }
    });
    // Populate the data model identifier field.
    setupConfObjUuidFields(this.config);
  }

  private createForm() {
    const controlsConfig = {};
    const allFields: Array<FormFieldConfig> = flattenFormFieldConfig(this.config);
    _.forEach(allFields, (field: FormFieldConfig) => {
      const validators: Array<ValidatorFn> = [];
      // Build the validator configuration.
      if (_.isArray(field.modifiers)) {
        _.forEach(field.modifiers, (modifier: FormFieldModifier) => {
          validators.push(
            CustomValidators.modifyIf(
              modifier.type,
              modifier.typeConfig,
              _.defaultTo(modifier.opposite, true),
              modifier.constraint,
              this.context
            )
          );
        });
      }
      if (_.isPlainObject(field.validators)) {
        if (_.isBoolean(field.validators.required) && field.validators.required) {
          validators.push(Validators.required);
        }
        if (_.isNumber(field.validators.minLength) && field.validators.minLength > 0) {
          validators.push(Validators.minLength(field.validators.minLength));
        }
        if (_.isNumber(field.validators.maxLength && field.validators.maxLength > 0)) {
          validators.push(Validators.maxLength(field.validators.maxLength));
        }
        if (_.isNumber(field.validators.min)) {
          if ('binaryUnitInput' === field.type) {
            validators.push(CustomValidators.minBinaryUnit(field.validators.min));
          } else {
            validators.push(Validators.min(field.validators.min));
          }
        }
        if (_.isNumber(field.validators.max)) {
          if ('binaryUnitInput' === field.type) {
            validators.push(CustomValidators.maxBinaryUnit(field.validators.max));
          } else {
            validators.push(Validators.max(field.validators.max));
          }
        }
        if (_.isPlainObject(field.validators.pattern)) {
          validators.push(
            CustomValidators.pattern(
              field.validators.pattern.pattern,
              field.validators.pattern.errorData
            )
          );
        }
        if (_.isBoolean(field.validators.email) && field.validators.email) {
          validators.push(Validators.email);
        }
        if (_.isPlainObject(field.validators.requiredIf)) {
          validators.push(CustomValidators.requiredIf(field.validators.requiredIf));
        }
        if (_.isArray(field.validators.custom)) {
          _.forEach(field.validators.custom, (custom: FormFieldConstraintValidator) => {
            validators.push(
              CustomValidators.constraint(
                custom.constraint,
                this.context,
                custom.errorCode,
                custom.errorData
              )
            );
          });
        }
        if (_.isString(field.validators.patternType)) {
          validators.push(CustomValidators.patternType(field.validators.patternType));
        }
      }
      let value = _.defaultTo(field.value, null);
      if (_.isString(value)) {
        // Evaluate filters.
        value = format(value, {});
      }
      // Create the form control.
      controlsConfig[field.name] = new FormControl(
        { value, disabled: _.defaultTo(field.disabled, false) },
        { validators, updateOn: field.updateOn }
      );
    });
    this.formGroup = this.formBuilder.group(controlsConfig);
  }
}
