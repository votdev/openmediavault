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
import { ComponentType } from '@angular/cdk/overlay';
import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import * as _ from 'lodash';
import { filter, take } from 'rxjs';

/**
 * Implemented by dialog components that provide the result which is
 * returned when the dialog is closed without using one of its buttons,
 * e.g. by pressing `ESC`.
 *
 * This is optional. Dialogs that do not implement it are closed with
 * `undefined` on `ESC`, which is the usual cancel result.
 * It is needed if the caller evaluates the result of the dialog, e.g.
 * the `TaskDialogComponent` reports a successful task via the result,
 * so that the caller can reload data or navigate to another page, no
 * matter how the dialog is closed.
 */
export interface DialogResultProvider<R = any> {
  getDialogResult(): R;
}

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  constructor(private matDialog: MatDialog) {}

  /**
   * Close all currently open dialogs.
   */
  closeAll(): void {
    this.matDialog.closeAll();
  }

  open<T, D = any, R = any>(
    component: ComponentType<T>,
    config?: MatDialogConfig<D>
  ): MatDialogRef<T, R> {
    const dialogRef = this.matDialog.open(
      component,
      _.defaultsDeep(config, {
        // Do not close the dialog by clicking on the backdrop. This
        // has repeatedly caused frustration, because users lost their
        // input or a running action by an accidental click beside the
        // dialog.
        disableClose: true
      })
    );

    // Close dialog on `ESC`. No need to unsubscribe event here.
    //
    // Why not simply set `disableClose` to `false` to get this from
    // Angular Material for free?
    // `disableClose` controls the backdrop click and `ESC` together,
    // there is no way to allow only one of them. Backdrop clicks must
    // stay disabled (see above), so `ESC` has to be handled here.
    // Additionally, Angular Material closes the dialog with `undefined`
    // as result in that case. Callers that evaluate the result (e.g. of
    // the `TaskDialogComponent`) would then misinterpret a successfully
    // finished task as canceled. Therefore the result is requested from
    // the dialog component if it implements `DialogResultProvider`.
    dialogRef
      .keydownEvents()
      .pipe(
        filter(
          (event: KeyboardEvent) =>
            event.key === 'Escape' &&
            !event.defaultPrevented &&
            !event.ctrlKey &&
            !event.altKey &&
            !event.metaKey &&
            !event.shiftKey
        ),
        take(1)
      )
      .subscribe(() => {
        const instance = dialogRef.componentInstance as Partial<DialogResultProvider>;
        dialogRef.close(instance?.getDialogResult?.());
      });

    return dialogRef;
  }
}
