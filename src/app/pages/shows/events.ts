export interface ArtistMedia {
  name: string;
  photos: string[];
  videos?: string[];
}

export interface ShowEvent {
  id: number;
  day: string;
  month: string;
  title: string;
  handle?: string;
  instagramUrl?: string;
  venue: string;
  city?: string;
  dateShort?: string;
  time?: string;
  description: string;
  photos: string[];
  videos?: string[];
  artists?: ArtistMedia[];
  ticketsUrl: string;
  eventbriteId?: string;
}

export const EVENTS: ShowEvent[] = [
  {
    id: 260910,
    day: '10',
    month: 'SEPTIEMBRE',
    title: 'DANNA GODEL + JULIA TOPOREK',
    venue: 'DUNA CLUB',
    city: 'Querétaro',
    dateShort: '10/09',
    time: '21:00',
    description: 'DANNA GODEL + JULIA TOPOREK en DUNA CLUB. Una noche de música electrónica.',
    photos: [
      'assets/jueves-10-septiembre/danna-godel.jpg',
      'assets/jueves-10-septiembre/julia-toporek.jpg'
    ],
    ticketsUrl: 'https://shows.link/duna-club-julia-toporek-danna-godel/tickets'
  }
];
