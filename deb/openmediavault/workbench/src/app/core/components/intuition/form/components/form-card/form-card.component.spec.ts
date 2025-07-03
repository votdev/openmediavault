import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastrModule } from 'ngx-toastr';

import { FormCardComponent } from '~/app/core/components/intuition/form/components/form-card/form-card.component';
import { IntuitionModule } from '~/app/core/components/intuition/intuition.module';
import { TestingModule } from '~/app/testing.module';

describe('FormCardComponent', () => {
  let component: FormCardComponent;
  let fixture: ComponentFixture<FormCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IntuitionModule, TestingModule, ToastrModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FormCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
