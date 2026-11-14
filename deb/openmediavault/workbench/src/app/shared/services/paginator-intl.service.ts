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
import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { marker as gettext } from '@jsverse/transloco-keys-manager/marker';

import { format } from '~/app/functions.helper';
import { translate } from '~/app/i18n.helper';

/**
 * Provides the translated labels of the `mat-paginator` component.
 */
@Injectable()
export class PaginatorIntlService extends MatPaginatorIntl {
  override itemsPerPageLabel = translate(gettext('Items per page')) + ':';
  override firstPageLabel = translate(gettext('First page'));
  override previousPageLabel = translate(gettext('Previous page'));
  override nextPageLabel = translate(gettext('Next page'));
  override lastPageLabel = translate(gettext('Last page'));

  override getRangeLabel = (page: number, pageSize: number, length: number): string => {
    const start = length === 0 ? 0 : page * pageSize + 1;
    const end = Math.min((page + 1) * pageSize, length);
    return format(translate(gettext('{{ start }} - {{ end }} of {{ length }}')), {
      start: start.toLocaleString(),
      end: end.toLocaleString(),
      length: length.toLocaleString()
    });
  };
}
