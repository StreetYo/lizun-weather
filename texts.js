/** The widget's own texts by language; the manifest translates its name and settings. */
export const TEXTS = {
  en: {
    search: 'Search for a city',
    cancel: 'Cancel',
    searching: 'Searching…',
    nothingFound: 'Nothing found',
    searchFailed: 'No connection',
    changePlace: 'Change the place',
    loading: 'Loading…',
    loadFailed: 'Could not load the weather',
    retry: 'Try again',
    feelsLike: (t) => `Feels like ${t}`,
    highLow: (high, low) => `H:${high}  L:${low}`,
    wind: 'Wind',
    humidity: 'Humidity',
    rain: 'Chance of rain',
    now: 'Now',
    age: (minutes) => (minutes < 60 ? `${minutes} min ago` : minutes < 48 * 60 ? `${Math.floor(minutes / 60)} h ago` : `${Math.floor(minutes / 1440)} d ago`),
    windUnits: { kmh: 'km/h', ms: 'm/s', mph: 'mph' },
  },
  ru: {
    search: 'Найти город',
    cancel: 'Отмена',
    searching: 'Ищем…',
    nothingFound: 'Ничего не найдено',
    searchFailed: 'Нет связи',
    changePlace: 'Сменить место',
    loading: 'Загрузка…',
    loadFailed: 'Не удалось загрузить погоду',
    retry: 'Повторить',
    feelsLike: (t) => `Ощущается как ${t}`,
    highLow: (high, low) => `Макс.:${high}  мин.:${low}`,
    wind: 'Ветер',
    humidity: 'Влажность',
    rain: 'Вероятность осадков',
    now: 'Сейчас',
    age: (minutes) => (minutes < 60 ? `${minutes} мин назад` : minutes < 48 * 60 ? `${Math.floor(minutes / 60)} ч назад` : `${Math.floor(minutes / 1440)} дн. назад`),
    windUnits: { kmh: 'км/ч', ms: 'м/с', mph: 'миль/ч' },
  },
};

/** `ru` for Russian, `en` for everything else: the languages the widget has texts in. */
export function pickLanguage(code) {
  return code?.toLowerCase().startsWith('ru') ? 'ru' : 'en';
}
