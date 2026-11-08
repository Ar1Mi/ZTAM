import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Lokalnie aplikacja działa pod "/", na GitHub Pages pod "/ZTAM/lab_03/"
// (ścieżkę ustawia workflow przez zmienną BASE_PATH).
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // nowa wersja aplikacji instaluje się sama
      includeAssets: ['favicon.svg', 'favicon.ico', 'apple-touch-icon-180x180.png'],
      manifest: {
        id: base,
        name: 'Pogoda',
        short_name: 'Pogoda',
        description: 'Aktualna pogoda dla wybranego miasta',
        lang: 'pl',
        display: 'standalone',
        background_color: '#1e3c72',
        theme_color: '#1e3c72',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        // zrzuty ekranu w oknie instalacji (usuwają ostrzeżenie "Richer PWA Install UI")
        screenshots: [
          {
            src: 'screenshots/wide.png',
            sizes: '1280x800',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Pogoda dla wybranego miasta',
          },
          {
            src: 'screenshots/narrow.png',
            sizes: '390x844',
            type: 'image/png',
            label: 'Pogoda na telefonie',
          },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            // odpowiedzi API: najpierw sieć, a bez sieci - ostatnia zapisana odpowiedź
            urlPattern: ({ url }) => url.origin === 'https://api.openweathermap.org',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'weather-api',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 20, maxAgeSeconds: 24 * 60 * 60 },
            },
          },
          {
            // ikony pogody: najpierw cache (ikony się nie zmieniają)
            urlPattern: ({ url }) =>
              url.origin === 'https://openweathermap.org' && url.pathname.startsWith('/img/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'weather-icons',
              expiration: { maxEntries: 50 },
              // <img> z innej domeny daje odpowiedź "opaque" (status 0) — CacheFirst
              // domyślnie jej nie zapisuje, więc trzeba na to jawnie pozwolić
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
});
