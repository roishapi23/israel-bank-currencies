import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RangeCurrenciesComponent } from './range-currencies.component';

describe('RangeCurrenciesComponent', () => {
  let component: RangeCurrenciesComponent;
  let fixture: ComponentFixture<RangeCurrenciesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RangeCurrenciesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RangeCurrenciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
