import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AuthService } from 'src/app/modules/auth';
import { SharedService } from 'src/app/shared.service';

@Component({
  selector: 'app-sidebar-menu',
  templateUrl: './sidebar-menu.component.html',
  styleUrls: ['./sidebar-menu.component.scss'],
})
export class SidebarMenuComponent implements OnInit {
  constructor(
    private sharedService: SharedService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private angularFireAuth: AngularFireAuth
  ) { }

  isAdmin: boolean;
  isLogistic: boolean;

  adminRole = "admin";
  logisticRole = "logistic";

  userId: string;
  userRoles: string[] = [];

  async ngOnInit(): Promise<void> {
    this.angularFireAuth.authState.subscribe((user) => {
      if (user) {
        this.userId = user.uid;
      }
      this.sharedService.getUserDetails(this.userId).then((results) => {
        if (results[0] != undefined) {
          this.userRoles = results[0].roles;
          console.log(this.userRoles);

          this.isAdmin = this.userRoles.includes(this.adminRole);
          this.isLogistic = this.userRoles.includes(this.logisticRole);
          this.cdr.detectChanges();
        }
      }
      )
    })
  }
}
