const permissionInfo = document.querySelector('#permission');

function updatePermissionInfo() {
  permissionInfo.textContent =
    'Notification' in window ? Notification.permission : 'brak obsługi w tej przeglądarce';
}

updatePermissionInfo();

// O zgodę pytamy dopiero po kliknięciu przycisku, a nie od razu po wejściu na stronę.
document.querySelector('#enable').addEventListener('click', async () => {
  if (!('Notification' in window)) {
    alert('Ta przeglądarka nie obsługuje powiadomień (na iPhonie: najpierw dodaj aplikację do ekranu początkowego).');
    return;
  }
  const permission = await Notification.requestPermission();
  console.log('Uprawnienie:', permission);
  updatePermissionInfo();
});

function hasPermission() {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    alert('Najpierw włącz powiadomienia.');
    return false;
  }
  return true;
}

function showLocalNotification() {
  if (!hasPermission()) return;
  try {
    const notification = new Notification('Title', {
      body: 'Message body',
      icon: 'android.png',
    });
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  } catch (err) {
    // np. Chrome na Androidzie: "Illegal constructor" - tam działa tylko powiadomienie z service workera
    alert('Ta przeglądarka nie obsługuje new Notification(): ' + err.message);
  }
}

document.querySelector('#local').addEventListener('click', showLocalNotification);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('./service-worker.js')
    .catch((err) => console.error('Błąd rejestracji service workera:', err));
}

async function showSwNotification() {
  if (!hasPermission()) return;
  const registration = await navigator.serviceWorker.ready;
  await registration.showNotification('Powiadomienie z service workera', {
    body: 'Kliknij, aby otworzyć stronę uczelni.',
    icon: 'android.png',
    data: { url: 'https://www.uws.edu.pl' },
  });
}

document.querySelector('#sw').addEventListener('click', showSwNotification);

// Formularz: powiadomienie z własnym tytułem, treścią i ikoną (przez service workera,
// więc działa także w Chrome na Androidzie). Kliknięcie przywołuje okno aplikacji.
const form = document.querySelector('#notification-form');
const titleInput = document.querySelector('#title');
const iconSelect = document.querySelector('#icon');
const iconPreview = document.querySelector('#icon-preview');

iconSelect.addEventListener('change', () => {
  iconPreview.src = iconSelect.value;
});

// Sam atrybut "required" przepuściłby tytuł złożony z samych spacji.
titleInput.addEventListener('input', () => titleInput.setCustomValidity(''));

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const title = titleInput.value.trim();
  if (!title) {
    titleInput.setCustomValidity('Podaj tytuł powiadomienia.');
    form.reportValidity();
    return;
  }
  if (!hasPermission()) return;

  const registration = await navigator.serviceWorker.ready;
  await registration.showNotification(title, {
    body: document.querySelector('#body').value.trim(),
    icon: iconSelect.value,
    data: { url: './' },
  });
});

const VAPID_PUBLIC_KEY = 'BMiDDMXna3rNshyH-cDJ9YrC0SxlBPOW1vE0E7gAFDAPrzcwuIeeAasyyyMMeSv4K8-J1Tf43v-uUtdPn5hSnz4';
const subscriptionField = document.querySelector('#subscription');

// Klucz VAPID jest zapisany w base64url, a pushManager.subscribe() oczekuje tablicy bajtów.
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}

async function subscribePush() {
  if (!('PushManager' in window)) {
    alert('Ta przeglądarka nie obsługuje Web Push (na iPhonie: najpierw dodaj aplikację do ekranu początkowego).');
    return;
  }
  const registration = await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    try {
      // Jeśli użytkownik jeszcze nie wyraził zgody, przeglądarka zapyta o nią teraz.
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    } catch (err) {
      alert('Nie udało się zasubskrybować: ' + err.message);
      return;
    } finally {
      updatePermissionInfo();
    }
  }
  subscriptionField.value = JSON.stringify(subscription, null, 2);
}

async function unsubscribePush() {
  if (!('PushManager' in window)) return;
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (subscription) {
    await subscription.unsubscribe();
  }
  subscriptionField.value = '';
}

document.querySelector('#subscribe').addEventListener('click', subscribePush);
document.querySelector('#unsubscribe').addEventListener('click', unsubscribePush);
document.querySelector('#copy').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(subscriptionField.value);
    alert('Skopiowano subskrypcję do schowka.');
  } catch (err) {
    // brak dostępu do schowka - zaznaczamy tekst, żeby skopiować go ręcznie (Ctrl+C)
    subscriptionField.select();
    alert('Nie udało się skopiować automatycznie - tekst jest zaznaczony, skopiuj go ręcznie.');
  }
});

// Po odświeżeniu strony pokazujemy istniejącą subskrypcję (jeśli jest).
if ('serviceWorker' in navigator && 'PushManager' in window) {
  navigator.serviceWorker.ready
    .then((registration) => registration.pushManager.getSubscription())
    .then((subscription) => {
      if (subscription) subscriptionField.value = JSON.stringify(subscription, null, 2);
    });
}
