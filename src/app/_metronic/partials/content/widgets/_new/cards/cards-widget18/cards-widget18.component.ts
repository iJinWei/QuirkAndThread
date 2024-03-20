import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-cards-widget18',
  templateUrl: './cards-widget18.component.html',
  styleUrls: ['./cards-widget18.component.scss'],
})
export class CardsWidget18Component implements OnInit {
  @Input() cssClass: string = '';
  @Input() image: string = '';

  cards: Array<{
    name: string;
    src?: string;
    initials?: string;
    state?: string;
  }> = [];

  constructor() {
    this.cards = [
      { name: 'Melody Macy', src: './assets/media/avatars/300-2.jpg' },
      { name: 'Michael Eberon', src: './assets/media/avatars/300-3.jpg' },
      { name: 'Susan Redwood', initials: 'S', state: 'primary' },
    ];
  }

  ngOnInit(): void {}
}
