import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductPurchasesComponent } from './product-purchases.component';

describe('ProductPurchasesComponent', () => {
  let component: ProductPurchasesComponent;
  let fixture: ComponentFixture<ProductPurchasesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductPurchasesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductPurchasesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
