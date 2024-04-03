import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/modules/auth';
import { SharedService } from 'src/app/shared.service';

@Component({
  selector: 'app-sidebar-menu',
  templateUrl: './sidebar-menu.component.html',
  styleUrls: ['./sidebar-menu.component.scss']
})
export class SidebarMenuComponent implements OnInit {

  constructor(private sharedService:SharedService, private authService:AuthService) { }

  isAdmin: boolean;

  async ngOnInit(): Promise<void> {
    this.isAdmin = await this.authService.canPerformAction('admin');
  }

}
