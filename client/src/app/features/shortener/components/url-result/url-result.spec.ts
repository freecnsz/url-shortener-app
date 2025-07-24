import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UrlResult } from './url-result';

describe('UrlResult', () => {
  let component: UrlResult;
  let fixture: ComponentFixture<UrlResult>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UrlResult]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UrlResult);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
