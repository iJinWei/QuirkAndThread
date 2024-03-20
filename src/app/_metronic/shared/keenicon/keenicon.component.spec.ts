import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KeeniconComponent } from './keenicon.component';

describe('KeeniconComponent', () => {
  let component: KeeniconComponent;
  let fixture: ComponentFixture<KeeniconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KeeniconComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KeeniconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
