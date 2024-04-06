import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/modules/auth';
import { SharedService } from 'src/app/shared.service';

@Component({
  selector: 'app-sidebar-menu',
  templateUrl: './sidebar-menu.component.html',
  styleUrls: ['./sidebar-menu.component.scss']
})
export class SidebarMenuComponent implements OnInit {

  constructor(private sharedService:SharedService, private authService:AuthService, private cdr: ChangeDetectorRef) { }

  isAdmin: boolean;
  isLogistic: boolean;
  isCustomer: boolean;

  async ngOnInit(): Promise<void> {
    this.isAdmin = await this.authService.canPerformAction('admin');
    this.isLogistic = await this.authService.canPerformAction('logistic');
    this.isCustomer = await this.authService.canPerformAction('customer');
    this.cdr.detectChanges(); // Manually trigger change detection
  }

}
