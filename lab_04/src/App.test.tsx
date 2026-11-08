import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, test } from 'vitest';

import App from './App';
import { formatuj, licz } from './components/obliczenia';

test('aplikacja się renderuje', () => {
  const { baseElement } = render(<App />);
  expect(baseElement).toBeDefined();
});

describe('licz()', () => {
  test('cztery działania', () => {
    expect(licz(9, '−', 4)).toBe(5);
    expect(licz(5, '×', 3)).toBe(15);
    expect(licz(2, '+', 3)).toBe(5);
    expect(licz(10, '÷', 4)).toBe(2.5);
  });

  test('dzielenie przez zero zwraca null', () => {
    expect(licz(7, '÷', 0)).toBeNull();
  });
});

describe('formatuj()', () => {
  test('usuwa błąd zmiennoprzecinkowy', () => {
    expect(formatuj(0.1 + 0.2)).toBe('0.3');
  });

  test('liczby całkowite bez części ułamkowej', () => {
    expect(formatuj(15)).toBe('15');
    expect(formatuj(-2)).toBe('-2');
  });
});
