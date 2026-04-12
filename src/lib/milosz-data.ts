export interface Fight {
  opponent: string;
  event: string;
  date: string;
  result: 'W' | 'L';
  method: string;
}

export const FIGHT_RECORD: Fight[] = [
  { opponent: 'Mateusz Krol', event: 'QUEST MMA 7', date: 'maj 2025', result: 'W', method: 'Decyzja jednoglosna' },
  { opponent: 'Filip Grabowski', event: 'QUEST MMA 5', date: '2024', result: 'W', method: 'Decyzja' },
  { opponent: 'Jakub Sakowski', event: 'QUEST MMA 3', date: '2023', result: 'W', method: 'Duszenie (RNC)' },
  { opponent: 'Ivan Volkau', event: 'QUEST MMA 1', date: 'cze 2022', result: 'W', method: 'Decyzja' },
  { opponent: 'Przeciwnik 1', event: 'QUEST MMA', date: '2023', result: 'L', method: 'Decyzja' },
  { opponent: 'Przeciwnik 2', event: 'Gala MMA', date: '2024', result: 'L', method: 'TKO' },
  { opponent: 'Przeciwnik 3', event: 'QUEST MMA', date: '2024', result: 'L', method: 'Decyzja' },
];

export const MILOSZ_BIO_INTRO = 'Wchodze do klatki, zeby sie sprawdzic. Trenuje ludzi, zeby zmienili swoje zycie.';

export const MILOSZ_BIO = `Rekord 4\u20133 w amatorskim MMA. Kategoria polciezka. Walcze w promocji QUEST MMA \u2014 jedynej gali sztuk walki w Krosnie.

Ale ta strona nie jest o moich walkach. Jest o Twoich.

Prowadze treningi personalne i grupowe w klubie MMA Krosno. Ucze MMA, boksu, grappingu i przygotowania fizycznego. Nie szukam klientow \u2014 szukam ludzi, ktorzy chca byc lepszą wersja siebie.

Kazdy kto wchodzi na mate dostaje to samo: pelen szacunek, zero taryfy ulgowej i plan, ktory dziala. Bez znaczenia czy walczysz amatorsko, czy pierwszy raz zakladasz rekawice.`;

export const MILOSZ_TAGLINE = 'Trener, ktory wchodzi do klatki. I nauczy Cie to samo.';

export const SOCIAL_LINKS = {
  instagram: 'https://instagram.com/milosz_wp',
  facebook: 'https://facebook.com/kornasiewicz',
};

export const RECORD_SUMMARY = { wins: 4, losses: 3, draws: 0 };

export const SPECIALIZATIONS = [
  'MMA',
  'Grappling / BJJ',
  'Boks',
  'Trening personalny',
  'Przygotowanie fizyczne',
];
