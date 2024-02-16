import { TestBed } from '@angular/core/testing';

import { PdfExportServiceService } from './pdf-export-service.service';

describe('PdfExportServiceService', () => {
  let service: PdfExportServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PdfExportServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
