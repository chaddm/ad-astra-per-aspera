# Open-Meteo Weather Forecast API — Technical Reference

## Base Endpoint

```
https://api.open-meteo.com/v1/forecast
```

---

## Required Core Parameters

### Location

- `latitude` — Floating point — **required** WGS84 latitude of the target location.
  Example: `&latitude=52.52` ([Open Meteo][1])

- `longitude` — Floating point — **required** WGS84 longitude of the target location.
  Example: `&longitude=13.41` ([Open Meteo][1])

---

## Optional Request Parameters

### Time & Range

- `forecast_days` — Integer (0–16) Number of forecast days to return. Default: 7
  days. Example: `&forecast_days=10` ([Open Meteo][1])

- `past_days` — Integer (0–92) Include past days of forecast data in the response.
  Default: 0. Example: `&past_days=3` ([Open Meteo][1])

- `start_date` — String (`YYYY-MM-DD`) Start date of returned data time range
  (inclusive). Example: `&start_date=2025-01-01` ([Open Meteo][1])

- `end_date` — String (`YYYY-MM-DD`) End date of returned data time range
  (inclusive). Example: `&end_date=2025-01-07` ([Open Meteo][1])

- `timezone` — String Time zone for returned timestamps (e.g., `Europe/Berlin`,
  `auto`). Default: GMT+0 if not set. Example: `&timezone=America/Toronto` ([Open
  Meteo][1])

### Units

- `temperature_unit` — String Valid: `celsius`, `fahrenheit`. Default: `celsius`.
  Example: `&temperature_unit=fahrenheit` ([Open Meteo][1])

- `wind_speed_unit` — String Valid: `kmh`, `ms`, `mph`, `kn`. Default: `kmh`.
  Example: `&wind_speed_unit=ms` ([Open Meteo][1])

- `precipitation_unit` — String Valid: `mm`, `inch`. Default: `mm`. Example:
  `&precipitation_unit=inch` ([Open Meteo][1])

- `timeformat` — String Valid: `iso8601`, `unixtime`. Default: `iso8601`. Example:
  `&timeformat=unixtime` Note: If `unixtime` is selected all time values are returned
  in UNIX seconds and then in GMT+0. ([Open Meteo][1])

### Elevation & Selection

- `elevation` — Floating point Elevation used for statistical downscaling. Default:
  uses a 90 m digital elevation model. Special: `&elevation=nan` disables downscaling
  and uses average grid-cell height. ([Open Meteo][1])

- `cell_selection` — String Preferences for grid cell selection.
  - `land` — default, selects a land grid cell.
  - `sea` — prefers sea grid cells.
  - `nearest` — returns the nearest grid cell. ([Open Meteo][1])

---

## Weather Data Variable Parameters

### Hourly Variables (`&hourly=`)

Provide a comma-separated list of weather variables you want returned on an hourly
basis. ([Open Meteo][1])

- `temperature_2m`
- `relative_humidity_2m`
- `dewpoint_2m`
- `apparent_temperature`
- `precipitation_probability`
- `precipitation`
- `rain`
- `showers`
- `snowfall`
- `snow_depth`
- `weathercode`
- `pressure_msl`
- `surface_pressure`
- `cloudcover_total`
- `cloudcover_low`
- `cloudcover_mid`
- `cloudcover_high`
- `visibility`
- `evapotranspiration`
- `reference_evapotranspiration`
- `vapour_pressure_deficit`
- `wind_speed_10m`
- `wind_direction_10m`
- `wind_gusts_10m` ([Open Meteo][1])

Example:

```
&hourly=temperature_2m,precipitation,weathercode
```

---

### Daily Variables (`&daily=`)

Provide a comma-separated list of daily aggregated variables. ([Open Meteo][1])

- `weathercode`
- `temperature_2m_max`
- `temperature_2m_min`
- `apparent_temperature_max`
- `apparent_temperature_min`
- `precipitation_sum`
- `rain_sum`
- `showers_sum`
- `snowfall_sum`
- `precipitation_hours`
- `sunrise`
- `sunset`
- `sunshine_duration`
- `winddirection_10m_dominant`
- `shortwave_radiation_sum`
- `et0_fao_evapotranspiration` ([Open Meteo][1])

Example:

```
&daily=temperature_2m_max,precipitation_sum
```

---

### Current Weather (`&current_weather=`)

Include this flag to request current weather summary fields. Use as boolean:

```
&current_weather=true
```

Returned fields include:

