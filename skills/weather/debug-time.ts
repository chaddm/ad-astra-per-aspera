#!/usr/bin/env bun

import { fetchWeatherApi } from "openmeteo";

const params = {
  latitude: 38.9822,
  longitude: -94.6708,
  hourly: ["temperature_2m"],
  timezone: "America/Chicago",
};
const url = "https://api.open-meteo.com/v1/forecast";
const responses = await fetchWeatherApi(url, params);
const response = responses[0];
const hourly = response.hourly()!;
const utcOffsetSeconds = response.utcOffsetSeconds();

const times = Array.from(
  {
    length:
      (Number(hourly.timeEnd()) - Number(hourly.time())) / hourly.interval(),
  },
  (_, i) =>
    new Date(
      (Number(hourly.time()) + i * hourly.interval() + utcOffsetSeconds) * 1000
    )
);

console.log("Current time:", new Date().toLocaleString("en-US", { timeZone: "America/Chicago" }));
console.log("\nFirst 10 hours in API data:");
for (let i = 0; i < Math.min(10, times.length); i++) {
  console.log(`Index ${i}: ${times[i].toLocaleString("en-US", { timeZone: "America/Chicago" })}`);
}