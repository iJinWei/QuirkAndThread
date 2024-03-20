import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EngageWidget10Component } from './engage-widget10.component';

describe('EngageWidget10Component', () => {
  let component: EngageWidget10Component;
  let fixture: ComponentFixture<EngageWidget10Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EngageWidget10Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EngageWidget10Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
