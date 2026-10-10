/** The place search: a field, up to five matches from Open-Meteo, a click picks one. */
import { keyboard } from '/__sdk/index.js';
import { searchPlaces } from './open-meteo.js';

/** How long typing has to pause before the search is sent. */
const SEARCH_DELAY = 300;

const section = document.getElementById('search');
const input = document.getElementById('query');
const cancel = document.getElementById('cancel');
const list = document.getElementById('results');
const note = document.getElementById('search-note');

/** @type {{ text: () => object, language: () => string, canCancel: () => boolean, onPick: (place) => void, onCancel: () => void }} */
let hooks;
let timer;
/** Number of the latest search, so an older answer that comes late is dropped. */
let latest = 0;
let found = [];
/** '', 'searching', 'nothing' or 'failed'. */
let status = '';
/** Match chosen with the arrow keys, -1 for none. */
let active = -1;

async function run() {
  clearTimeout(timer);
  timer = undefined;
  const query = input.value.trim();
  const id = ++latest;
  if (query.length < 2) {
    found = [];
    status = '';
    render();
    return;
  }
  status = 'searching';
  render();
  try {
    const places = await searchPlaces(query, hooks.language());
    if (id !== latest) return;
    found = places;
    status = places.length ? '' : 'nothing';
  } catch (error) {
    if (id !== latest) return;
    console.warn('place search failed', error);
    found = [];
    status = 'failed';
  }
  active = -1;
  render();
}

function pick(place) {
  keyboard.release();
  hooks.onPick({
    id: place.id,
    name: place.name,
    region: place.region,
    country: place.country,
    latitude: place.latitude,
    longitude: place.longitude,
  });
}

function row(place, index) {
  const item = document.createElement('li');
  const button = document.createElement('button');
  button.className = index === active ? 'result active' : 'result';
  const name = document.createElement('span');
  name.className = 'name';
  name.textContent = place.name;
  const where = document.createElement('span');
  where.className = 'where';
  where.textContent = [place.region, place.country].filter(Boolean).join(', ');
  button.title = [place.name, where.textContent].filter(Boolean).join(', ');
  button.append(name, where);
  button.addEventListener('click', () => pick(place));
  item.append(button);
  return item;
}

export function render() {
  const text = hooks.text();
  input.placeholder = text.search;
  cancel.title = text.cancel;
  cancel.hidden = !hooks.canCancel();
  list.replaceChildren(...found.map(row));
  const message = { searching: found.length ? '' : text.searching, nothing: text.nothingFound, failed: text.searchFailed }[status];
  note.textContent = message ?? '';
  note.hidden = !message;
}

/** Shows the search; `focus` puts the cursor in the field (only from a click on the widget). */
export function openSearch({ focus = false } = {}) {
  section.hidden = false;
  input.value = '';
  found = [];
  status = '';
  active = -1;
  latest++;
  render();
  if (focus) input.focus();
}

export function closeSearch() {
  clearTimeout(timer);
  timer = undefined;
  latest++;
  section.hidden = true;
}

export function initSearch(options) {
  hooks = options;

  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(run, SEARCH_DELAY);
  });

  input.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!found.length) return;
      const step = event.key === 'ArrowDown' ? 1 : -1;
      active = (active + step + found.length) % found.length;
      render();
    } else if (event.key === 'Enter') {
      if (timer === undefined && found.length) pick(found[Math.max(active, 0)]);
      else run();
    } else if (event.key === 'Escape' && hooks.canCancel()) {
      hooks.onCancel();
    }
  });

  cancel.addEventListener('click', () => hooks.onCancel());
}
