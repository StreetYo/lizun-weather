/**
 * WMO weather codes as Open-Meteo reports them
 * (https://open-meteo.com/en/docs#weather_variable_documentation): the icon in the widget, the
 * icon in the closed island, and the text in each language.
 */

/** Icon file in `icons/` by group, for the day and for the night. */
const ICONS = {
  clear: ['sun', 'moon'],
  partly: ['partly-day', 'partly-night'],
  cloud: ['cloud', 'cloud'],
  fog: ['fog', 'fog'],
  drizzle: ['drizzle', 'drizzle'],
  rain: ['rain', 'rain'],
  snow: ['snow', 'snow'],
  thunder: ['thunder', 'thunder'],
};

/** Code: [group, English, Russian]. */
const CODES = {
  0: ['clear', 'Clear', 'Ясно'],
  1: ['partly', 'Mostly clear', 'Малооблачно'],
  2: ['partly', 'Partly cloudy', 'Переменная облачность'],
  3: ['cloud', 'Overcast', 'Пасмурно'],
  45: ['fog', 'Fog', 'Туман'],
  48: ['fog', 'Rime fog', 'Туман с изморозью'],
  51: ['drizzle', 'Light drizzle', 'Слабая морось'],
  53: ['drizzle', 'Drizzle', 'Морось'],
  55: ['drizzle', 'Heavy drizzle', 'Сильная морось'],
  56: ['drizzle', 'Freezing drizzle', 'Ледяная морось'],
  57: ['drizzle', 'Heavy freezing drizzle', 'Сильная ледяная морось'],
  61: ['rain', 'Light rain', 'Небольшой дождь'],
  63: ['rain', 'Rain', 'Дождь'],
  65: ['rain', 'Heavy rain', 'Сильный дождь'],
  66: ['rain', 'Freezing rain', 'Ледяной дождь'],
  67: ['rain', 'Heavy freezing rain', 'Сильный ледяной дождь'],
  71: ['snow', 'Light snow', 'Небольшой снег'],
  73: ['snow', 'Snow', 'Снег'],
  75: ['snow', 'Heavy snow', 'Сильный снег'],
  77: ['snow', 'Snow grains', 'Снежная крупа'],
  80: ['rain', 'Light showers', 'Небольшой ливень'],
  81: ['rain', 'Showers', 'Ливень'],
  82: ['rain', 'Heavy showers', 'Сильный ливень'],
  85: ['snow', 'Snow showers', 'Снегопад'],
  86: ['snow', 'Heavy snow showers', 'Сильный снегопад'],
  95: ['thunder', 'Thunderstorm', 'Гроза'],
  96: ['thunder', 'Thunderstorm with hail', 'Гроза с градом'],
  99: ['thunder', 'Severe thunderstorm with hail', 'Сильная гроза с градом'],
};

const UNKNOWN = ['cloud', 'Unknown', 'Нет данных'];

function entry(code) {
  return CODES[code] ?? UNKNOWN;
}

/** Path of the icon for the code, by day or by night. */
export function iconFor(code, isDay) {
  const [day, night] = ICONS[entry(code)[0]];
  return `./icons/${isDay ? day : night}.svg`;
}

/** The condition in the language, English for any language but Russian. */
export function conditionText(code, language) {
  const [, en, ru] = entry(code);
  return language === 'ru' ? ru : en;
}

/** Icon and colour for the closed island, from the island's fixed set. */
export function activityIconFor(code, isDay) {
  const group = entry(code)[0];
  if (group === 'thunder') return { icon: 'lightning', color: '#ffd60a' };
  if (group === 'clear' || code === 1) return isDay ? { icon: 'sun', color: '#ffd60a' } : { icon: 'moon', color: '#f2e7bf' };
  return { icon: 'cloud' };
}