- Temperature 2 m
- Relative Humidity 2 m
- Apparent Temperature
- Is Day or Night
- Precipitation
- Rain
- Showers
- Snowfall
- Weather code
- Cloud cover total
- Sea level pressure
- Surface pressure
- Wind speed at 10 m
- Wind direction at 10 m
- Wind gusts at 10 m ([Open Meteo][1])

---

## WMO Weather Interpretation Codes

When you request any variable that returns a `weathercode`, the following **WMO
weather interpretation codes** apply: ([Open Meteo][1])

```
0         — Clear sky
1,2,3     — Mainly clear, partly cloudy, and overcast
45,48     — Fog and depositing rime fog
51,53,55  — Drizzle: Light, moderate, and dense intensity
56,57     — Freezing Drizzle: Light and dense intensity
61,63,65  — Rain: Slight, moderate, and heavy intensity
66,67     — Freezing Rain: Light and heavy intensity
71,73,75  — Snow fall: Slight, moderate, and heavy intensity
77        — Snow grains
80,81,82  — Rain showers: Slight, moderate, and violent
85,86     — Snow showers slight and heavy
95 *      — Thunderstorm: Slight or moderate
96,99 *   — Thunderstorm with slight and heavy hail

(*) Thunderstorm forecast with hail is only available in Central Europe
```

---

## Response Object Structure

When the API call succeeds, the server returns JSON with the following fields: ([Open
Meteo][1])

### Top-Level

- `latitude` — Returned latitude of the forecast grid cell
- `longitude` — Returned longitude of the forecast grid cell
- `generationtime_ms` — Time taken to generate the forecast
- `utc_offset_seconds` — Timezone offset applied
- `timezone` — Timezone string used
- `timezone_abbreviation` — Timezone abbreviation
- `elevation` — Elevation used for statistical downscaling

### Data Containers

- `hourly` — Object containing arrays of hourly data for each requested hourly
  variable
- `hourly_units` — Object containing unit labels for each hourly variable
- `daily` — Object containing arrays of daily data for each requested daily variable
  (if requested)
- `daily_units` — Object containing unit labels for daily variables
- `current_weather` — Object with current weather fields (if requested)

Each time series aligns index-wise with a corresponding `time` array within `hourly`
or `daily`.

---

## Example Request

```bash
curl "https://api.open-meteo.com/v1/forecast?
 latitude=43.65
 &longitude=-79.38
 &hourly=temperature_2m,precipitation_probability,weathercode
 &daily=temperature_2m_max,temperature_2m_min
 &current_weather=true
 &timezone=America/Toronto"
```

This request returns hourly temperature, precipitation probability, and weather
codes; daily min/max temperatures; and a current weather snapshot for the specified
coordinates. ([Open Meteo][1])

---

## Known Constraints & Notes

- Multiple coordinates can be specified by comma-separating values in the `latitude`
  and `longitude` parameters; JSON output becomes a list structure per location.
  ([Open Meteo][1])
- For UNIX timestamp (`timeformat=unixtime`), returned time is in GMT+0 and requires
  adding `utc_offset_seconds` to convert to local times for daily values. ([Open
  Meteo][1])
- The API has no mandatory API key for non-commercial use. Some commercial endpoints
  require an API key on a customer subdomain. ([Open Meteo][1])

---

If you want **language-specific code snippets** for Python, JavaScript, or Rust, or a
**JSON schema** for automated validation, I can provide those next.

[1]: https://open-meteo.com/en/docs?utm_source=chatgpt.com "🌦️ Docs |

## Response Output Specification

---

## High-Level Response Shape

The API returns a **single JSON object** per request.

```text
Response
├── metadata fields
├── unit definition objects
├── data containers (hourly / daily / current_weather)
```

All data containers are **columnar arrays**, not row objects.

---

## Top-Level Fields (Always Present)

```json
{
  "latitude": number,
  "longitude": number,
  "generationtime_ms": number,
  "utc_offset_seconds": number,
  "timezone": string,
  "timezone_abbreviation": string,
  "elevation": number,
  ...
}
```

### Field Semantics

| Field                   | Type    | Meaning                                          |
| ----------------------- | ------- | ------------------------------------------------ |
| `latitude`              | float   | Latitude of the grid cell used for the forecast  |
| `longitude`             | float   | Longitude of the grid cell used for the forecast |
| `generationtime_ms`     | float   | Server-side computation time                     |
| `utc_offset_seconds`    | integer | Offset applied to timestamps                     |
| `timezone`              | string  | Timezone used for formatting times               |
| `timezone_abbreviation` | string  | Human-readable abbreviation                      |
| `elevation`             | float   | Elevation (meters) used for downscaling          |

