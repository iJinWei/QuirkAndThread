import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardsWidget18Component } from './cards-widget18.component';

describe('CardsWidget18Component', () => {
  let component: CardsWidget18Component;
  let fixture: ComponentFixture<CardsWidget18Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CardsWidget18Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardsWidget18Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
