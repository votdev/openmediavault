/* eslint-disable max-len */
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';

import { ComponentsModule } from '~/app/core/components/components.module';
import { NavigationBarListItemComponent } from '~/app/core/components/navigation-bar/navigation-bar-list-item/navigation-bar-list-item.component';
import { TestingModule } from '~/app/testing.module';

describe('NavbarListItemComponent', () => {
  let component: NavigationBarListItemComponent;
  let fixture: ComponentFixture<NavigationBarListItemComponent>;
  let originalResizeObserver: typeof ResizeObserver;
  let resizeCallback: () => void;
  let observed: Element[];
  let disconnected: boolean;

  // jsdom does not do any layout, so the widths must be faked.
  const setWidths = (scrollWidth: number, clientWidth: number) => {
    const title: HTMLElement = component.title.nativeElement;
    Object.defineProperty(title, 'scrollWidth', { configurable: true, value: scrollWidth });
    Object.defineProperty(title, 'clientWidth', { configurable: true, value: clientWidth });
  };
  // Browsers call the observer initially after the layout.
  const layout = (scrollWidth: number, clientWidth: number) => {
    setWidths(scrollWidth, clientWidth);
    resizeCallback();
  };
  const listItem = (): HTMLElement => fixture.nativeElement.querySelector('mat-list-item');
  const tooltipText = (): string | undefined => {
    fixture.detectChanges();
    return document.querySelector('.mat-mdc-tooltip')?.textContent;
  };
  const hover = () => {
    listItem().dispatchEvent(new MouseEvent('mouseenter'));
    tick(500);
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ComponentsModule, TestingModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    originalResizeObserver = window.ResizeObserver;
    observed = [];
    disconnected = false;
    (window as any).ResizeObserver = class {
      constructor(cb: () => void) {
        resizeCallback = cb;
      }
      observe(el: Element) {
        observed.push(el);
      }
      disconnect() {
        disconnected = true;
      }
    };
    fixture = TestBed.createComponent(NavigationBarListItemComponent);
    component = fixture.componentInstance;
    component.item = { text: 'foo' };
    fixture.detectChanges();
  });

  afterEach(fakeAsync(() => {
    component.tooltip.hide(0);
    tick(500);
    window.ResizeObserver = originalResizeObserver;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the full text in the tooltip', () => {
    expect(component.tooltip.message).toBe('foo');
  });

  it('should set the aria-label to prevent a duplicate description', () => {
    expect(listItem().getAttribute('aria-label')).toBe('foo');
  });

  it('should use the default tooltip position', () => {
    expect(component.tooltip.position).toBe('below');
  });

  it('should observe the title', () => {
    expect(observed).toEqual([component.title.nativeElement]);
  });

  it('should disconnect the observer on destroy', () => {
    fixture.destroy();
    expect(disconnected).toBe(true);
  });

  it('should update the tooltip state on resize', () => {
    layout(150, 100);
    expect(component.tooltip.disabled).toBe(false);
    layout(100, 100);
    expect(component.tooltip.disabled).toBe(true);
  });

  describe('if the text is not truncated', () => {
    beforeEach(() => layout(100, 100));

    it('should not show the tooltip on hover', fakeAsync(() => {
      hover();
      expect(tooltipText()).toBeUndefined();
    }));
  });

  describe('if the text is truncated', () => {
    beforeEach(() => layout(150, 100));

    it('should show the tooltip on hover', fakeAsync(() => {
      hover();
      expect(tooltipText()).toContain('foo');
    }));
  });

  it('should show the tooltip on the first hover if the text got truncated later', fakeAsync(() => {
    // E.g. a late loaded font makes the text wider without resizing the
    // element, so the observer is not called. The tooltip was disabled
    // before, but must have registered its listener anyway.
    layout(100, 100);
    setWidths(150, 100);
    hover();
    expect(tooltipText()).toContain('foo');
  }));

  describe('keyboard accessibility', () => {
    it('should be reachable via tab', () => {
      expect(listItem().getAttribute('tabindex')).toBe('0');
    });

    it('should activate on Enter', () => {
      const spy = jest.spyOn(component, 'onClick');
      listItem().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      expect(spy).toHaveBeenCalledWith(component.item);
    });

    it('should activate on Space and prevent the default page scroll', () => {
      const spy = jest.spyOn(component, 'onClick');
      const event = new KeyboardEvent('keydown', { key: ' ', cancelable: true });
      listItem().dispatchEvent(event);
      expect(spy).toHaveBeenCalledWith(component.item);
      expect(event.defaultPrevented).toBe(true);
    });

    it('should not set aria-expanded if the item has no children', () => {
      expect(listItem().getAttribute('aria-expanded')).toBeNull();
    });

    it('should reflect the expanded state via aria-expanded if the item has children', () => {
      component.item.children = [{ text: 'bar' }];
      component.item.expanded = false;
      fixture.detectChanges();
      expect(listItem().getAttribute('aria-expanded')).toBe('false');

      component.item.expanded = true;
      fixture.detectChanges();
      expect(listItem().getAttribute('aria-expanded')).toBe('true');
    });
  });
});
