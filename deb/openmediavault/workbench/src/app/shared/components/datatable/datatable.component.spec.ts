import {
  ComponentFixture,
  discardPeriodicTasks,
  fakeAsync,
  TestBed,
  tick,
  waitForAsync
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ToastrModule } from '@openng/ngx-toastr';
import { DatatableComponent as NgxDatatableComponent } from '@siemens/ngx-datatable';

import { ComponentsModule } from '~/app/shared/components/components.module';
import { DatatableComponent } from '~/app/shared/components/datatable/datatable.component';
import { UserLocalStorageService } from '~/app/shared/services/user-local-storage.service';
import { TestingModule } from '~/app/testing.module';

describe('DatatableComponent', () => {
  let component: DatatableComponent;
  let fixture: ComponentFixture<DatatableComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ComponentsModule, TestingModule, ToastrModule.forRoot()]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatatableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should configure the tree column and emit tree actions', () => {
    const row = { id: 1 };
    component.columns = [{ name: 'Name', prop: 'name', isTreeColumn: true }];
    fixture.detectChanges();

    expect(component.columns[0].treeToggleTemplate).toBe(component.treeToggleTpl);

    const treeAction = jest.fn();
    component.treeActionEvent.subscribe(treeAction);
    const datatable: NgxDatatableComponent = fixture.debugElement
      .query(By.directive(NgxDatatableComponent))
      .injector.get(NgxDatatableComponent);
    datatable.treeAction.emit({ row, rowIndex: 0 });

    expect(treeAction).toHaveBeenCalledWith(row);
  });

  it('should show a rotating icon in the tree toggle while loading', () => {
    const toggle = (treeStatus: string) => {
      const view = component.treeToggleTpl.createEmbeddedView({
        cellContext: { treeStatus, onTreeAction: jest.fn() }
      });
      view.detectChanges();
      return view.rootNodes[0] as HTMLElement;
    };
    const loading = toggle('loading').querySelector('mat-icon');
    expect(loading.classList).toContain('omv-icon-rotate-360-infinite');
    expect(toggle('loading').hasAttribute('disabled')).toBe(true);
    expect(toggle('loading').getAttribute('aria-busy')).toBe('true');
    expect(toggle('loading').getAttribute('aria-label')).toContain('Loading ...');
    const expanded = toggle('expanded').querySelector('mat-icon');
    expect(expanded.classList).not.toContain('omv-icon-rotate-360-infinite');
    expect(toggle('expanded').hasAttribute('aria-busy')).toBe(false);
    expect(toggle('expanded').getAttribute('aria-label')).toContain('Expand/Collapse');
    expect(toggle('disabled').querySelector('mat-icon')).toBeNull();
  });

  describe('pagination', () => {
    const renderRows = (count: number) => {
      component.columns = [{ name: 'Name', prop: 'name' }];
      component.limit = 25;
      component.data = Array.from({ length: count }, (_v, i) => ({ name: `row${i}` }));
      component.ngOnChanges({ data: {} as any });
      fixture.detectChanges();
    };

    it('should show the paginator if there are multiple pages', () => {
      renderRows(30);
      const paginator = fixture.nativeElement.querySelector('mat-paginator');
      expect(paginator).not.toBeNull();
      expect(paginator.textContent).toContain('1 - 25 of 30');
      expect(paginator.getAttribute('aria-label')).toBe('Select page');
    });

    it('should show the paginator if there is only one page', () => {
      renderRows(10);
      expect(fixture.nativeElement.querySelector('mat-paginator')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('.page-count').textContent).toContain('10');
    });

    it('should hide the paginator if paging is disabled', () => {
      component.limit = 0;
      component.columns = [{ name: 'Name', prop: 'name' }];
      component.data = Array.from({ length: 30 }, (_v, i) => ({ name: `row${i}` }));
      component.ngOnChanges({ data: {} as any });
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('mat-paginator')).toBeNull();
    });

    it('should change the page without reloading if paging is local', () => {
      const reload = jest.spyOn(component, 'reloadData');
      renderRows(30);
      component.onPaginatorPage({ pageIndex: 1, previousPageIndex: 0, pageSize: 25, length: 30 });
      expect(component.offset).toBe(1);
      expect(reload).not.toHaveBeenCalled();
    });

    it('should reload the data if paging is remote', () => {
      const reload = jest.spyOn(component, 'reloadData');
      component.remotePaging = true;
      component.onPaginatorPage({ pageIndex: 2, previousPageIndex: 1, pageSize: 25, length: 80 });
      expect(component.offset).toBe(2);
      expect(reload).toHaveBeenCalledTimes(1);
    });
  });

  describe('remote paging and sorting', () => {
    let remoteFixture: ComponentFixture<DatatableComponent>;
    let remote: DatatableComponent;
    let reload: jest.SpyInstance;

    beforeEach(() => {
      remoteFixture = TestBed.createComponent(DatatableComponent);
      remote = remoteFixture.componentInstance;
      remote.columns = [{ name: 'Name', prop: 'name' }];
      remote.limit = 25;
      remote.count = 80;
      remote.remotePaging = true;
      remote.remoteSorting = true;
      reload = jest.spyOn(remote, 'reloadData');
    });

    it('should load the data only once on initialization', fakeAsync(() => {
      remoteFixture.detectChanges();
      tick();
      expect(reload).toHaveBeenCalledTimes(1);
      discardPeriodicTasks();
    }));

    it('should load the data only once when sorting', fakeAsync(() => {
      remote.autoLoad = false;
      remoteFixture.detectChanges();
      remote.onPaginatorPage({ pageIndex: 2, previousPageIndex: 1, pageSize: 25, length: 80 });
      reload.mockClear();
      const datatable: NgxDatatableComponent = remoteFixture.debugElement
        .query(By.directive(NgxDatatableComponent))
        .injector.get(NgxDatatableComponent);
      datatable.onColumnSort({
        sorts: [{ prop: 'name', dir: 'desc' }],
        column: { name: 'Name', prop: 'name' },
        prevValue: undefined,
        newValue: 'desc'
      });
      tick();
      expect(remote.offset).toBe(0);
      expect(remote.sorters).toEqual([{ prop: 'name', dir: 'desc' }]);
      expect(reload).toHaveBeenCalledTimes(1);
    }));
  });

  describe('state', () => {
    const key = 'datatable_state_foo';
    let userLocalStorageService: UserLocalStorageService;
    let getSpy: jest.SpyInstance;
    let setSpy: jest.SpyInstance;

    beforeEach(() => {
      userLocalStorageService = TestBed.inject(UserLocalStorageService);
      getSpy = jest.spyOn(userLocalStorageService, 'get').mockReturnValue(null);
      setSpy = jest.spyOn(userLocalStorageService, 'set').mockImplementation();
      component.stateId = 'foo';
      component.limit = 25;
      component.columns = [
        { name: 'Name', prop: 'name' },
        { name: 'Size', prop: 'size' }
      ];
    });

    it('should load the columns and the limit', () => {
      getSpy.mockReturnValue(
        JSON.stringify({ columns: [{ name: 'Size', hidden: true }], limit: 50 })
      );
      component.updateColumns();
      expect(getSpy).toHaveBeenCalledWith(key);
      expect(component.columns[1].hidden).toBe(true);
      expect(component.filteredColumns.map((c) => c.name)).toEqual(['Name']);
      expect(component.limit).toBe(50);
    });

    it('should load the columns of the old format', () => {
      getSpy.mockReturnValue(JSON.stringify([{ name: 'Size', hidden: true }]));
      component.updateColumns();
      expect(component.columns[1].hidden).toBe(true);
      expect(component.limit).toBe(25);
      expect(setSpy).not.toHaveBeenCalled();
    });

    it('should ignore an invalid limit', () => {
      getSpy.mockReturnValue(JSON.stringify({ columns: [], limit: 'abc' }));
      component.updateColumns();
      expect(component.limit).toBe(25);
    });

    it('should not enable paging if it is disabled', () => {
      component.limit = 0;
      getSpy.mockReturnValue(JSON.stringify({ columns: [], limit: 50 }));
      component.updateColumns();
      expect(component.limit).toBe(0);
    });

    it('should save the state when toggling a column', () => {
      component.onToggleColumn(component.columns[0]);
      expect(setSpy).toHaveBeenCalledWith(
        key,
        JSON.stringify({
          columns: [
            { name: 'Name', hidden: true },
            { name: 'Size', hidden: false }
          ],
          limit: 25
        })
      );
    });

    it('should save the state when changing the page size', () => {
      const reload = jest.spyOn(component, 'reloadData');
      component.onPaginatorPage({ pageIndex: 0, previousPageIndex: 0, pageSize: 50, length: 80 });
      expect(component.limit).toBe(50);
      expect(component.offset).toBe(0);
      expect(JSON.parse(setSpy.mock.calls[0][1])).toEqual(expect.objectContaining({ limit: 50 }));
      expect(reload).not.toHaveBeenCalled();
    });

    it('should reload the data when changing the page size if paging is remote', () => {
      const reload = jest.spyOn(component, 'reloadData');
      component.remotePaging = true;
      component.onPaginatorPage({ pageIndex: 1, previousPageIndex: 2, pageSize: 50, length: 80 });
      expect(component.limit).toBe(50);
      expect(component.offset).toBe(1);
      expect(reload).toHaveBeenCalledTimes(1);
    });
  });
});
