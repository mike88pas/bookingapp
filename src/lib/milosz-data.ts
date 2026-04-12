export interface Fight {
  opponent: string;
  event: string;
  date: string;
  result: 'W' | 'L';
  method: string;
}

export const FIGHT_RECORD: Fight[] = [
  { opponent: 'Mateusz Krol', event: 'QUEST MMA 7', date: 'maj 2025', result: 'W', method: 'Decyzja' },
  { opponent: 'Filip Grabowski', event: 'QUEST MMA 5', date: '2024', result: 'W', method: 'Decyzja' },
  { opponent: 'Jakub Sakowski', event: 'QUEST MMA 3', date: '2023', result: 'W', method: 'Submission (RNC)' },
  { opponent: 'Ivan Volkau', event: 'QUEST MMA 1', date: 'cze 2022', result: 'W', method: 'Decyzja' },
  { opponent: 'Przeciwnik 1', event: 'QUEST MMA', date: '2023', result: 'L', method: 'Decyzja' },
  { opponent: 'Przeciwnik 2', event: 'Gala MMA', date: '2024', result: 'L', method: 'TKO' },
  { opponent: 'Przeciwnik 3', event: 'QUEST MMA', date: '2024', result: 'L', method: 'Decyzja' },
];

export const MILOSZ_BIO = `Zawodnik amatorskiego MMA z rekordem 4-3, walczacy w kategorii polciezkiej. Trenuje i walczy w promocji QUEST MMA w Krosnie. Na co dzien prowadze treningi personalne i grupowe w klubie MMA Krosno — od sparringow po przygotowanie kondycyjne. Kazdy trening to nie tylko technika, ale mentalnosc. Ucze dyscypliny, pokory i odwagi — na macie i poza nia.`;

export const MILOSZ_TAGLINE = 'Nie szukam wymowek. Szukam przeciwnika. Ty tez mozesz.';

export const SOCIAL_LINKS = {
  instagram: 'https://instagram.com/milosz_wp',
  facebook: 'https://facebook.com/kornasiewicz',
};

export const RECORD_SUMMARY = { wins: 4, losses: 3, draws: 0 };

export const SPECIALIZATIONS = [
  'MMA',
  'Grappling',
  'Boks',
  'Trening personalny',
  'Przygotowanie kondycyjne',
];
