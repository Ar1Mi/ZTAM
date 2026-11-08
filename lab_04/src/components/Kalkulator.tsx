import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCol, IonGrid, IonRow } from '@ionic/react';
import { useEffect, useRef, useState } from 'react';

import type { Dzialanie } from './obliczenia';
import { BLAD_DZIELENIA, formatuj, licz } from './obliczenia';

import './Kalkulator.css';

const MAKS_CYFR = 16;

// klawisze klawiatury -> przyciski kalkulatora
const KLAWISZE: Record<string, string> = {
  '+': '+',
  '-': '−',
  '*': '×',
  x: '×',
  '/': '÷',
  ',': '.',
  '.': '.',
  Enter: '=',
  '=': '=',
  Backspace: '⌫',
  Escape: 'C',
  Delete: 'C',
  c: 'C',
  '%': '%',
};

const Kalkulator: React.FC = () => {
  // tekst na wyświetlaczu
  const [wyswietlacz, setWyswietlacz] = useState('0');
  // pierwsza liczba działania i wybrane działanie
  const [poprzednia, setPoprzednia] = useState<number | null>(null);
  const [dzialanie, setDzialanie] = useState<Dzialanie | null>(null);
  // true: następna cyfra zaczyna nową liczbę (po działaniu, "=" albo "%")
  const [nowaLiczba, setNowaLiczba] = useState(true);
  // true: na wyświetlaczu jest wynik "%", który traktujemy jak wpisaną liczbę
  const [poProcencie, setPoProcencie] = useState(false);

  const blad = wyswietlacz === BLAD_DZIELENIA;

  const wyczysc = () => {
    setWyswietlacz('0');
    setPoprzednia(null);
    setDzialanie(null);
    setNowaLiczba(true);
    setPoProcencie(false);
  };

  const pokazBlad = () => {
    setWyswietlacz(BLAD_DZIELENIA);
    setPoprzednia(null);
    setDzialanie(null);
    setNowaLiczba(true);
  };

  const cyfra = (c: string) => {
    setPoProcencie(false);
    if (blad || nowaLiczba) {
      if (blad) wyczysc();
      setWyswietlacz(c);
      setNowaLiczba(false);
      return;
    }
    if (wyswietlacz.replace(/[-.]/g, '').length >= MAKS_CYFR) return;
    setWyswietlacz(wyswietlacz === '0' ? c : wyswietlacz === '-0' ? '-' + c : wyswietlacz + c);
  };

  const kropka = () => {
    setPoProcencie(false);
    if (blad || nowaLiczba) {
      if (blad) wyczysc();
      setWyswietlacz('0.');
      setNowaLiczba(false);
      return;
    }
    if (wyswietlacz.includes('.')) return; // druga kropka w liczbie jest ignorowana
    setWyswietlacz(wyswietlacz + '.');
  };

  const wybierzDzialanie = (d: Dzialanie) => {
    if (blad) return;
    const biezaca = parseFloat(wyswietlacz);
    const wpisana = !nowaLiczba || poProcencie;
    setPoProcencie(false);
    // liczenie łańcuchowe jak w Windowsie: 2 + 3 + od razu pokazuje 5
    if (poprzednia !== null && dzialanie !== null && wpisana) {
      const wynik = licz(poprzednia, dzialanie, biezaca);
      if (wynik === null) return pokazBlad();
      setWyswietlacz(formatuj(wynik));
      setPoprzednia(wynik);
    } else if (poprzednia === null || wpisana || dzialanie === null) {
      setPoprzednia(biezaca);
    }
    // ponowne kliknięcie działania tuż po innym tylko je podmienia
    setDzialanie(d);
    setNowaLiczba(true);
  };

  const rowna = () => {
    if (blad || poprzednia === null || dzialanie === null) return;
    setPoProcencie(false);
    const wynik = licz(poprzednia, dzialanie, parseFloat(wyswietlacz));
    if (wynik === null) return pokazBlad();
    setWyswietlacz(formatuj(wynik));
    setPoprzednia(null);
    setDzialanie(null);
    setNowaLiczba(true); // wynik można wykorzystać w kolejnym działaniu
  };

  const cofnij = () => {
    if (blad) return wyczysc();
    if (nowaLiczba) return; // wyniku nie edytujemy cyfra po cyfrze
    const krotszy = wyswietlacz.slice(0, -1);
    setWyswietlacz(krotszy === '' || krotszy === '-' ? '0' : krotszy);
  };

  const zmienZnak = () => {
    if (blad || wyswietlacz === '0') return;
    setWyswietlacz(wyswietlacz.startsWith('-') ? wyswietlacz.slice(1) : '-' + wyswietlacz);
  };

  const procent = () => {
    if (blad) return;
    const biezaca = parseFloat(wyswietlacz);
    // jak w Windowsie: przy + i − procent liczony od pierwszej liczby (200 + 10% = 220)
    const wynik =
      poprzednia !== null && (dzialanie === '+' || dzialanie === '−') ? (poprzednia * biezaca) / 100 : biezaca / 100;
    setWyswietlacz(formatuj(wynik));
    setNowaLiczba(true);
    setPoProcencie(true);
  };

  const nacisnij = (przycisk: string) => {
    if (/^\d$/.test(przycisk)) return cyfra(przycisk);
    switch (przycisk) {
      case '.':
        return kropka();
      case '+':
      case '−':
      case '×':
      case '÷':
        return wybierzDzialanie(przycisk);
      case '=':
        return rowna();
      case 'C':
        return wyczysc();
      case '⌫':
        return cofnij();
      case '±':
        return zmienZnak();
      case '%':
        return procent();
    }
  };

  // obsługa klawiatury — ref zawsze wskazuje na aktualną funkcję (z aktualnym stanem)
  const nacisnijRef = useRef(nacisnij);
  useEffect(() => {
    nacisnijRef.current = nacisnij;
  });
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const cel = e.target as HTMLElement;
      // nie przechwytujemy pisania w polach BMI
      if (cel.closest('input, textarea, ion-input')) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const przycisk = /^\d$/.test(e.key) ? e.key : KLAWISZE[e.key];
      if (!przycisk) return;
      e.preventDefault();
      nacisnijRef.current(przycisk);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const uklad: { tekst: string; kolor?: string; rozmiar?: string }[][] = [
    [{ tekst: '%' }, { tekst: '±' }, { tekst: '⌫', rozmiar: '6' }],
    [{ tekst: '7' }, { tekst: '8' }, { tekst: '9' }, { tekst: '÷' }],
    [{ tekst: '4' }, { tekst: '5' }, { tekst: '6' }, { tekst: '×' }],
    [{ tekst: '1' }, { tekst: '2' }, { tekst: '3' }, { tekst: '−' }],
    [{ tekst: 'C', kolor: 'danger' }, { tekst: '0' }, { tekst: '.' }, { tekst: '+' }],
    [{ tekst: '=', kolor: 'primary', rozmiar: '12' }],
  ];

  const kolorPrzycisku = (tekst: string, kolor?: string) => {
    if (kolor) return kolor;
    if (/^\d$/.test(tekst) || tekst === '.') return 'light';
    return 'medium';
  };

  return (
    <IonCard className="kalkulator">
      <IonCardHeader>
        <IonCardTitle>Kalkulator</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <div className="wyswietlacz" aria-live="polite">
          <div className="wyrazenie" data-testid="wyrazenie">
            {poprzednia !== null && dzialanie !== null ? `${formatuj(poprzednia)} ${dzialanie}` : ' '}
          </div>
          <h1 className={blad ? 'blad' : undefined} data-testid="wyswietlacz">
            {wyswietlacz}
          </h1>
        </div>
        <IonGrid className="przyciski">
          {uklad.map((wiersz, i) => (
            <IonRow key={i}>
              {wiersz.map(({ tekst, kolor, rozmiar }) => (
                <IonCol key={tekst} size={rozmiar ?? '3'}>
                  <IonButton
                    expand="block"
                    color={kolorPrzycisku(tekst, kolor)}
                    className={dzialanie === tekst && nowaLiczba && !poProcencie ? 'aktywne' : undefined}
                    onClick={() => nacisnij(tekst)}
                    aria-label={tekst === '⌫' ? 'Usuń ostatnią cyfrę' : tekst === '±' ? 'Zmień znak' : undefined}
                  >
                    {tekst}
                  </IonButton>
                </IonCol>
              ))}
            </IonRow>
          ))}
        </IonGrid>
      </IonCardContent>
    </IonCard>
  );
};

export default Kalkulator;
