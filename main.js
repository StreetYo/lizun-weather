import { activity, island, language, ready, settings, storage } from '/__sdk/index.js';
import { activityIconFor } from './conditions.js';
import { loadForecast } from './open-meteo.js';
import { closeSearch, initSearch, openSearch, render as renderSearch } from './search.js';
import { TEXTS, pickLanguage } from './texts.js';
import { formatTemperature, hideWeather, onChangePlace, onRetry, renderWeather } from './weather-view.js';

const MINUTE = 60 * 1000;
/** How often the widget looks whether the data is due; the refresh interval itself is a setting. */
const TICK = MINUTE;
/** After a failed refresh, the next try waits this long. */
const RETRY_AFTER = 2 * MINUTE;
/** Older data is still shown in the widget with its age, but not in the closed island. */
const ACTIVITY_MAX_AGE = 3 * 60 * MINUTE;

let lang = 'en';
let text = TEXTS.en;
let options;

/** @type {{ id: number, name: string, region: string, country: string, latitude: number, longitude: number } | null} */
let place = null;
/** The last answer: `{ placeId, units: { temperature, wind }, fetchedAt, forecast }`, or null. */
let cache = null;
let loading = false;
/** When the last refresh failed, 0 after a success. */
let failedAt = 0;
let searching = false;
let islandOpen = true;

function units() {
  return { temperature: options.temperature, wind: options.wind };
}

function refreshInterval() {
  return options.refresh * MINUTE;
}

/** The cached answer if it is for the chosen place (in any units), else null. */
function shown() {
  return place && cache?.placeId === place.id ? cache : null;
}

/** Whether the cache is for the chosen place in the units the settings ask for. */
function current() {
  const data = shown();
  return !!data && data.units.temperature === options.temperature && data.units.wind === options.wind;
}

async function refresh({ force = false } = {}) {
  if (!place || loading) return;
  const now = Date.now();
  if (!force) {
    if (current() && now - cache.fetchedAt < refreshInterval()) return;
    if (failedAt && now - failedAt < RETRY_AFTER) return;
  }
  const target = place;
  const wanted = units();
  loading = true;
  render();
  try {
    const forecast = await loadForecast(target, wanted);
    if (target === place) {
      cache = { placeId: target.id, units: wanted, fetchedAt: Date.now(), forecast };
      failedAt = 0;
      storage.set('forecast', cache).catch((error) => console.warn('could not keep the forecast', error));
    }
  } catch (error) {
    console.warn('could not load the weather', error);
    if (target === place) failedAt = Date.now();
  } finally {
    loading = false;
    render();
  }
  // The place or the units changed while the request was on its way.
  const unitsNow = units();
  if (place && (target !== place || wanted.temperature !== unitsNow.temperature || wanted.wind !== unitsNow.wind)) {
    refresh({ force: true });
  }
}

/**
 * Refreshes when someone can see the weather: in the open island, or in the closed one while the
 * live activity is on. Otherwise the next opening of the island refreshes.
 */
function refreshIfSeen() {
  if (islandOpen || options.showInIsland) refresh();
}

/** What the closed island shows, to skip sending the same activity again. */
let shownActivity;

function showActivity() {
  const data = shown();
  const fresh = data && Date.now() - data.fetchedAt < ACTIVITY_MAX_AGE;
  let next = null;
  if (options.showInIsland && fresh) {
    const { code, isDay, temperature } = data.forecast.current;
    next = { leading: activityIconFor(code, isDay), trailing: { text: formatTemperature(temperature) } };
    if (options.islandCity) next.title = place.name.slice(0, 100);
  }
  const key = JSON.stringify(next);
  if (key === shownActivity) return;
  shownActivity = key;
  const update = next ? activity.set(next) : activity.clear();
  update.catch((error) => console.warn('could not update the live activity', error));
}

/** The age to show instead of the wind: after a failed refresh, or when the data is overdue. */
function ageNote(data) {
  const age = Date.now() - data.fetchedAt;
  const failed = failedAt > data.fetchedAt;
  if (!failed && age < refreshInterval() + 5 * MINUTE) return null;
  return { text: text.age(Math.max(1, Math.round(age / MINUTE))), failed };
}

function render() {
  showActivity();
  if (searching || !place) {
    hideWeather();
    renderSearch();
    return;
  }
  const data = shown();
  renderWeather({
    place,
    forecast: data?.forecast ?? null,
    units: data?.units,
    age: data ? ageNote(data) : null,
    state: loading || !failedAt ? 'loading' : 'failed',
    text,
    language: lang,
  });
}

function startSearch({ focus }) {
  searching = true;
  hideWeather();
  openSearch({ focus });
}

function endSearch() {
  searching = false;
  closeSearch();
  render();
}

initSearch({
  text: () => text,
  language: () => lang,
  canCancel: () => !!place,
  onPick(next) {
    place = next;
    failedAt = 0;
    storage.set('place', next).catch((error) => console.warn('could not keep the place', error));
    endSearch();
    refresh({ force: true });
  },
  onCancel: endSearch,
});

onChangePlace(() => startSearch({ focus: true }));
onRetry(() => refresh({ force: true }));

const context = await ready();
lang = pickLanguage(context.language);
text = TEXTS[lang];
language.subscribe((next) => {
  lang = pickLanguage(next);
  text = TEXTS[lang];
  render();
});
options = context.settings;
islandOpen = context.islandOpen ?? true;
settings.subscribe((next) => {
  const unitsChanged = next.temperature !== options.temperature || next.wind !== options.wind;
  options = next;
  render();
  if (unitsChanged) refresh({ force: true });
  else refreshIfSeen();
});

try {
  place = await storage.get('place');
  cache = await storage.get('forecast');
} catch (error) {
  console.warn('could not read the stored place', error);
}
if (!place) startSearch({ focus: false });
render();
refreshIfSeen();

island.subscribe(({ open }) => {
  islandOpen = open;
  if (!open) return;
  render();
  refresh();
});

// The page keeps running while the island is closed, but timers may be throttled or the computer
// may sleep, so the data's age is checked often instead of trusting a single long timer.
setInterval(() => {
  render();
  refreshIfSeen();
}, TICK);
