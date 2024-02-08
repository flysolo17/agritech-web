import { TestBed } from '@angular/core/testing';

import { TargetSalesService } from './target-sales.service';

describe('TargetSalesService', () => {
  let service: TargetSalesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TargetSalesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
