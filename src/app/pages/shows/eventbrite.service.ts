import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ShowEvent } from './events';

declare global {
  interface Window {
    EBWidgets?: {
      createWidget(config: {
        widgetType: string;
        eventId: string;
        modal: boolean;
        modalTriggerElementId: string;
      }): void;
    };
  }
}

@Injectable({ providedIn: 'root' })
export class EventbriteService {
  private ready = false;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  setupWidgets(events: ShowEvent[]): void {
    if (!isPlatformBrowser(this.platformId)) { return; }
    this.loadScript().then(() => {
      for (const event of events) {
        if (!event.eventbriteId || !window.EBWidgets) { continue; }
        window.EBWidgets.createWidget({
          widgetType: 'checkout',
          eventId: event.eventbriteId,
          modal: true,
          modalTriggerElementId: `eb-trigger-${event.eventbriteId}`
        });
      }
      this.ready = !!window.EBWidgets;
    }).catch(() => { this.ready = false; });
  }

  // Fallback si el widget de Eventbrite no cargó
  openTickets(event: ShowEvent): void {
    if (!this.ready) {
      window.open(event.ticketsUrl, '_blank', 'noopener');
    }
  }

  private loadScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.EBWidgets) { resolve(); return; }
      const existing = document.getElementById('eb-widgets-js') as HTMLScriptElement | null;
      if (existing) {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () => reject());
        return;
      }
      const script = document.createElement('script');
      script.id = 'eb-widgets-js';
      script.src = 'https://www.eventbrite.com/static/widgets/eb_widgets.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject();
      document.head.appendChild(script);
    });
  }
}
