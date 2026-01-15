# Open-Meteo Geocoding API — Technical Reference

## Base Endpoint

```
https://geocoding-api.open-meteo.com/v1/search
```

---

## Purpose

The Geocoding API allows you to search for locations globally by:

- City name
- State/Province
- Postal/Zip code
- Administrative areas

It returns latitude, longitude, and additional metadata needed for weather API calls.

---

## Required Parameters

### Search Query

- `name` — String — **required** — The search term (city name, postal code, etc.)
  - **1 character:** Returns empty result
  - **2 characters:** Exact matching only
  - **3+ characters:** Fuzzy matching enabled

  Example: `&name=San Francisco` or `&name=94110`

---

## Optional Parameters

### Result Control

- `count` — Integer (1–100) — Number of results to return. Default: 10 Example:
  `&count=5`

- `format` — String — Response format. Valid: `json` (default), `protobuf` Example:
  `&format=json`

- `language` — String — Language code for translated results (lowercase). Default:
  `en` Example: `&language=de`

### Filtering

- `countryCode` — String — ISO-3166-1 alpha2 country code to filter results Example:
  `&countryCode=US`

### Commercial Use

- `apikey` — String — Required only for commercial use Example:
  `&apikey=your-api-key-here`

---

## Response Structure

### Success Response (JSON)

```json
{
  "results": [
    {
      "id": 5391959,
      "name": "San Francisco",
      "latitude": 37.77493,
      "longitude": -122.41942,
      "elevation": 74.0,
      "feature_code": "PPLA2",
      "country_code": "US",
      "country_id": 6252001,
      "country": "United States",
      "admin1_id": 5332921,
      "admin1": "California",
      "admin2_id": 5391997,
      "admin2": "San Francisco County",
      "admin3_id": 0,
      "admin3": "",
      "admin4_id": 0,
      "admin4": "",
      "timezone": "America/Los_Angeles",
      "population": 805235,
      "postcodes": ["94102", "94103", "94104"]
    }
  ]
}
```

### Response Fields

| Field          | Type     | Description                                      |
| -------------- | -------- | ------------------------------------------------ |
| `id`           | Integer  | Unique GeoNames location ID                      |
| `name`         | String   | Location name (localized if available)           |
| `latitude`     | Float    | WGS84 latitude                                   |
| `longitude`    | Float    | WGS84 longitude                                  |
| `elevation`    | Float    | Elevation in meters above sea level              |
| `timezone`     | String   | IANA timezone identifier                         |
| `feature_code` | String   | GeoNames feature code (location type)            |
| `country_code` | String   | ISO-3166-1 alpha2 country code                   |
| `country`      | String   | Country name (localized)                         |
| `country_id`   | Integer  | Unique country ID                                |
| `population`   | Integer  | Number of inhabitants                            |
| `postcodes`    | String[] | Array of postal codes for this location          |
| `admin1`       | String   | First-level administrative area (state/province) |
| `admin2`       | String   | Second-level administrative area (county)        |
| `admin3`       | String   | Third-level administrative area                  |
| `admin4`       | String   | Fourth-level administrative area                 |
| `admin1_id`    | Integer  | Unique ID for admin1                             |
| `admin2_id`    | Integer  | Unique ID for admin2                             |
| `admin3_id`    | Integer  | Unique ID for admin3                             |
| `admin4_id`    | Integer  | Unique ID for admin4                             |

**Note:** Empty fields may be omitted from the response.

### Error Response

```json
{
  "error": true,
  "reason": "Parameter count must be between 1 and 100."
}
```

Returns HTTP 400 status code on error.

---

## Common Feature Codes

| Code    | Description                                    |
| ------- | ---------------------------------------------- |
| `PPLC`  | Capital of a political entity                  |
| `PPLA`  | Seat of a first-order administrative division  |
| `PPLA2` | Seat of a second-order administrative division |
| `PPL`   | Populated place (city/town)                    |
| `PPLX`  | Section of populated place                     |
| `POST`  | Post office                                    |
| `AREA`  | Area                                           |

Full list: [GeoNames Feature Codes](https://www.geonames.org/export/codes.html)

---

## Example Requests

### Search by City Name

```bash
curl "https://geocoding-api.open-meteo.com/v1/search?name=Berlin&count=1"
```

### Search by Postal/Zip Code

```bash
curl "https://geocoding-api.open-meteo.com/v1/search?name=94110&countryCode=US"
```

### Search with Country Filter

```bash
curl "https://geocoding-api.open-meteo.com/v1/search?name=Paris&countryCode=FR&count=5"
```

### Search with Language Preference

```bash
curl "https://geocoding-api.open-meteo.com/v1/search?name=Munich&language=de"
```

### Multiple Results

```bash
curl "https://geocoding-api.open-meteo.com/v1/search?name=Springfield&count=10"
```

---

## Reverse Lookup by ID

### Endpoint

```
https://geocoding-api.open-meteo.com/v1/get?id={location_id}
```

### Purpose

Retrieve full location details using a unique location ID obtained from search
results.

### Example

```bash
curl "https://geocoding-api.open-meteo.com/v1/get?id=2950159"
```

Returns the same structure as search results but for a specific location ID.

---

## Usage with Weather API

### Typical Workflow

1. **Geocode the location:**

   ```bash
   GET https://geocoding-api.open-meteo.com/v1/search?name=Seattle&count=1
   ```

2. **Extract coordinates from response:**

   ```json
   {
     "results": [
       {
         "latitude": 47.60621,
         "longitude": -122.33207,
         "name": "Seattle",
         "timezone": "America/Los_Angeles"
       }
     ]
   }
   ```

3. **Use coordinates in weather API:**
   ```bash
   GET https://api.open-meteo.com/v1/forecast?latitude=47.60621&longitude=-122.33207&hourly=temperature_2m
   ```

---

## Limitations & Notes

- **Free for non-commercial use** (no API key required)
- **Commercial use requires API key** and custom subdomain
- **No street-level addresses** (city/postal code only)
- **Fuzzy matching** requires 3+ characters
- **Maximum 100 results** per request
- **Data source:** GeoNames database
- **Empty fields** are omitted from responses
- **Case-insensitive** search

---

## Attribution

- Location data based on [GeoNames](https://www.geonames.org)

---

## Additional Resources

- [Open-Meteo Geocoding API Documentation](https://open-meteo.com/en/docs/geocoding-api)
- [GeoNames Feature Codes](https://www.geonames.org/export/codes.html)
- [ISO-3166-1 Country Codes](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2)
- [IANA Timezone Database](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)
