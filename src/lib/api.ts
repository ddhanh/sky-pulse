// OpenSky Network API utilities
// Public API - no authentication required

export interface AircraftState {
  icao24: string;
  callsign: string | null;
  origin_country: string;
  time_position: number | null;
  last_contact: number;
  longitude: number | null;
  latitude: number | null;
  baro_altitude: number | null;
  on_ground: boolean;
  velocity: number | null;
  true_track: number | null;
  vertical_rate: number | null;
  sensors: number[] | null;
  geo_altitude: number | null;
  squawk: string | null;
  spi: boolean;
  position_source: number;
  category: number;
}

export interface FlightData {
  icao24: string;
  firstSeen: number;
  estDepartureAirport: string | null;
  lastSeen: number;
  estArrivalAirport: string | null;
  callsign: string | null;
  estDepartureAirportHorizDistance: number | null;
  estDepartureAirportVertDistance: number | null;
  estArrivalAirportHorizDistance: number | null;
  estArrivalAirportVertDistance: number | null;
  departureAirportCandidatesCount: number;
  arrivalAirportCandidatesCount: number;
}

export interface WeatherData {
  temperature: number;
  windSpeed: number;
  windDirection: number;
  visibility: number;
  cloudCover: number;
  precipitation: number;
  weatherCode: number;
}

const OPENSKY_BASE = "https://opensky-network.org/api";
const OPENMETEO_BASE = "https://api.open-meteo.com/v1";

// Cache for API responses
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds

function getCached<T>(key: string): T | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T;
  }
  return null;
}

function setCache(key: string, data: unknown): void {
  cache.set(key, { data, timestamp: Date.now() });
}

export async function fetchAllStates(bounds?: {
  lamin: number;
  lamax: number;
  lomin: number;
  lomax: number;
}): Promise<AircraftState[]> {
  const cacheKey = `states-${JSON.stringify(bounds)}`;
  const cached = getCached<AircraftState[]>(cacheKey);
  if (cached) return cached;

  try {
    let url = `${OPENSKY_BASE}/states/all`;
    if (bounds) {
      url += `?lamin=${bounds.lamin}&lomin=${bounds.lomin}&lamax=${bounds.lamax}&lomax=${bounds.lomax}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`OpenSky API error: ${response.status}`);
    }

    const data = await response.json();
    const states: AircraftState[] = (data.states || []).map((s: unknown[]) => ({
      icao24: s[0] as string,
      callsign: s[1] as string | null,
      origin_country: s[2] as string,
      time_position: s[3] as number | null,
      last_contact: s[4] as number,
      longitude: s[5] as number | null,
      latitude: s[6] as number | null,
      baro_altitude: s[7] as number | null,
      on_ground: s[8] as boolean,
      velocity: s[9] as number | null,
      true_track: s[10] as number | null,
      vertical_rate: s[11] as number | null,
      sensors: s[12] as number[] | null,
      geo_altitude: s[13] as number | null,
      squawk: s[14] as string | null,
      spi: s[15] as boolean,
      position_source: s[16] as number,
      category: s[17] as number || 0,
    }));

    setCache(cacheKey, states);
    return states;
  } catch (error) {
    console.error("Failed to fetch aircraft states:", error);
    return generateMockStates();
  }
}

export async function fetchArrivals(
  icao: string,
  begin: number,
  end: number
): Promise<FlightData[]> {
  const cacheKey = `arrivals-${icao}-${begin}-${end}`;
  const cached = getCached<FlightData[]>(cacheKey);
  if (cached) return cached;

  try {
    const url = `${OPENSKY_BASE}/flights/arrival?airport=${icao}&begin=${begin}&end=${end}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`OpenSky API error: ${response.status}`);
    }

    const data: FlightData[] = await response.json();
    setCache(cacheKey, data);
    return data;
  } catch (error) {
    console.error("Failed to fetch arrivals:", error);
    return generateMockFlights(icao, "arrival");
  }
}

