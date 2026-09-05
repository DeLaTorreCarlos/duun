import { AfterViewInit, Component } from '@angular/core';
import { EVENTS, ShowEvent } from './events';
import { EventbriteService } from './eventbrite.service';

@Component({
  selector: 'app-shows',
  templateUrl: './shows.component.html',
  styleUrl: './shows.component.css'
})
export class ShowsComponent implements AfterViewInit {
  events: ShowEvent[] = EVENTS;

  constructor(private eventbrite: EventbriteService) {}

  ngAfterViewInit(): void {
    this.eventbrite.setupWidgets(this.events);
  }

  openTickets(event: ShowEvent): void {
    this.eventbrite.openTickets(event);
  }
}
