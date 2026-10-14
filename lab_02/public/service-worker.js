// Nowa wersja service workera od razu przejmuje stronę (bez czekania na zamknięcie kart).
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

// Kliknięcie w powiadomienie: zamykamy je i przywołujemy okno aplikacji
// (albo otwieramy adres zapisany w "data.url", np. stronę uczelni).
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || './', self.registration.scope).href;

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      // Jeśli okno aplikacji jest już otwarte (np. ./ albo ./index.html) - przełączamy się na nie
      // zamiast otwierać nowe.
      const existing = windows.find((client) => client.url.startsWith(url));
      if (existing) {
        return existing.focus();
      }
      return self.clients.openWindow(url);
    })()
  );
});

// Wiadomość z serwera: oczekujemy JSON-a {"title": "...", "body": "..."},
// ale obsługujemy też zwykły tekst (np. z przycisku "Push" w DevTools).
self.addEventListener('push', (event) => {
  let message = { title: 'Web Push', body: event.data ? event.data.text() : '' };
  try {
    message = event.data.json();
  } catch (err) {
    // to nie był JSON - zostaje tekst
  }
  event.waitUntil(
    self.registration.showNotification(message.title, {
      body: message.body,
      icon: message.icon || 'android.png',
      data: { url: './' },
    })
  );
});
