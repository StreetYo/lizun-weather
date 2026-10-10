# Weather for Lizun

The weather at a place you pick, in the [Lizun](https://github.com/StreetYo/Lizun) island: the
temperature now, the sky, how warm it feels, today's high and low, wind, humidity and the next six
hours with the chance of rain. The data comes from [Open-Meteo](https://open-meteo.com), which
needs no account or key.

## Install

In Lizun, open Settings > Widgets > Add a widget, paste this link and press Install:

```
https://github.com/StreetYo/lizun-weather
```

To install a fixed version, use the link of a release instead, for example
`https://github.com/StreetYo/lizun-weather/releases/tag/v1.0.0`.

The widget needs a Lizun build with `network.request` and `island` in its SDK (see
[Writing a Lizun widget](https://github.com/StreetYo/Lizun/blob/master/docs/widgets.md#network)).

## Using it

- The first time, type a city in the field and click it in the list (up to five matches, with
  the region and the country). Enter picks the first one; the arrow keys move through the list.
- To pick another place later, click the city name at the top of the widget. The × or Esc goes
  back without changing it.
- The weather refreshes every 30 minutes (a setting, 10–120), and when you open the island
  after that time has passed. With the island closed and its weather turned off, nothing is
  loaded until you open the island again.
- The last answer is kept, so the widget shows it right away when Lizun starts. When a refresh
  fails, for example offline, the widget keeps showing it with its age in orange at the top.
- In the closed island the widget shows an icon for the sky (sun, moon, cloud or lightning) and
  the temperature, optionally with the city name. Data older than three hours is not shown
  there.

Settings (Settings > Widgets > Weather):

| Setting | Values |
|---|---|
| Temperature | Celsius, Fahrenheit |
| Wind speed | km/h, m/s, mph |
| Refresh every | 10–120 minutes, 30 by default |
| Show the weather in the closed island | On by default |
| Show the city in the closed island | Off by default |

## Permissions

| Permission | Why |
|---|---|
| `storage` | Keeps the place you picked and the last forecast. They stay on this computer, in Lizun's own storage. |
| `activity` | Shows the sky and the temperature in the closed island. |
| Network `https://api.open-meteo.com` | The forecast for the place's coordinates. |
| Network `https://geocoding-api.open-meteo.com` | The city search. What you type is sent there. |

Nothing else is sent anywhere.

## Development

The widget is plain HTML, CSS and JavaScript with no build step:

| File | What it is |
|---|---|
| `manifest.json` | Id, size, permissions, network, settings and their Russian translation |
| `index.html`, `style.css` | Page shown in the island, built on the island theme (`--lz-*` variables) |
| `main.js` | State: the place, the cached forecast, refreshing, the live activity |
| `open-meteo.js` | Requests to Open-Meteo's forecast and geocoding APIs |
| `search.js` | The place search |
| `weather-view.js` | The main view |
| `conditions.js` | WMO weather codes: icons and texts in English and Russian |
| `texts.js` | The widget's other texts in English and Russian |
| `icons/` | Weather and interface icons as SVG |

To try changes, choose this folder in Settings > Widgets > Add a widget, or copy it to
`%APPDATA%\app.lizun.desktop\widgets\lizun.weather\` and press Reload. How widgets work:
[Writing a Lizun widget](https://github.com/StreetYo/Lizun/blob/master/docs/widgets.md).

To release a version, raise `version` in `manifest.json`, then tag and publish a GitHub release
(`v1.0.1`).

Weather data by [Open-Meteo.com](https://open-meteo.com/), under
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
