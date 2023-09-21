import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { IntuitionModule } from '~/app/core/components/intuition/intuition.module';
import { VboxPageComponent } from '~/app/core/components/intuition/vbox-page/vbox-page.component';
import { TestingModule } from '~/app/testing.module';

describe('VboxPageComponent', () => {
  let component: VboxPageComponent;
  let fixture: ComponentFixture<VboxPageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IntuitionModule, TestingModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VboxPageComponent);
    component = fixture.componentInstance;
    component.config = {
      tabs: []
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
