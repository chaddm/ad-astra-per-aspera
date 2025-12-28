---
name: weather
description: Return information about the weather for a given location.
license: MIT
compatibility: opencode
metadata:
---

## What I do

1. Run the following shell command.

```
./skill/weather/get-weather
```

2. Return the current weather information in the following format:

```
╔════════════════════════════════════════════════════════════════════════════╗
║                          WEATHER FORECAST                                  ║
╠════════════════════════════════════════════════════════════════════════════╣
║ Location: {latitude}°N, {longitude}°E                                      ║
║ Elevation: {elevation}m asl                                                ║
║ Timezone: {timezone} ({timezone_abbreviation})                             ║
╠════════════════════════════════════════════════════════════════════════════╣
║                        CURRENT CONDITIONS                                  ║
╠════════════════════════════════════════════════════════════════════════════╣
║ Time: {current_time}                                                       ║
║ Temperature: {temp}°C (Feels like: {apparent_temp}°C)                      ║
║ Humidity: {humidity}%                                                      ║
║ Dew Point: {dew_point}°C                                                   ║
║ Weather: {weather_description}                                             ║
║                                                                            ║
║ Wind: {wind_speed} km/h {wind_direction}                                   ║
║ Gusts: {wind_gusts} km/h                                                   ║
║ Pressure: {pressure} hPa                                                   ║
║ Visibility: {visibility} m                                                 ║
║                                                                            ║
║ Cloud Cover: {cloud_cover}%                                                ║
║   Low: {cloud_low}% | Mid: {cloud_mid}% | High: {cloud_high}%             ║
║                                                                            ║
║ Precipitation: {precip}mm (Probability: {precip_prob}%)                    ║
║   Rain: {rain}mm | Showers: {showers}mm | Snow: {snow}mm                  ║
║                                                                            ║
║ UV Index: {uv_index} (Clear Sky: {uv_clear})                              ║
║ Sunshine Duration: {sunshine}s                                             ║
║ Day/Night: {is_day}                                                        ║
╠════════════════════════════════════════════════════════════════════════════╣
║                          6-HOUR FORECAST                                   ║
╠════════════════════════════════════════════════════════════════════════════╣
║ Hour     | Temp | Precip | Wind   | Clouds | Conditions                   ║
║----------|------|--------|--------|--------|------------------------------║
║ {h+1}    | {t}° | {p}%   | {w} km | {c}%   | {desc}                       ║
║ {h+2}    | {t}° | {p}%   | {w} km | {c}%   | {desc}                       ║
║ {h+3}    | {t}° | {p}%   | {w} km | {c}%   | {desc}                       ║
║ {h+4}    | {t}° | {p}%   | {w} km | {c}%   | {desc}                       ║
║ {h+5}    | {t}° | {p}%   | {w} km | {c}%   | {desc}                       ║
║ {h+6}    | {t}° | {p}%   | {w} km | {c}%   | {desc}                       ║
╚════════════════════════════════════════════════════════════════════════════╝
```

**Formatting Requirements:**

Each line MUST be exactly 76 characters between the ║ characters. Use padding to ensure alignment.

**Field Formatting:**
- All numeric fields must be right-aligned within their space
- Text fields must be left-aligned within their space
- Pad with spaces to maintain exact column widths

**Current Conditions Section:**
- Each label line: "Label: value" format, pad to 76 chars total
- Format numbers consistently: 
  - Coordinates: 1 decimal place (e.g., "38.98°N")
  - Temperature: 1 decimal place (e.g., "5.7°C")
  - Percentages: whole numbers (e.g., "52%")
  - Wind: 1 decimal place (e.g., "16.3 km/h")
  - Pressure: 1 decimal place (e.g., "973.7 hPa")
  - Visibility: whole meters (e.g., "35900 m")

**6-Hour Forecast Table Column Widths:**
- Hour: 9 chars (left-aligned, e.g., "07:00 PM ")
- Temp: 5 chars (right-aligned number + "°", e.g., "  5°" or " -2°")
- Precip: 7 chars (right-aligned number + "%", e.g., "   0%" or " 100%")
- Wind: 7 chars (right-aligned number + " km", e.g., " 16 km" or "  9 km")
- Clouds: 7 chars (right-aligned number + "%", e.g., "   2%" or " 100%")
- Conditions: 29 chars (left-aligned, e.g., "Clear sky                    ")

**Weather Code Mapping:**
- 0: Clear sky
- 1-3: Partly cloudy
- 45, 48: Fog
- 51-67: Rain
- 71-77: Snow
- 80-82: Showers
- 95-99: Thunderstorm

**Additional Requirements:**
- Convert wind_direction_10m from degrees to cardinal direction (N, NE, E, SE, S, SW, W, NW)
- Format is_day as "Day" or "Night"
- Show current hour data (index 0) for current conditions
- Show next 6 hours (indices 1-6) for forecast table
- All temperatures in Celsius, distances in meters/kilometers

## When to use me

Use me to get the current weather around Overland Park, Kansas.