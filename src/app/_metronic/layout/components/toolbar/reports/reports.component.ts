import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
})
export class ReportsComponent implements OnInit {
  @Input() appPageTitleDisplay: boolean;

  constructor() {}

  ngOnInit(): void {}
}
