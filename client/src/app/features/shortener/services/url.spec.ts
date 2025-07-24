import { TestBed } from '@angular/core/testing';
import { UrlService } from './url';

describe('UrlService', () => {
  let service: UrlService = new UrlService();

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UrlService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
