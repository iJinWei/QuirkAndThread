import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablesWidget16Component } from './tables-widget16.component';

describe('TablesWidget16Component', () => {
  let component: TablesWidget16Component;
  let fixture: ComponentFixture<TablesWidget16Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TablesWidget16Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TablesWidget16Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
