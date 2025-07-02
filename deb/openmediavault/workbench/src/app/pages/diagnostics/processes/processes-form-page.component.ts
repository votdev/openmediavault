/**
 * This file is part of OpenMediaVault.
 *
 * @license   https://www.gnu.org/licenses/gpl.html GPL Version 3
 * @author    Volker Theile <volker.theile@openmediavault.org>
 * @copyright Copyright (c) 2009-2025 Volker Theile
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
import { Component } from '@angular/core';
import { marker as gettext } from '@ngneat/transloco-keys-manager/marker';

import { FormPageConfig } from '~/app/core/components/intuition/models/form-page-config.type';

@Component({
  template: '<omv-intuition-form-page [config]="this.config"></omv-intuition-form-page>'
})
export class ProcessesFormPageComponent {
  public config: FormPageConfig = {
    request: {
      service: 'System',
      get: {
        method: 'getTopInfo',
        params: {
          format: 'json'
        }
      }
    },
    fields: [
      {
        type: 'container',
        fields: [
          {
            type: 'textInput',
            name: 'time',
            label: gettext('Time'),
            value: '',
            flex: 33,
            readonly: true
          },
          {
            type: 'textInput',
            name: 'uptime',
            label: gettext('Uptime'),
            value: '',
            flex: 33,
            readonly: true
          },
          {
            type: 'textInput',
            name: 'users',
            label: gettext('Users'),
            value: '',
            flex: 33,
            readonly: true
          }
        ]
      },
      {
        type: 'container',
        fields: [
          {
            type: 'textInput',
            name: 'load_1m',
            label: gettext('Load Average'),
            value: '',
            flex: 33,
            readonly: true
          },
          {
            type: 'textInput',
            name: 'load_5m',
            value: '',
            flex: 33,
            readonly: true
          },
          {
            type: 'textInput',
            name: 'load_15m',
            value: '',
            flex: 33,
            readonly: true
          }
        ]
      },
      {
        type: 'datatable',
        name: 'processes',
        hasFooter: true,
        hasSearchField: true,
        limit: 0,
        stateId: '7b7fe8fe-5788-11f0-b8d6-b37d1ff753c3',
        selectionType: 'none',
        sorters: [
          {
            dir: 'desc',
            prop: 'percent_cpu'
          }
        ],
        columns: [
          {
            name: gettext('PID'),
            prop: 'PID',
            flexGrow: 1,
            sortable: true
          },
          {
            name: gettext('USER'),
            prop: 'USER',
            flexGrow: 1,
            sortable: true
          },
          {
            name: gettext('PR'),
            prop: 'PR',
            flexGrow: 1,
            sortable: true
          },
          {
            name: gettext('NI'),
            prop: 'NI',
            flexGrow: 1,
            sortable: true
          },
          {
            name: gettext('VIRT'),
            prop: 'VIRT',
            flexGrow: 1,
            sortable: true
          },
          {
            name: gettext('RES'),
            prop: 'RES',
            flexGrow: 1,
            sortable: true
          },
          {
            name: gettext('SHR'),
            prop: 'SHR',
            flexGrow: 1,
            sortable: true
          },
          {
            name: gettext('S'),
            prop: 'S',
            flexGrow: 1,
            sortable: true,
            cellTemplateName: 'chip',
            cellTemplateConfig: {
              map: {
                D: { tooltip: gettext('Uninterruptible sleep') },
                I: { class: 'omv-background-color-pair-yellow', tooltip: gettext('Idle') },
                R: { class: 'omv-background-color-pair-green', tooltip: gettext('Running') },
                S: { class: 'omv-background-color-pair-orange', tooltip: gettext('Sleeping') },
                T: { tooltip: gettext('Stopped by job control signal') },
                t: { tooltip: gettext('Stopped by debugger during trace') },
                Z: { class: 'omv-background-color-pair-dark', tooltip: gettext('Zombie') }
              }
            }
          },
          {
            name: gettext('%CPU'),
            prop: '%CPU',
            flexGrow: 2,
            sortable: true,
            cellTemplateName: 'progressBar'
          },
          {
            name: gettext('%MEM'),
            prop: '%MEM',
            flexGrow: 2,
            sortable: true,
            cellTemplateName: 'progressBar'
          },
          {
            name: gettext('TIME+'),
            prop: 'TIME+',
            flexGrow: 1,
            sortable: true
          },
          {
            name: gettext('COMMAND'),
            prop: 'COMMAND',
            flexGrow: 3,
            sortable: true
          }
        ],
        value: []
      }
    ]
  };
}
