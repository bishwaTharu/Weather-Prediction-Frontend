import axios from 'axios';

// Coordinates for all Australian weather stations used by the BOM / Kaggle dataset
const LOCATION_COORDS: Record<string, { lat: number; lon: number }> = {
  Adelaide:         { lat: -34.9285, lon: 138.6007 },
  Albany:           { lat: -35.0269, lon: 117.8836 },
  Albury:           { lat: -36.0737, lon: 146.9135 },
  AliceSprings:     { lat: -23.6980, lon: 133.8807 },
  BadgerysCreek:    { lat: -33.8883, lon: 150.7258 },
  Ballarat:         { lat: -37.5622, lon: 143.8503 },
  Bendigo:          { lat: -36.7570, lon: 144.2794 },
  Brisbane:         { lat: -27.4698, lon: 153.0251 },
  Cairns:           { lat: -16.9186, lon: 145.7781 },
  Canberra:         { lat: -35.2809, lon: 149.1300 },
  Cobar:            { lat: -31.4833, lon: 145.8333 },
  CoffsHarbour:     { lat: -30.2963, lon: 153.1135 },
  Dartmoor:         { lat: -37.9208, lon: 141.2745 },
  Darwin:           { lat: -12.4634, lon: 130.8456 },
  GoldCoast:        { lat: -28.0023, lon: 153.4145 },
  Hobart:           { lat: -42.8821, lon: 147.3272 },
  Katherine:        { lat: -14.4652, lon: 132.2635 },
  Launceston:       { lat: -41.4419, lon: 147.1450 },
  Melbourne:        { lat: -37.8136, lon: 144.9631 },
  MelbourneAirport: { lat: -37.6690, lon: 144.8410 },
  Mildura:          { lat: -34.2085, lon: 142.1347 },
  Moree:            { lat: -29.4638, lon: 149.8448 },
  MountGambier:     { lat: -37.8318, lon: 140.7822 },
  MountGinini:      { lat: -35.5292, lon: 148.7725 },
  Newcastle:        { lat: -32.9283, lon: 151.7817 },
  Nhil:             { lat: -36.3333, lon: 141.6500 },
  NorahHead:        { lat: -33.2819, lon: 151.5786 },
  NorfolkIsland:    { lat: -29.0328, lon: 167.9545 },
  Nuriootpa:        { lat: -34.4694, lon: 138.9972 },
  PearceRAAF:       { lat: -31.6676, lon: 116.0155 },
  Penrith:          { lat: -33.7510, lon: 150.6942 },
  Perth:            { lat: -31.9505, lon: 115.8605 },
  PerthAirport:     { lat: -31.9403, lon: 115.9669 },
  Portland:         { lat: -38.3440, lon: 141.6040 },
  Richmond:         { lat: -33.5990, lon: 150.7490 },
  Sale:             { lat: -38.0985, lon: 147.0672 },
  SalmonGums:       { lat: -32.9833, lon: 121.6333 },
  Sydney:           { lat: -33.8688, lon: 151.2093 },
  SydneyAirport:    { lat: -33.9399, lon: 151.1753 },
  Townsville:       { lat: -19.2590, lon: 146.8170 },
  Tuggeranong:      { lat: -35.4244, lon: 149.0891 },
  Uluru:            { lat: -25.3444, lon: 131.0369 },
  WaggaWagga:       { lat: -35.1082, lon: 147.3598 },
  Walpole:          { lat: -34.9776, lon: 116.7318 },
  Watsonia:         { lat: -37.7108, lon: 145.0830 },
  Williamtown:      { lat: -32.7950, lon: 151.8420 },
  Witchcliffe:      { lat: -34.0221, lon: 115.0987 },
  Wollongong:       { lat: -34.4278, lon: 150.8931 },
  Woomera:          { lat: -31.1558, lon: 136.8063 },
};

export interface LiveWeatherData {
  MinTemp: number;
  MaxTemp: number;
  Temp9am: number;
  Temp3pm: number;
  Humidity9am: number;
  Humidity3pm: number;
  Pressure9am: number;
  Pressure3pm: number;
  WindGustSpeed: number;
  WindSpeed9am: number;
  WindSpeed3pm: number;
  Rainfall: number;
  Cloud9am: number;
  Cloud3pm: number;
  RainToday: string;
}

/**
 * Fetches today's weather for the given location using the Open-Meteo API.
 * Free, no API key required.
 */
export async function fetchLiveWeather(location: string): Promise<LiveWeatherData> {
  const coords = LOCATION_COORDS[location];
  if (!coords) throw new Error(`No coordinates found for location: ${location}`);

  const { lat, lon } = coords;

  const url = 'https://api.open-meteo.com/v1/forecast';
  const params = {
    latitude: lat,
    longitude: lon,
    daily: [
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_sum',
      'rain_sum',
      'windspeed_10m_max',
      'windgusts_10m_max',
    ].join(','),
    hourly: [
      'temperature_2m',
      'relativehumidity_2m',
      'surface_pressure',
      'cloudcover',
      'windspeed_10m',
    ].join(','),
    timezone: 'Australia/Sydney',
    forecast_days: 1,
  };

  const res = await axios.get(url, { params });
  const daily = res.data.daily;
  const hourly = res.data.hourly;

  // Helper: pick closest hourly index to a target hour
  const getHourIndex = (targetHour: number) => {
    const times: string[] = hourly.time;
    return times.findIndex((t: string) => parseInt(t.split('T')[1].split(':')[0]) >= targetHour) ?? 0;
  };

  const idx9am = getHourIndex(9);
  const idx3pm = getHourIndex(15);

  const rainfall = daily.precipitation_sum?.[0] ?? 0;

  return {
    MinTemp:     parseFloat((daily.temperature_2m_min?.[0] ?? 10).toFixed(1)),
    MaxTemp:     parseFloat((daily.temperature_2m_max?.[0] ?? 25).toFixed(1)),
    Temp9am:     parseFloat((hourly.temperature_2m?.[idx9am] ?? 15).toFixed(1)),
    Temp3pm:     parseFloat((hourly.temperature_2m?.[idx3pm] ?? 22).toFixed(1)),
    Humidity9am: Math.round(hourly.relativehumidity_2m?.[idx9am] ?? 70),
    Humidity3pm: Math.round(hourly.relativehumidity_2m?.[idx3pm] ?? 50),
    Pressure9am: parseFloat((hourly.surface_pressure?.[idx9am] ?? 1015).toFixed(1)),
    Pressure3pm: parseFloat((hourly.surface_pressure?.[idx3pm] ?? 1012).toFixed(1)),
    WindGustSpeed: parseFloat((daily.windgusts_10m_max?.[0] ?? 30).toFixed(1)),
    WindSpeed9am:  parseFloat((hourly.windspeed_10m?.[idx9am] ?? 15).toFixed(1)),
    WindSpeed3pm:  parseFloat((hourly.windspeed_10m?.[idx3pm] ?? 20).toFixed(1)),
    Rainfall:    parseFloat((rainfall).toFixed(1)),
    Cloud9am:    Math.min(8, Math.round((hourly.cloudcover?.[idx9am] ?? 30) / 12.5)),
    Cloud3pm:    Math.min(8, Math.round((hourly.cloudcover?.[idx3pm] ?? 40) / 12.5)),
    RainToday:   rainfall > 0.2 ? 'Yes' : 'No',
  };
}

export { LOCATION_COORDS };
