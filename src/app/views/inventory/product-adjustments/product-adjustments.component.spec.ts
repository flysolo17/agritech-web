import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductAdjustmentsComponent } from './product-adjustments.component';

describe('ProductAdjustmentsComponent', () => {
  let component: ProductAdjustmentsComponent;
  let fixture: ComponentFixture<ProductAdjustmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductAdjustmentsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductAdjustmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
