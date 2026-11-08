import { useEffect, useState } from 'react';
import { fetchWeather } from './api/fetchWeather.js';
import './App.css';

// 16 stron świata, co 22,5°
const DIRECTIONS = [
  'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
  'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
];

function compassDirection(deg) {
  return DIRECTIONS[Math.round(deg / 22.5) % 16];
}

function formatTime(unixSeconds) {
  // weather.dt to sekundy od 1970 r., a Date oczekuje milisekund
  return new Date(unixSeconds * 1000).toLocaleTimeString('pl-PL', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function App() {
  const [query, setQuery] = useState('');
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    // sprzątanie przy usuwaniu komponentu
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  const search = async (e) => {
    e.preventDefault();
    if (!query.trim()) return; // puste pole - nic nie robimy
    setLoading(true);
    setError('');
    try {
      const data = await fetchWeather(query);
      setWeather(data);
      setQuery(''); // czyścimy pole po udanym wyszukiwaniu
    } catch (err) {
      setWeather(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-container">
      <form onSubmit={search}>
        <input
          type="text"
          className="search"
          placeholder="Wpisz miasto..."
          aria-label="Miasto"
          enterKeyHint="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </form>

      {!online && (
        <p className="message offline">Brak połączenia — pokazuję ostatnio pobrane dane.</p>
      )}
      {loading && <p className="message">Pobieranie danych...</p>}
      {error && <p className="message error">{error}</p>}

      {weather && (
        <div className="city">
          <h2 className="city-name">
            <span>{weather.name}</span>
            <sup>{weather.sys.country}</sup>
          </h2>

          <div className="city-temp">
            {Math.round(weather.main.temp)}
            <sup>&deg;C</sup>
          </div>

          <div className="info">
            <img
              className="city-icon"
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
              alt={weather.weather[0].description}
            />
            <p>{weather.weather[0].description}</p>
          </div>

          <dl className="details">
            <div>
              <dt>Odczuwalna</dt>
              <dd>{Math.round(weather.main.feels_like)}&deg;C</dd>
            </div>
            <div>
              <dt>Ciśnienie</dt>
              <dd>{weather.main.pressure} hPa</dd>
            </div>
            <div>
              <dt>Wilgotność</dt>
              <dd>{weather.main.humidity}%</dd>
            </div>
            <div>
              <dt>Wiatr</dt>
              <dd>{weather.wind.speed} m/s</dd>
            </div>
            {weather.wind.gust !== undefined && (
              <div>
                <dt>Porywy</dt>
                <dd>{weather.wind.gust} m/s</dd>
              </div>
            )}
            <div>
              <dt>Kierunek</dt>
              <dd>
                <span
                  className="wind-arrow"
                  // strzałka wskazuje, DOKĄD wieje wiatr (deg mówi, skąd wieje)
                  style={{ transform: `rotate(${weather.wind.deg + 180}deg)` }}
                  aria-hidden="true"
                >
                  ↑
                </span>{' '}
                {compassDirection(weather.wind.deg)} ({weather.wind.deg}&deg;)
              </dd>
            </div>
          </dl>

          <p className="updated">Pomiar z godz. {formatTime(weather.dt)}</p>
        </div>
      )}
    </div>
  );
}

export default App;
