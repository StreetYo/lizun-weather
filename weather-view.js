/** The main view: the place, the weather now, today's high and low, and the next hours. */
import { conditionText, iconFor } from './conditions.js';

const HOURS_SHOWN = 6;

const section = document.getElementById('weather');
const city = document.getElementById('city');
const placeButton = document.getElementById('place');
const meta = document.getElementById('meta');
const now = document.getElementById('now');
const temperature = document.getElementById('temperature');
const conditionIcon = document.getElementById('condition-icon');
const condition = document.getElementById('condition');
const feels = document.getElementById('feels');
const highLow = document.getElementById('high-low');
const hours = document.getElementById('hours');
const message = document.getElementById('message');
const messageText = document.getElementById('message-text');
const retry = document.getElementById('retry');

/** `14°`, with a real minus sign and no `-0°`. */
export function formatTemperature(value) {
  const rounded = Math.round(value) || 0;
  return `${rounded < 0 ? '−' : ''}${Math.abs(rounded)}°`;
}

/** The time at the place now, in Open-Meteo's local format: `2026-10-10T14:15`. */
export function localNow(utcOffset) {
  return new Date(Date.now() + utcOffset * 1000).toISOString().slice(0, 16);
}

/** Whether the sun is up at a local time, from that day's sunrise and sunset. */
function isDayAt(time, days) {
  const day = days.find((d) => d.date === time.slice(0, 10));
  return day ? time >= day.sunrise && time < day.sunset : true;
}

function hourLabel(time, language) {
  return new Intl.DateTimeFormat(language, { hour: 'numeric', timeZone: 'UTC' }).format(new Date(`${time}:00Z`));
}

function glyph(name) {
  const image = document.createElement('img');
  image.src = `./icons/${name}.svg`;
  image.alt = '';
  return image;
}

function hourItem(hour, days, text, language) {
  const item = document.createElement('li');
  const label = document.createElement('span');
  label.className = 'hour';
  label.textContent = hourLabel(hour.time, language);
  const icon = document.createElement('img');
  icon.className = 'hour-icon';
  icon.alt = '';
  icon.src = iconFor(hour.code, isDayAt(hour.time, days));
  icon.title = conditionText(hour.code, language);
  const rain = document.createElement('span');
  rain.className = 'rain';
  if (hour.rain > 20) {
    rain.textContent = `${hour.rain}%`;
    rain.title = text.rain;
  }
  const temp = document.createElement('span');
  temp.className = 'hour-temperature';
  temp.textContent = formatTemperature(hour.temperature);
  item.append(label, icon, rain, temp);
  return item;
}

function showMeta(forecast, units, age, text) {
  if (age) {
    meta.textContent = age.text;
    meta.classList.toggle('warn', age.failed);
    meta.title = '';
    return;
  }
  meta.classList.remove('warn');
  const wind = document.createElement('span');
  wind.title = text.wind;
  wind.append(glyph('wind'), `${Math.round(forecast.current.wind)} ${text.windUnits[units.wind]}`);
  const humidity = document.createElement('span');
  humidity.title = text.humidity;
  humidity.append(glyph('drop'), `${Math.round(forecast.current.humidity)}%`);
  meta.replaceChildren(wind, humidity);
}

/**
 * Shows the view.
 * - `place`: the chosen place.
 * - `forecast`, `units`: the last answer for it and the units it is in, or null.
 * - `age`: `{ text, failed }` to show instead of the wind when the data is old, or null.
 * - `state`: what to say without data: `loading` or `failed`.
 */
export function renderWeather({ place, forecast, units, age, state, text, language }) {
  section.hidden = false;
  city.textContent = place.name;
  placeButton.title = `${[place.name, place.region, place.country].filter(Boolean).join(', ')}\n${text.changePlace}`;
  retry.textContent = text.retry;

  now.hidden = hours.hidden = !forecast;
  message.hidden = !!forecast;
  if (!forecast) {
    meta.replaceChildren();
    messageText.textContent = state === 'failed' ? text.loadFailed : text.loading;
    retry.hidden = state !== 'failed';
    return;
  }

  const { current, days } = forecast;
  const at = localNow(forecast.utcOffset);
  const today = days.find((d) => d.date === at.slice(0, 10)) ?? days[0];
  showMeta(forecast, units, age, text);
  temperature.textContent = formatTemperature(current.temperature);
  conditionIcon.src = iconFor(current.code, current.isDay);
  condition.textContent = conditionText(current.code, language);
  condition.title = condition.textContent;
  feels.textContent = text.feelsLike(formatTemperature(current.feelsLike));
  highLow.textContent = today ? text.highLow(formatTemperature(today.high), formatTemperature(today.low)) : '';

  const next = forecast.hours.filter((hour) => hour.time > at).slice(0, HOURS_SHOWN);
  hours.hidden = !next.length;
  hours.classList.toggle('no-rain', !next.some((hour) => hour.rain > 20));
  hours.replaceChildren(...next.map((hour) => hourItem(hour, days, text, language)));
}

export function hideWeather() {
  section.hidden = true;
}

export function onChangePlace(listener) {
  placeButton.addEventListener('click', listener);
}

export function onRetry(listener) {
  retry.addEventListener('click', listener);
}
