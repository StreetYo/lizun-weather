/** Open-Meteo (https://open-meteo.com): free, no key. Both origins are in the manifest's `network`. */
import { network } from '/__sdk/index.js';

const FORECAST = 'https://api.open-meteo.com/v1/forecast';
const GEOCODING = 'https://geocoding-api.open-meteo.com/v1/search';

async function getJson(url) {
  const response = await network.request(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

/**
 * Up to five places named like `query`, with names in `language` (`en` or `ru`).
 * @returns {Promise<{ id: number, name: string, region: string, country: string, latitude: number, longitude: number }[]>}
 */
export async function searchPlaces(query, language) {
  const params = new URLSearchParams({ name: query, count: '5', language, format: 'json' });
  const reply = await getJson(`${GEOCODING}?${params}`);
  return (reply.results ?? []).map((place) => ({
    id: place.id,
    name: place.name,
    region: place.admin1 && place.admin1 !== place.name ? place.admin1 : '',
    country: place.country ?? '',
    latitude: place.latitude,
    longitude: place.longitude,
  }));
}

/**
 * Current weather, three days of hours and days at the place, in the place's own time zone.
 * `temperature` is `celsius` or `fahrenheit`, `wind` is `kmh`, `ms` or `mph`.
 */
export async function loadForecast(place, { temperature, wind }) {
  const params = new URLSearchParams({
    latitude: String(place.latitude),
    longitude: String(place.longitude),
    current: 'temperature_2m,apparent_temperature,weather_code,is_day,wind_speed_10m,relative_humidity_2m',
    hourly: 'temperature_2m,weather_code,precipitation_probability',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset',
    timezone: 'auto',
    forecast_days: '3',
  });
  if (temperature === 'fahrenheit') params.set('temperature_unit', 'fahrenheit');
  if (wind !== 'kmh') params.set('wind_speed_unit', wind);
  const reply = await getJson(`${FORECAST}?${params}`);
  const { current, hourly, daily } = reply;
  if (!current || !hourly?.time || !daily?.time) throw new Error('unexpected answer');
  return {
    utcOffset: reply.utc_offset_seconds ?? 0,
    current: {
      time: current.time,
      temperature: current.temperature_2m,
      feelsLike: current.apparent_temperature,
      code: current.weather_code,
      isDay: current.is_day === 1,
      wind: current.wind_speed_10m,
      humidity: current.relative_humidity_2m,
    },
    hours: hourly.time.map((time, i) => ({
      time,
      temperature: hourly.temperature_2m[i],
      code: hourly.weather_code[i],
      rain: hourly.precipitation_probability?.[i] ?? null,
    })),
    days: daily.time.map((date, i) => ({
      date,
      code: daily.weather_code[i],
      high: daily.temperature_2m_max[i],
      low: daily.temperature_2m_min[i],
      sunrise: daily.sunrise[i],
      sunset: daily.sunset[i],
    })),
  };
}
