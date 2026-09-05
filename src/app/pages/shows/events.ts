export interface ShowEvent {
  id: number;
  day: string;
  month: string;
  title: string;
  handle?: string;
  instagramUrl?: string;
  venue: string;
  description: string;
  photos: string[];
  videos?: string[];
  ticketsUrl: string;
  eventbriteId?: string;
}

export const EVENTS: ShowEvent[] = [
  {
    id: 260903,
    day: '03',
    month: 'SEPTIEMBRE',
    title: 'ALANÍS + JOYCE',
    venue: 'DUNA CLUB',
    description: 'ALANÍS + JOYCE en DUNA CLUB. Una noche de música electrónica.',
    photos: ['assets/alanis/ALANIS.png'],
    videos: ['assets/alanis/ALANIS.mp4'],
    ticketsUrl: 'https://www.eventbrite.com.mx/e/duna-club-tickets-1999334359891',
    eventbriteId: '1999334359891'
  }
];
