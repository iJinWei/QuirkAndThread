import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { SharedService } from 'src/app/shared.service';
import { IUserRole } from 'src/app/modules/models/user.model';
import { Timestamp } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserViewModalComponent } from './user-listing-modal/user-listing-modal-view.component';
import { UserEditModalComponent } from './user-listing-modal/user-listing-modal-edit.component';

@Component({
  selector: 'app-user-listing',
  templateUrl: './user-listing.component.html',
  styleUrls: ['./user-listing.component.scss'],
})
export class UserListingComponent implements OnInit, AfterViewInit, OnDestroy {
  data = [
    { column1: 'Data 1', column2: 'Data 2', column3: 'Data 3', column4: 'Data 4', column5: 'Data 5' },
    // Add more data items here
  ];

  userList: IUserRole[] = [];
  displayList: any[] = [];

  constructor(
    private sharedService: SharedService,
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal
  ) { }

  ngAfterViewInit() {
    $('#example').DataTable();
  }

  ngOnInit(): void {
    this.sharedService.getUsers().subscribe(users => {
      this.userList = users;

      this.displayList = users.map(user => ({
        ...user,
        joinDate: this.toRelativeTime(user.joinDate!), // Convert to relative time
        lastLogin: this.toRelativeTime(user.lastLogin!) // Convert to relative time
      }));
      this.cdr.detectChanges();
      console.log(this.userList);
    });
  }

  ngOnDestroy(): void {
  }

  toRelativeTime(firebaseTimestamp: Timestamp): string {
    const date = firebaseTimestamp.toDate(); // Convert to JavaScript Date
    return formatDistanceToNow(date, { addSuffix: true }); // Convert to relative time
  }

  openViewModal(user: any): void {
    const modalRef = this.modalService.open(UserViewModalComponent);
    modalRef.componentInstance.user = user; // Pass user data to modal
  }

  openEditModal(user: any): void {
    const modalRef = this.modalService.open(UserEditModalComponent);
    modalRef.componentInstance.user = user; // Pass user data to modal
  }
}
