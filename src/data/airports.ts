export interface Airport {
  icao: string;
  iata: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
  elevation: number;
  timezone: string;
  runways: Runway[];
}

export interface Runway {
  id: string;
  length: number;
  width: number;
  surface: string;
  heading: number;
}

export const airports: Airport[] = [
  {
    icao: "KJFK",
    iata: "JFK",
    name: "John F. Kennedy International Airport",
    city: "New York",
    country: "United States",
    lat: 40.6413,
    lon: -73.7781,
    elevation: 13,
    timezone: "America/New_York",
    runways: [
      { id: "04L/22R", length: 3460, width: 46, surface: "Asphalt", heading: 40 },
      { id: "04R/22L", length: 2560, width: 61, surface: "Asphalt", heading: 40 },
      { id: "13L/31R", length: 3048, width: 46, surface: "Asphalt", heading: 130 },
      { id: "13R/31L", length: 4423, width: 61, surface: "Asphalt", heading: 130 },
    ],
  },
  {
    icao: "EGLL",
    iata: "LHR",
    name: "London Heathrow Airport",
    city: "London",
    country: "United Kingdom",
    lat: 51.4700,
    lon: -0.4543,
    elevation: 25,
    timezone: "Europe/London",
    runways: [
      { id: "09L/27R", length: 3902, width: 50, surface: "Asphalt", heading: 90 },
      { id: "09R/27L", length: 3660, width: 45, surface: "Asphalt", heading: 90 },
    ],
  },
  {
    icao: "LFPG",
    iata: "CDG",
    name: "Paris Charles de Gaulle Airport",
    city: "Paris",
    country: "France",
    lat: 49.0097,
    lon: 2.5479,
    elevation: 119,
    timezone: "Europe/Paris",
    runways: [
      { id: "08L/26R", length: 4200, width: 45, surface: "Asphalt", heading: 80 },
      { id: "08R/26L", length: 2700, width: 60, surface: "Asphalt", heading: 80 },
      { id: "09L/27R", length: 4200, width: 45, surface: "Asphalt", heading: 90 },
      { id: "09R/27L", length: 2700, width: 60, surface: "Asphalt", heading: 90 },
    ],
  },
  {
    icao: "EDDF",
    iata: "FRA",
    name: "Frankfurt Airport",
    city: "Frankfurt",
    country: "Germany",
    lat: 50.0379,
    lon: 8.5622,
    elevation: 111,
    timezone: "Europe/Berlin",
    runways: [
      { id: "07L/25R", length: 4000, width: 45, surface: "Concrete", heading: 70 },
      { id: "07R/25L", length: 4000, width: 60, surface: "Concrete", heading: 70 },
      { id: "18/36", length: 4000, width: 45, surface: "Concrete", heading: 180 },
      { id: "07C/25C", length: 2800, width: 45, surface: "Concrete", heading: 70 },
    ],
  },
  {
    icao: "EHAM",
    iata: "AMS",
    name: "Amsterdam Schiphol Airport",
    city: "Amsterdam",
    country: "Netherlands",
    lat: 52.3086,
    lon: 4.7639,
    elevation: -3,
    timezone: "Europe/Amsterdam",
    runways: [
      { id: "04/22", length: 2014, width: 45, surface: "Asphalt", heading: 40 },
      { id: "06/24", length: 3500, width: 45, surface: "Asphalt", heading: 60 },
      { id: "09/27", length: 3453, width: 45, surface: "Asphalt", heading: 90 },
      { id: "18C/36C", length: 3300, width: 45, surface: "Asphalt", heading: 180 },
      { id: "18L/36R", length: 3400, width: 45, surface: "Asphalt", heading: 180 },
      { id: "18R/36L", length: 3800, width: 60, surface: "Asphalt", heading: 180 },
    ],
  },
  {
    icao: "KLAX",
    iata: "LAX",
    name: "Los Angeles International Airport",
    city: "Los Angeles",
    country: "United States",
    lat: 33.9425,
    lon: -118.4081,
    elevation: 38,
    timezone: "America/Los_Angeles",
    runways: [
      { id: "06L/24R", length: 2721, width: 46, surface: "Asphalt", heading: 60 },
      { id: "06R/24L", length: 3135, width: 46, surface: "Asphalt", heading: 60 },
      { id: "07L/25R", length: 3382, width: 46, surface: "Asphalt", heading: 70 },
      { id: "07R/25L", length: 3685, width: 61, surface: "Asphalt", heading: 70 },
    ],
  },
  {
    icao: "RJTT",
    iata: "HND",
    name: "Tokyo Haneda Airport",
    city: "Tokyo",
    country: "Japan",
    lat: 35.5494,
    lon: 139.7798,
    elevation: 6,
    timezone: "Asia/Tokyo",
    runways: [
      { id: "04/22", length: 2500, width: 60, surface: "Asphalt", heading: 40 },
      { id: "05/23", length: 2500, width: 60, surface: "Asphalt", heading: 50 },
      { id: "16L/34R", length: 3360, width: 60, surface: "Asphalt", heading: 160 },
      { id: "16R/34L", length: 3000, width: 60, surface: "Asphalt", heading: 160 },
    ],
  },
  {
    icao: "VHHH",
    iata: "HKG",
    name: "Hong Kong International Airport",
    city: "Hong Kong",
    country: "Hong Kong",
    lat: 22.3080,
    lon: 113.9185,
    elevation: 9,
    timezone: "Asia/Hong_Kong",
    runways: [
      { id: "07L/25R", length: 3800, width: 60, surface: "Asphalt", heading: 70 },
      { id: "07R/25L", length: 3800, width: 60, surface: "Asphalt", heading: 70 },
    ],
  },
  {
    icao: "WSSS",
    iata: "SIN",
    name: "Singapore Changi Airport",
    city: "Singapore",
    country: "Singapore",
    lat: 1.3644,
    lon: 103.9915,
    elevation: 7,
    timezone: "Asia/Singapore",
    runways: [
      { id: "02L/20R", length: 4000, width: 60, surface: "Asphalt", heading: 20 },
      { id: "02C/20C", length: 4000, width: 60, surface: "Asphalt", heading: 20 },
      { id: "02R/20L", length: 2750, width: 60, surface: "Asphalt", heading: 20 },
    ],
  },
  {
    icao: "OMDB",
    iata: "DXB",
    name: "Dubai International Airport",
    city: "Dubai",
    country: "United Arab Emirates",
    lat: 25.2532,
    lon: 55.3657,
    elevation: 19,
    timezone: "Asia/Dubai",
    runways: [
      { id: "12L/30R", length: 4000, width: 60, surface: "Asphalt", heading: 120 },
      { id: "12R/30L", length: 4447, width: 60, surface: "Asphalt", heading: 120 },
    ],
  },
  {
    icao: "KATL",
    iata: "ATL",
    name: "Hartsfield-Jackson Atlanta International Airport",
    city: "Atlanta",
    country: "United States",
    lat: 33.6407,
    lon: -84.4277,
    elevation: 313,
    timezone: "America/New_York",
    runways: [
      { id: "08L/26R", length: 2743, width: 46, surface: "Concrete", heading: 80 },
      { id: "08R/26L", length: 2743, width: 46, surface: "Concrete", heading: 80 },
      { id: "09L/27R", length: 3624, width: 46, surface: "Concrete", heading: 90 },
      { id: "09R/27L", length: 2743, width: 46, surface: "Concrete", heading: 90 },
      { id: "10/28", length: 2743, width: 46, surface: "Concrete", heading: 100 },
    ],
  },
  {
    icao: "KORD",
    iata: "ORD",
    name: "O'Hare International Airport",
    city: "Chicago",
    country: "United States",
    lat: 41.9742,
    lon: -87.9073,
    elevation: 201,
    timezone: "America/Chicago",
    runways: [
      { id: "04L/22R", length: 2286, width: 46, surface: "Asphalt", heading: 40 },
      { id: "04R/22L", length: 2461, width: 46, surface: "Asphalt", heading: 40 },
      { id: "09L/27R", length: 2286, width: 61, surface: "Concrete", heading: 90 },
      { id: "09R/27L", length: 2439, width: 46, surface: "Concrete", heading: 90 },
      { id: "10L/28R", length: 3962, width: 61, surface: "Concrete", heading: 100 },
      { id: "10C/28C", length: 3292, width: 61, surface: "Concrete", heading: 100 },
      { id: "10R/28L", length: 2286, width: 46, surface: "Concrete", heading: 100 },
    ],
  },
  {
    icao: "ZBAA",
    iata: "PEK",
    name: "Beijing Capital International Airport",
    city: "Beijing",
    country: "China",
    lat: 40.0799,
    lon: 116.6031,
    elevation: 35,
    timezone: "Asia/Shanghai",
    runways: [
      { id: "01/19", length: 3800, width: 60, surface: "Concrete", heading: 10 },
      { id: "18L/36R", length: 3800, width: 60, surface: "Concrete", heading: 180 },
      { id: "18R/36L", length: 3200, width: 50, surface: "Concrete", heading: 180 },
    ],
  },
  {
    icao: "YSSY",
    iata: "SYD",
    name: "Sydney Kingsford Smith Airport",
    city: "Sydney",
    country: "Australia",
    lat: -33.9399,
    lon: 151.1753,
    elevation: 6,
    timezone: "Australia/Sydney",
    runways: [
      { id: "07/25", length: 2530, width: 45, surface: "Asphalt", heading: 70 },
      { id: "16L/34R", length: 2438, width: 45, surface: "Asphalt", heading: 160 },
      { id: "16R/34L", length: 3962, width: 45, surface: "Asphalt", heading: 160 },
    ],
  },
  {
    icao: "LEMD",
    iata: "MAD",
    name: "Adolfo Suárez Madrid-Barajas Airport",
    city: "Madrid",
    country: "Spain",
    lat: 40.4983,
    lon: -3.5676,
    elevation: 609,
    timezone: "Europe/Madrid",
    runways: [
      { id: "14L/32R", length: 3500, width: 60, surface: "Asphalt", heading: 140 },
      { id: "14R/32L", length: 4100, width: 60, surface: "Asphalt", heading: 140 },
      { id: "18L/36R", length: 3500, width: 60, surface: "Asphalt", heading: 180 },
      { id: "18R/36L", length: 4350, width: 60, surface: "Asphalt", heading: 180 },
    ],
  },
];

export function searchAirports(query: string): Airport[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  
  return airports.filter(
    (a) =>
      a.iata.toLowerCase().includes(q) ||
      a.icao.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.city.toLowerCase().includes(q) ||
      a.country.toLowerCase().includes(q)
  ).slice(0, 10);
}

export function getAirportByCode(code: string): Airport | undefined {
  const c = code.toUpperCase();
  return airports.find((a) => a.iata === c || a.icao === c);
}
