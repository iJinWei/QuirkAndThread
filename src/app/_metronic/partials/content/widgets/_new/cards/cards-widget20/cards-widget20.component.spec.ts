import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardsWidget20Component } from './cards-widget20.component';

describe('CardsWidget20Component', () => {
  let component: CardsWidget20Component;
  let fixture: ComponentFixture<CardsWidget20Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CardsWidget20Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardsWidget20Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
