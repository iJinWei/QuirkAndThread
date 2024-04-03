import { Component, ViewChild, OnInit } from '@angular/core';
import { ModalConfig, ModalComponent } from '../../_metronic/partials';
import { SharedService } from 'src/app/shared.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/modules/auth';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  modalConfig: ModalConfig = {
    modalTitle: 'Modal title',
    dismissButtonLabel: 'Submit',
    closeButtonLabel: 'Cancel'
  };
  @ViewChild('modal') private modalComponent: ModalComponent;
  constructor(private sharedService:SharedService, private fb: FormBuilder, private authService:AuthService) {}


  ngOnInit() {
    this.checkUserRole();
  }

  checkUserRole() {
    const specificRole = 'admin'; // Specify the role you want to check for

    this.authService.getUser().subscribe(async (user) => {
      if (user && user.uid) {
        try {
          const hasRole = await this.authService.userHasRole(user.uid, specificRole);
          if (hasRole) {
            console.log('User has the specific role.');
          } else {
            console.log('User does not have the specific role.');
          }
        } catch (error) {
          console.error('Error checking user role:', error);
        }
      } else {
        console.log('No user is currently logged in.');
      }
    }, error => {
      console.error('Error fetching user:', error);
    });
  }

  async openModal() {
    return await this.modalComponent.open();
  }
}
