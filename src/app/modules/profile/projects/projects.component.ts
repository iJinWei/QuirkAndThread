import { Component, OnInit } from '@angular/core';
import { IconUserModel } from '../../../_metronic/partials';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
})
export class ProjectsComponent implements OnInit {
  users1: Array<IconUserModel> = [
    { name: 'Emma Smith', avatar: './assets/media/avatars/300-6.jpg' },
    { name: 'Rudy Stone', avatar: './assets/media/avatars/300-1.jpg' },
    { name: 'Susan Redwood', initials: 'S', color: 'primary' },
  ];

  users2 = [
    { name: 'Alan Warden', initials: 'A', color: 'warning' },
    { name: 'Brian Cox', avatar: './assets/media/avatars/300-5.jpg' },
  ];

  users3 = [
    { name: 'Mad Masy', avatar: './assets/media/avatars/300-6.jpg' },
    { name: 'Cris Willson', avatar: './assets/media/avatars/300-1.jpg' },
    { name: 'Mike Garcie', initials: 'M', color: 'info' },
  ];

  users4 = [
    { name: 'Nich Warden', initials: 'N', color: 'warning' },
    { name: 'Rob Otto', initials: 'R', color: 'success' },
  ];

  users5 = [
    { name: 'Francis Mitcham', avatar: './assets/media/avatars/300-20.jpg' },
    { name: 'Michelle Swanston', avatar: './assets/media/avatars/300-7.jpg' },
    { name: 'Susan Redwood', initials: 'S', color: 'primary' },
  ];

  users6 = [
    { name: 'Emma Smith', avatar: './assets/media/avatars/300-6.jpg' },
    { name: 'Rudy Stone', avatar: './assets/media/avatars/300-1.jpg' },
    { name: 'Susan Redwood', initials: 'S', color: 'primary' },
  ];

  users7 = [
    { name: 'Meloday Macy', avatar: './assets/media/avatars/300-2.jpg' },
    { name: 'Rabbin Watterman', initials: 'S', color: 'success' },
  ];

  users8 = [
    { name: 'Emma Smith', avatar: './assets/media/avatars/300-6.jpg' },
    { name: 'Rudy Stone', avatar: './assets/media/avatars/300-1.jpg' },
    { name: 'Susan Redwood', initials: 'S', color: 'primary' },
  ];

  users9 = [
    { name: 'Meloday Macy', avatar: './assets/media/avatars/300-2.jpg' },
    { name: 'Rabbin Watterman', initials: 'S', color: 'danger' },
  ];

  constructor() {}

  ngOnInit(): void {}
}
