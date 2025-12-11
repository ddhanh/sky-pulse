import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { FlightMap } from "@/components/FlightMap";
import { FlightList } from "@/components/FlightList";
import { AirportInfo } from "@/components/AirportInfo";
import { WeatherWidget } from "@/components/WeatherWidget";
import { CongestionIndicator } from "@/components/CongestionIndicator";
import { StatCard, StatGrid } from "@/components/StatCard";
import { getAirportByCode, Airport } from "@/data/airports";
import { 
  fetchAllStates, 
  fetchArrivals, 
  fetchDepartures, 
  fetchWeather,
  AircraftState,
  FlightData,
  WeatherData,
  calculateDistance 
} from "@/lib/api";
import { ArrowLeft, Plane, Clock, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function AirportDetail() {
  const { code } = useParams<{ code: string }>();
  const [airport, setAirport] = useState<Airport | null>(null);
  const [aircraft, setAircraft] = useState<AircraftState[]>([]);
  const [arrivals, setArrivals] = useState<FlightData[]>([]);
  const [departures, setDepartures] = useState<FlightData[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!code) return;

    const airportData = getAirportByCode(code);
    if (!airportData) {
      setLoading(false);
      return;
    }
    setAirport(airportData);

    const fetchData = async () => {
      setLoading(true);

      const now = Math.floor(Date.now() / 1000);
      const dayAgo = now - 86400;

      // Fetch all data in parallel
      const [states, arrivalsData, departuresData, weatherData] = await Promise.all([
        fetchAllStates({
          lamin: airportData.lat - 2,
          lamax: airportData.lat + 2,
          lomin: airportData.lon - 2,
          lomax: airportData.lon + 2,
        }),
        fetchArrivals(airportData.icao, dayAgo, now),
        fetchDepartures(airportData.icao, dayAgo, now),
        fetchWeather(airportData.lat, airportData.lon),
      ]);

      // Filter aircraft within 150km
      const nearbyAircraft = states.filter(a => {
        if (!a.latitude || !a.longitude) return false;
        const dist = calculateDistance(airportData.lat, airportData.lon, a.latitude, a.longitude);
        return dist < 150;
      });

      setAircraft(nearbyAircraft);
      setArrivals(arrivalsData);
      setDepartures(departuresData);
      setWeather(weatherData);
      setLoading(false);
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [code]);

  if (!airport) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center py-20">
            <AlertTriangle className="h-16 w-16 text-warning mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Airport Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The airport code "{code}" was not found in our database.
            </p>
            <Link
              to="/airports"
              className="flex items-center gap-2 text-primary hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to airport search
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Calculate hourly distribution
  const getHourlyDistribution = (flights: FlightData[], isArrival: boolean) => {
    const hours: Record<number, number> = {};
    for (let i = 0; i < 24; i++) hours[i] = 0;

    flights.forEach(f => {
      const time = isArrival ? f.lastSeen : f.firstSeen;
      const hour = new Date(time * 1000).getHours();
      hours[hour]++;
    });

    return Object.entries(hours).map(([hour, count]) => ({
      hour: `${hour}:00`,
      count,
    }));
  };

  const arrivalHourly = getHourlyDistribution(arrivals, true);
  const departureHourly = getHourlyDistribution(departures, false);

  // Calculate average flight duration
  const avgDuration = arrivals.length > 0
    ? arrivals.reduce((sum, f) => sum + (f.lastSeen - f.firstSeen), 0) / arrivals.length
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back button */}
        <Link
          to="/airports"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to airports
        </Link>

        {/* Airport Info */}
        <AirportInfo airport={airport} className="mb-8" />

        {/* Stats */}
        <StatGrid columns={4} className="mb-8">
          <StatCard
            title="Nearby Aircraft"
            value={aircraft.length}
            icon={<Plane className="h-4 w-4" />}
            subtitle="Within 150km radius"
          />
          <StatCard
            title="Arrivals (24h)"
            value={arrivals.length}
            icon={<TrendingDown className="h-4 w-4" />}
            trend="stable"
            subtitle="Recent landings"
          />
          <StatCard
            title="Departures (24h)"
            value={departures.length}
            icon={<TrendingUp className="h-4 w-4" />}
            trend="stable"
            subtitle="Recent takeoffs"
          />
          <StatCard
            title="Avg. Flight Duration"
            value={`${Math.floor(avgDuration / 3600)}h ${Math.floor((avgDuration % 3600) / 60)}m`}
            icon={<Clock className="h-4 w-4" />}
            subtitle="Inbound flights"
          />
        </StatGrid>

        {/* Congestion and Weather */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <CongestionIndicator
            aircraft={aircraft}
            airportLat={airport.lat}
            airportLon={airport.lon}
          />
          {weather && <WeatherWidget weather={weather} />}
        </div>

        {/* Map */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">Live Traffic</h3>
          <div className="h-[400px]">
            <FlightMap 
              aircraft={aircraft} 
              center={[airport.lat, airport.lon]} 
              zoom={8} 
            />
          </div>
        </div>

        {/* Hourly Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-success" />
              Arrivals by Hour (24h)
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={arrivalHourly}>
                  <XAxis 
                    dataKey="hour" 
                    tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }}
                    axisLine={{ stroke: "hsl(222, 30%, 18%)" }}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }}
                    axisLine={{ stroke: "hsl(222, 30%, 18%)" }}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(222, 47%, 8%)",
                      border: "1px solid hsl(222, 30%, 18%)",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(142, 76%, 45%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Departures by Hour (24h)
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departureHourly}>
                  <XAxis 
                    dataKey="hour" 
                    tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }}
                    axisLine={{ stroke: "hsl(222, 30%, 18%)" }}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }}
                    axisLine={{ stroke: "hsl(222, 30%, 18%)" }}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(222, 47%, 8%)",
                      border: "1px solid hsl(222, 30%, 18%)",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(187, 100%, 50%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Flight Lists */}
        <div className="grid lg:grid-cols-2 gap-6">
          <FlightList flights={arrivals} type="arrivals" />
          <FlightList flights={departures} type="departures" />
        </div>
      </main>
    </div>
  );
}