export async function fetchDepartures(
  icao: string,
  begin: number,
  end: number
): Promise<FlightData[]> {
  const cacheKey = `departures-${icao}-${begin}-${end}`;
  const cached = getCached<FlightData[]>(cacheKey);
  if (cached) return cached;

  try {
    const url = `${OPENSKY_BASE}/flights/departure?airport=${icao}&begin=${begin}&end=${end}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`OpenSky API error: ${response.status}`);
    }

    const data: FlightData[] = await response.json();
    setCache(cacheKey, data);
    return data;
  } catch (error) {
    console.error("Failed to fetch departures:", error);
    return generateMockFlights(icao, "departure");
  }
}

export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const cacheKey = `weather-${lat.toFixed(2)}-${lon.toFixed(2)}`;
  const cached = getCached<WeatherData>(cacheKey);
  if (cached) return cached;

  try {
    const url = `${OPENMETEO_BASE}/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,wind_direction_10m,cloud_cover,precipitation,weather_code,visibility`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Open-Meteo API error: ${response.status}`);
    }

    const data = await response.json();
    const current = data.current;
    
    const weather: WeatherData = {
      temperature: current.temperature_2m,
      windSpeed: current.wind_speed_10m,
      windDirection: current.wind_direction_10m,
      visibility: current.visibility || 10000,
      cloudCover: current.cloud_cover,
      precipitation: current.precipitation,
      weatherCode: current.weather_code,
    };

    setCache(cacheKey, weather);
    return weather;
  } catch (error) {
    console.error("Failed to fetch weather:", error);
    return generateMockWeather();
  }
}

// Mock data generators for fallback
// Major airport locations for realistic mock data
const MAJOR_AIRPORTS = [
  { icao: "KJFK", lat: 40.6413, lon: -73.7781, weight: 1.0 },
  { icao: "EGLL", lat: 51.4700, lon: -0.4543, weight: 0.95 },
  { icao: "LFPG", lat: 49.0097, lon: 2.5479, weight: 0.9 },
  { icao: "EDDF", lat: 50.0379, lon: 8.5622, weight: 0.85 },
  { icao: "EHAM", lat: 52.3105, lon: 4.7683, weight: 0.8 },
  { icao: "KLAX", lat: 33.9416, lon: -118.4085, weight: 0.95 },
  { icao: "RJTT", lat: 35.5494, lon: 139.7798, weight: 0.85 },
  { icao: "VHHH", lat: 22.3080, lon: 113.9185, weight: 0.8 },
  { icao: "WSSS", lat: 1.3644, lon: 103.9915, weight: 0.75 },
  { icao: "OMDB", lat: 25.2532, lon: 55.3657, weight: 0.8 },
  { icao: "KORD", lat: 41.9742, lon: -87.9073, weight: 0.9 },
  { icao: "KATL", lat: 33.6407, lon: -84.4277, weight: 0.95 },
  { icao: "ZBAA", lat: 40.0799, lon: 116.6031, weight: 0.85 },
  { icao: "KSFO", lat: 37.6213, lon: -122.3790, weight: 0.8 },
  { icao: "LEMD", lat: 40.4983, lon: -3.5676, weight: 0.75 },
];

function generateMockStates(): AircraftState[] {
  const states: AircraftState[] = [];
  const airlines = ["AAL", "UAL", "DAL", "SWA", "BAW", "DLH", "AFR", "KLM", "JAL", "ANA", "CPA", "SIA", "QFA", "EK"];
  
  // Generate aircraft near each major airport
  for (const airport of MAJOR_AIRPORTS) {
    // Number of aircraft near this airport varies by weight (traffic volume)
    const numAircraft = Math.floor(8 + Math.random() * 25 * airport.weight);
    
    for (let i = 0; i < numAircraft; i++) {
      // Random position within ~80km of airport
      const angle = Math.random() * 2 * Math.PI;
      const distance = Math.random() * 0.7; // ~0.7 degrees ≈ ~70-80km
      const lat = airport.lat + Math.sin(angle) * distance;
      const lon = airport.lon + Math.cos(angle) * distance;
      
      // Determine flight state
      const rand = Math.random();
      const onGround = rand < 0.15;
      const isHolding = !onGround && rand < 0.25; // Some aircraft in holding patterns
      const isApproaching = !onGround && !isHolding && rand < 0.5;
      
      let altitude: number;
      let velocity: number;
      let verticalRate: number;
      
      if (onGround) {
        altitude = 0;
        velocity = Math.random() * 30;
        verticalRate = 0;
      } else if (isHolding) {
        // Holding pattern: low altitude, slow speed
        altitude = Math.random() * 1500 + 1000; // 1000-2500m
        velocity = Math.random() * 50 + 80; // 80-130 m/s
        verticalRate = (Math.random() - 0.5) * 3;
      } else if (isApproaching) {
        // Approaching: descending
        altitude = Math.random() * 3000 + 500;
        velocity = Math.random() * 80 + 100;
        verticalRate = -(Math.random() * 8 + 2);
      } else {
        // Departing or cruising nearby
        altitude = Math.random() * 8000 + 3000;
        velocity = Math.random() * 150 + 150;
        verticalRate = Math.random() * 10;
      }
      
      states.push({
        icao24: Math.random().toString(16).substr(2, 6),
        callsign: `${airlines[Math.floor(Math.random() * airlines.length)]}${Math.floor(Math.random() * 9000 + 1000)}`,
        origin_country: ["United States", "United Kingdom", "Germany", "France", "Japan", "China", "UAE", "Singapore"][Math.floor(Math.random() * 8)],
        time_position: Date.now() / 1000,
        last_contact: Date.now() / 1000,
        longitude: lon,
        latitude: lat,
        baro_altitude: altitude,
        on_ground: onGround,
        velocity: velocity,
        true_track: Math.random() * 360,
        vertical_rate: verticalRate,
        sensors: null,
        geo_altitude: altitude,
        squawk: Math.floor(Math.random() * 7777).toString().padStart(4, "0"),
        spi: false,
        position_source: 0,
        category: Math.floor(Math.random() * 4),
      });
    }
  }
  
  return states;
}

