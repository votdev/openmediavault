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
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';
import { Event, NavigationEnd, NavigationStart, Router } from '@angular/router';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { NavigationBarListItem } from '~/app/core/components/navigation-bar/navigation-bar-list-item/navigation-bar-list-item.type';
import { Unsubscribe } from '~/app/decorators';
import { Icon } from '~/app/shared/enum/icon.enum';

@Component({
  selector: 'omv-navigation-bar-list-item',
  templateUrl: './navigation-bar-list-item.component.html',
  standalone: false
})
export class NavigationBarListItemComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input()
  item: NavigationBarListItem;

  @Input()
  depth = 0;

  @ViewChild(MatTooltip, { static: true })
  tooltip: MatTooltip;

  @ViewChild('title', { static: true })
  title: ElementRef<HTMLElement>;

  @Unsubscribe()
  private subscriptions = new Subscription();

  public icon = Icon;

  private resizeObserver?: ResizeObserver;

  constructor(private router: Router) {
    this.subscriptions.add(
      this.router.events
        .pipe(filter((event: Event) => event instanceof NavigationStart))
        .subscribe((event: NavigationStart) => {
          this.item.active = false;
          this.item.expanded = _.startsWith(event.url, this.item.url);
        })
    );
    this.subscriptions.add(
      this.router.events
        .pipe(filter((event: Event) => event instanceof NavigationEnd))
        .subscribe((event: NavigationEnd) => {
          if (this.item.children && this.item.children.length > 0) {
            // If the item has children, the compare the whole URL.
            this.item.active = event.url === this.item.url;
          } else {
            // If the item is a leaf, then compare the beginning of the
            // string, so the item will be displayed as active if a page
            // is shown that is using parts of the items URL, e.g.:
            // - Route of the menu item: /system/powermgmt/tasks/
            // - Route of the displayed page: /system/powermgmt/tasks/create
            this.item.active = _.startsWith(event.url, this.item.url);
          }
        })
    );
  }

  ngOnInit(): void {
    if (this.item.children && this.item.children.length > 0) {
      this.item.active = this.router.url === this.item.url;
    } else {
      this.item.active = _.startsWith(this.router.url, this.item.url);
    }
    this.item.expanded = _.startsWith(this.router.url, this.item.url);
  }

  /**
   * Enable the tooltip only if the text is truncated.
   *
   * The state is updated in advance, so it is also correct if the
   * tooltip is triggered by a touch gesture, which happens before any
   * `mouseenter` event. It is updated again on `mouseenter`, because a
   * late loaded font can change the text width without resizing the
   * element. That handler runs before the one of the tooltip, so the
   * tooltip already sees the updated state.
   *
   * Note, the tooltip must be enabled when it is initialized, otherwise
   * it does not register its event listeners. This is the case, because
   * it is initialized before `ngAfterViewInit` of this component.
   */
  updateTooltip(): void {
    const el = this.title.nativeElement;
    this.tooltip.disabled = el.scrollWidth <= el.clientWidth;
  }

  ngAfterViewInit(): void {
    // The observer is also called initially and when the element gets
    // visible, e.g. when the navigation sidenav is opened.
    this.resizeObserver = new ResizeObserver(() => this.updateTooltip());
    this.resizeObserver.observe(this.title.nativeElement);
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  onClick(item: NavigationBarListItem) {
    if (item.children && item.children.length > 0) {
      item.expanded = !item.expanded;
    }
    if (item.url) {
      this.router.navigate([item.url]);
    }
  }

  /**
   * Activate the item via keyboard (Enter/Space), like a native
   * interactive element would. `mat-list-item` is not a native element
   * (unlike `a[mat-list-item]` or `button[mat-list-item]`), so it is
   * neither focusable nor does it react to these keys on its own.
   *
   * The default action of `Space` (scrolling the page) must be
   * prevented.
   */
  onKeydownActivate(event: KeyboardEvent): void {
    event.preventDefault();
    this.onClick(this.item);
  }
}
