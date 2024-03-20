import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewChartsWidget8Component } from './new-charts-widget8.component';

describe('NewChartsWidget8Component', () => {
  let component: NewChartsWidget8Component;
  let fixture: ComponentFixture<NewChartsWidget8Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewChartsWidget8Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewChartsWidget8Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
