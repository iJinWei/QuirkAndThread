import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListsWidget26Component } from './lists-widget26.component';

describe('ListsWidget26Component', () => {
  let component: ListsWidget26Component;
  let fixture: ComponentFixture<ListsWidget26Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListsWidget26Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListsWidget26Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
