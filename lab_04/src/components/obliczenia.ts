// Czyste funkcje kalkulatora — osobny plik, żeby dało się je testować
// (i żeby Kalkulator.tsx eksportował tylko komponent).

export type Dzialanie = '+' | '−' | '×' | '÷';

export const BLAD_DZIELENIA = 'Nie można dzielić przez zero';

/** Liczy wynik działania bez eval(); null oznacza dzielenie przez zero. */
export function licz(a: number, dzialanie: Dzialanie, b: number): number | null {
  switch (dzialanie) {
    case '+':
      return a + b;
    case '−':
      return a - b;
    case '×':
      return a * b;
    case '÷':
      return b === 0 ? null : a / b;
  }
}

/** Zaokrągla błędy zmiennoprzecinkowe (0.1 + 0.2 -> 0.3) i zamienia liczbę na tekst. */
export function formatuj(liczba: number): string {
  return String(parseFloat(liczba.toFixed(10)));
}