---

## Units Objects

Units objects describe **how to interpret numeric arrays**.

### Hourly Units

```json
"hourly_units": {
  "time": "iso8601",
  "temperature_2m": "°C",
  "precipitation": "mm",
  "weathercode": "wmo code",
  "wind_speed_10m": "km/h"
}
```

### Daily Units

```json
"daily_units": {
  "time": "iso8601",
  "temperature_2m_max": "°C",
  "sunrise": "iso8601",
  "sunset": "iso8601"
}
```

### Parsing Rules

- Keys correspond **exactly** to requested variables
- Values are **string labels**, not enums
- Presence is conditional on requesting the associated data container

---

## Hourly Data Container

```json
"hourly": {
  "time": string[],
  "<variable_1>": number[],
  "<variable_2>": number[],
  ...
}
```

### Invariants

- `time` array **always exists**
- All arrays in `hourly`:
  - Have **identical length**
  - Are **index-aligned**

- Index `i` across all arrays represents the same instant

### Example

```json
"hourly": {
  "time": [
    "2026-01-01T00:00",
    "2026-01-01T01:00"
  ],
  "temperature_2m": [2.1, 1.8],
  "precipitation": [0.0, 0.2],
  "weathercode": [3, 61]
}
```

---

## Daily Data Container

```json
"daily": {
  "time": string[],
  "<daily_variable_1>": number[] | string[],
  ...
}
```

### Notes

- Daily variables may be:
  - numeric arrays (temperatures, precipitation)
  - string arrays (sunrise/sunset timestamps)

- All arrays align index-wise with `time`

---

## Current Weather Object

Included **only if** `current_weather=true`.

```json
"current_weather": {
  "time": string,
  "interval": number,
  "temperature": number,
  "windspeed": number,
  "winddirection": number,
  "weathercode": number,
  "is_day": number
}
```

### Field Notes

| Field         | Meaning                 |
| ------------- | ----------------------- |
| `interval`    | Seconds between updates |
| `is_day`      | `1` = day, `0` = night  |
| `weathercode` | WMO interpretation code |

---

## Time Semantics

### `timeformat=iso8601` (default)

- Times are strings
- Local timezone already applied

### `timeformat=unixtime`

- Times are integers (seconds)
- Always in UTC
- Apply `utc_offset_seconds` manually

---

## Alignment & Parsing Contract (Critical)

For **any container** (`hourly`, `daily`):

```text
len(time) == len(any other variable array)
```

You must **never** treat values as independent rows.

Correct parsing pattern:

```pseudo
for i in range(len(hourly.time)):
    timestamp = hourly.time[i]
    temp = hourly.temperature_2m[i]
    rain = hourly.precipitation[i]
```

---

## Example Full Response (Condensed but Complete)

```json
{
  "latitude": 43.65,
  "longitude": -79.38,
  "generationtime_ms": 1.21,
  "utc_offset_seconds": -18000,
  "timezone": "America/Toronto",
  "timezone_abbreviation": "EST",
  "elevation": 112.0,

  "hourly_units": {
    "time": "iso8601",
    "temperature_2m": "°C",
    "precipitation": "mm",
    "weathercode": "wmo code"
  },

  "hourly": {
    "time": ["2026-01-01T00:00", "2026-01-01T01:00", "2026-01-01T02:00"],
    "temperature_2m": [1.2, 0.9, 0.4],
    "precipitation": [0.0, 0.0, 0.3],
    "weathercode": [3, 3, 61]
  },

  "daily_units": {
    "time": "iso8601",
    "temperature_2m_max": "°C",
    "temperature_2m_min": "°C",
    "sunrise": "iso8601",
    "sunset": "iso8601"
  },

  "daily": {
    "time": ["2026-01-01"],
    "temperature_2m_max": [4.1],
    "temperature_2m_min": [-1.3],
    "sunrise": ["2026-01-01T07:51"],
    "sunset": ["2026-01-01T16:49"]
  },

  "current_weather": {
    "time": "2026-01-01T00:00",
    "interval": 900,
    "temperature": 1.2,
    "windspeed": 14.3,
    "winddirection": 270,
    "weathercode": 3,
    "is_day": 0
  }
}
```

---

## Parser Implementation Checklist

✔ Handle columnar arrays (not row objects) ✔ Use `*_units` to label outputs
dynamically ✔ Align arrays strictly by index ✔ Treat `current_weather` as optional ✔
Interpret `weathercode` via WMO legend ✔ Apply `utc_offset_seconds` only for
`unixtime`

---
