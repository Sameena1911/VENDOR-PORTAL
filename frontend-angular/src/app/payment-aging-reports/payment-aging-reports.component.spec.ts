import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentAgingReportsComponent } from './payment-aging-reports.component';

describe('PaymentAgingReportsComponent', () => {
  let component: PaymentAgingReportsComponent;
  let fixture: ComponentFixture<PaymentAgingReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentAgingReportsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PaymentAgingReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
