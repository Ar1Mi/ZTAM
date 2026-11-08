import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

const wyswietlacz = (page: Page) => page.getByTestId('wyswietlacz');

/** Klika kolejne przyciski kalkulatora, np. klikaj(page, '9 − 4 ='). */
async function klikaj(page: Page, sekwencja: string) {
  const kalkulator = page.locator('.kalkulator');
  for (const tekst of sekwencja.split(' ')) {
    await kalkulator.locator('ion-button', { hasText: new RegExp(`^${tekst.replace(/[.+]/g, '\\$&')}$`) }).click();
  }
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test.describe('Kalkulator BMI', () => {
  test('liczy BMI i resetuje wynik', async ({ page }) => {
    await expect(page.getByTestId('bmi')).toHaveCount(0);
    await page.getByLabel('Wzrost (cm)').fill('180');
    await page.getByLabel('Waga (kg)').fill('75');
    await page.getByRole('button', { name: 'Oblicz' }).click();
    await expect(page.getByTestId('bmi')).toHaveText('BMI: 23.15');
    await expect(page.getByText('Waga prawidłowa')).toBeVisible();

    await page.getByRole('button', { name: 'Resetuj' }).click();
    await expect(page.getByTestId('bmi')).toHaveCount(0);
    await expect(page.getByLabel('Wzrost (cm)')).toHaveValue('');
  });

  test('puste pola pokazują komunikat', async ({ page }) => {
    await page.getByRole('button', { name: 'Oblicz' }).click();
    await expect(page.getByRole('alert')).toContainText('Wpisz dodatni wzrost i wagę.');
  });
});

test.describe('Kalkulator', () => {
  test('wynik można użyć w kolejnym działaniu: 9 − 4 = × 3 = daje 15', async ({ page }) => {
    await klikaj(page, '9 − 4 =');
    await expect(wyswietlacz(page)).toHaveText('5');
    await klikaj(page, '× 3 =');
    await expect(wyswietlacz(page)).toHaveText('15');
  });

  test('druga kropka jest ignorowana, 0.1 + 0.2 = 0.3', async ({ page }) => {
    await klikaj(page, '0 . 1 . + 0 . 2 =');
    await expect(wyswietlacz(page)).toHaveText('0.3');
  });

  test('dzielenie przez zero i C', async ({ page }) => {
    await klikaj(page, '7 ÷ 0 =');
    await expect(wyswietlacz(page)).toHaveText('Nie można dzielić przez zero');
    await klikaj(page, 'C');
    await expect(wyswietlacz(page)).toHaveText('0');
  });

  test('liczenie łańcuchowe: 2 + 3 + pokazuje 5', async ({ page }) => {
    await klikaj(page, '2 + 3 +');
    await expect(wyswietlacz(page)).toHaveText('5');
    await expect(page.getByTestId('wyrazenie')).toHaveText('5 +');
  });

  test('±, % i ⌫', async ({ page }) => {
    await klikaj(page, '1 2 3 ⌫ ±');
    await expect(wyswietlacz(page)).toHaveText('-12');
    await klikaj(page, 'C 2 0 0 + 1 0 % =');
    await expect(wyswietlacz(page)).toHaveText('220');
  });

  test('obsługa klawiatury', async ({ page }) => {
    await page.locator('ion-content').click({ position: { x: 5, y: 5 } });
    await page.keyboard.type('12*3');
    await page.keyboard.press('Enter');
    await expect(wyswietlacz(page)).toHaveText('36');
    await page.keyboard.press('Escape');
    await expect(wyswietlacz(page)).toHaveText('0');
  });
});
