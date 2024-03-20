import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardsWidget17Component } from './cards-widget17.component';

describe('CardsWidget17Component', () => {
  let component: CardsWidget17Component;
  let fixture: ComponentFixture<CardsWidget17Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CardsWidget17Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardsWidget17Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
