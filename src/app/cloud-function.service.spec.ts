import { TestBed } from '@angular/core/testing';

import { CloudFunctionService } from './cloud-function.service';

describe('CloudFunctionServiceService', () => {
  let service: CloudFunctionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CloudFunctionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