function generateMockFlights(icao: string, type: "arrival" | "departure"): FlightData[] {
  const flights: FlightData[] = [];
  const airports = ["KJFK", "EGLL", "LFPG", "EDDF", "EHAM", "KLAX", "RJTT", "VHHH"];
  
  for (let i = 0; i < 20; i++) {
    const now = Date.now() / 1000;
    const flightDuration = Math.random() * 10 * 3600 + 3600; // 1-11 hours
    
    flights.push({
      icao24: Math.random().toString(16).substr(2, 6),
      firstSeen: now - flightDuration - Math.random() * 7200,
      estDepartureAirport: type === "arrival" ? airports[Math.floor(Math.random() * airports.length)] : icao,
      lastSeen: now - Math.random() * 7200,
      estArrivalAirport: type === "arrival" ? icao : airports[Math.floor(Math.random() * airports.length)],
      callsign: `FL${Math.floor(Math.random() * 9000 + 1000)}`,
      estDepartureAirportHorizDistance: Math.random() * 5000,
      estDepartureAirportVertDistance: Math.random() * 500,
      estArrivalAirportHorizDistance: Math.random() * 5000,
      estArrivalAirportVertDistance: Math.random() * 500,
      departureAirportCandidatesCount: 1,
      arrivalAirportCandidatesCount: 1,
    });
  }
  
  return flights.sort((a, b) => b.lastSeen - a.lastSeen);
}

function generateMockWeather(): WeatherData {
  return {
    temperature: Math.random() * 30 + 5,
    windSpeed: Math.random() * 30,
    windDirection: Math.random() * 360,
    visibility: Math.random() * 9000 + 1000,
    cloudCover: Math.random() * 100,
    precipitation: Math.random() < 0.3 ? Math.random() * 5 : 0,
    weatherCode: [0, 1, 2, 3, 45, 61, 63, 80][Math.floor(Math.random() * 8)],
  };
}

// Utility functions
export function getFlightPhase(altitude: number | null, velocity: number | null, verticalRate: number | null, onGround: boolean): string {
  if (onGround) {
    if (velocity && velocity > 5) return "Taxiing";
    return "Parked";
  }
  
  if (!altitude || !velocity) return "Unknown";
  
  if (altitude < 1000) {
    if (verticalRate && verticalRate > 2) return "Taking Off";
    if (verticalRate && verticalRate < -2) return "Landing";
    return "Low Altitude";
  }
  
  if (altitude < 3000) {
    if (verticalRate && verticalRate > 5) return "Climbing";
    if (verticalRate && verticalRate < -5) return "Descending";
    return "Approach";
  }
  
  if (altitude > 9000 && Math.abs(verticalRate || 0) < 3) {
    return "Cruising";
  }
  
  if (verticalRate && verticalRate > 3) return "Climbing";
  if (verticalRate && verticalRate < -3) return "Descending";
  
  return "En Route";
}

export function getWeatherDescription(code: number): string {
  const descriptions: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Thunderstorm with heavy hail",
  };
  
  return descriptions[code] || "Unknown";
}

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
