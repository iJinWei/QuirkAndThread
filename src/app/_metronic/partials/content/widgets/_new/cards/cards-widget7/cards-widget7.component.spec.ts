import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardsWidget7Component } from './cards-widget7.component';

describe('CardsWidget7Component', () => {
  let component: CardsWidget7Component;
  let fixture: ComponentFixture<CardsWidget7Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CardsWidget7Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardsWidget7Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
