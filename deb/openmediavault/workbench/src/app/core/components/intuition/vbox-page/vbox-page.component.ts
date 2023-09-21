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
import { Component, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';

import { AbstractPageComponent } from '~/app/core/components/intuition/abstract-page-component';
import { VboxPageConfig } from '~/app/core/components/intuition/models/vbox-page-config.type';
import { AuthSessionService } from '~/app/shared/services/auth-session.service';

/**
 * This component will render a page containing items distributed in
 * the vertical manner. Each item must handle their RPCs to get/put
 * data individually, there is no common action button bar.
 */
@Component({
  selector: 'omv-intuition-vbox-page',
  templateUrl: './vbox-page.component.html',
  styleUrls: ['./vbox-page.component.scss']
})
export class VboxPageComponent extends AbstractPageComponent<VboxPageConfig> {
  constructor(
    @Inject(ActivatedRoute) activatedRoute,
    @Inject(AuthSessionService) authSessionService: AuthSessionService,
    @Inject(Router) router: Router
  ) {
    super(activatedRoute, authSessionService, router);
  }

  protected sanitizeConfig() {
    _.defaultsDeep(this.config, {
      items: []
    });
  }
}
