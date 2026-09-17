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
  ctaLabel?: string;
}

export const EVENTS: ShowEvent[] = [
  {
    id: 260917,
    day: '17',
    month: 'SEPTIEMBRE',
    title: 'FERCO + ZONDA',
    venue: 'DUNA CLUB',
    city: 'Querétaro',
    dateShort: '17/09',
    time: '21:00',
    description: 'FERCO + ZONDA en DUNA CLUB. Una noche de música electrónica.',
    photos: ['assets/17-19septiembre/flyer-17-septiembre.jpg'],
    ticketsUrl: 'https://shows.link/s/dn-clb-frc',
    ctaLabel: 'Comprar ticket'
  },
  {
    id: 260918,
    day: '18',
    month: 'SEPTIEMBRE',
    title: 'NAT SALAZAR + TATA GAYA',
    venue: 'DUNA CLUB',
    city: 'Querétaro',
    dateShort: '18/09',
    time: '21:00',
    description: 'NAT SALAZAR + TATA GAYA en DUNA CLUB. Una noche de música electrónica.',
    photos: ['assets/17-19septiembre/flyer-18-septiembre.jpg'],
    ticketsUrl: 'https://shows.link/s/dn-clb-nat'
  },
  {
    id: 260919,
    day: '19',
    month: 'SEPTIEMBRE',
    title: 'ARRAZATE + 1 TAPS',
    venue: 'DUNA CLUB',
    city: 'Querétaro',
    dateShort: '19/09',
    time: '21:00',
    description: 'ARRAZATE + 1 TAPS en DUNA CLUB. Una noche de música electrónica.',
    photos: ['assets/17-19septiembre/flyer-19-septiembre.jpg'],
    ticketsUrl: 'https://shows.link/s/dn-clb-arrzt',
    ctaLabel: 'Comprar ticket'
  }
];
