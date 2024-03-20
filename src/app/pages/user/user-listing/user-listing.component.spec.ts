import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserListingComponent } from './user-listing.component';

describe('UserListingComponent', () => {
  let component: UserListingComponent;
  let fixture: ComponentFixture<UserListingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserListingComponent]
    });
    fixture = TestBed.createComponent(v);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
