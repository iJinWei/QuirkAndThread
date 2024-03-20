import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-cards-widget20',
  templateUrl: './cards-widget20.component.html',
  styleUrls: ['./cards-widget20.component.scss'],
})
export class CardsWidget20Component implements OnInit {
  @Input() cssClass: string = '';
  @Input() description: string = '';
  @Input() color: string = '';
  @Input() img: string = '';
  constructor() {}

  ngOnInit(): void {}
}
