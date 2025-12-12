import { useEffect, useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { FlightMap } from "@/components/FlightMap";
import { StatCard, StatGrid } from "@/components/StatCard";
import { AirportSearch } from "@/components/AirportSearch";
import { fetchAllStates, AircraftState } from "@/lib/api";
import { airports } from "@/data/airports";
import { Link } from "react-router-dom";
import { 
  Plane, 
  Globe, 
  Gauge, 
  TrendingUp, 
  MapPin,
  Activity,
  BarChart3
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function Dashboard() {
  const [aircraft, setAircraft] = useState<AircraftState[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const states = await fetchAllStates();
      setAircraft(states);
      setLoading(false);
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const stats = useMemo(() => {
    const airborne = aircraft.filter(a => !a.on_ground);
    const grounded = aircraft.filter(a => a.on_ground);
    
    const avgAltitude = airborne.length > 0
      ? airborne.reduce((sum, a) => sum + (a.baro_altitude || 0), 0) / airborne.length
      : 0;
    
    const avgSpeed = airborne.length > 0
      ? airborne.reduce((sum, a) => sum + (a.velocity || 0), 0) / airborne.length
      : 0;

    // Speed distribution
    const speedBuckets = {
      taxiing: aircraft.filter(a => (a.velocity || 0) < 30).length,
      climbing: aircraft.filter(a => (a.velocity || 0) >= 30 && (a.velocity || 0) < 150).length,
      cruising: aircraft.filter(a => (a.velocity || 0) >= 150 && (a.velocity || 0) < 250).length,
      highSpeed: aircraft.filter(a => (a.velocity || 0) >= 250).length,
    };

    // Altitude distribution
    const altitudeBuckets = {
      ground: grounded.length,
      low: airborne.filter(a => (a.baro_altitude || 0) < 3000).length,
      mid: airborne.filter(a => (a.baro_altitude || 0) >= 3000 && (a.baro_altitude || 0) < 8000).length,
      high: airborne.filter(a => (a.baro_altitude || 0) >= 8000).length,
    };

    // Country distribution
    const countries = aircraft.reduce((acc, a) => {
      acc[a.origin_country] = (acc[a.origin_country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topCountries = Object.entries(countries)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      total: aircraft.length,
      airborne: airborne.length,
      grounded: grounded.length,
      avgAltitude: Math.round(avgAltitude),
      avgSpeed: Math.round(avgSpeed),
      speedBuckets,
      altitudeBuckets,
      topCountries,
    };
  }, [aircraft]);

  const altitudeData = [
    { name: "Ground", value: stats.altitudeBuckets.ground, color: "hsl(38, 50%, 40%)" },
    { name: "< 3km", value: stats.altitudeBuckets.low, color: "hsl(38, 92%, 50%)" },
    { name: "3-8km", value: stats.altitudeBuckets.mid, color: "hsl(142, 76%, 45%)" },
    { name: "> 8km", value: stats.altitudeBuckets.high, color: "hsl(187, 100%, 50%)" },
  ];

  const speedData = [
    { name: "Taxiing", value: stats.speedBuckets.taxiing },
    { name: "Climbing", value: stats.speedBuckets.climbing },
    { name: "Cruising", value: stats.speedBuckets.cruising },
    { name: "High Speed", value: stats.speedBuckets.highSpeed },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="relative mb-8 rounded-2xl border border-border bg-card">
          <div className="absolute inset-0 radar-grid opacity-30" />
          <div className="relative p-8 md:p-12">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 glow-text">
                Global Flight Insights
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                Real-time aircraft tracking, airport congestion analysis, and delay predictions 
                powered by live aviation data.
              </p>
              <AirportSearch className="max-w-xl" />
            </div>
            
            {/* Live indicator */}
            <div className="absolute top-8 right-8 flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full bg-success/10 border border-success/30 px-4 py-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                </span>
                <span className="text-sm font-mono text-success">LIVE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <StatGrid columns={4} className="mb-8">
          <StatCard
            title="Total Aircraft"
            value={stats.total.toLocaleString()}
            icon={<Plane className="h-4 w-4" />}
            trend="stable"
            trendValue="tracked"
            subtitle="Currently visible"
          />
          <StatCard
            title="Airborne"
            value={stats.airborne.toLocaleString()}
            icon={<Globe className="h-4 w-4" />}
            trend="up"
            trendValue={`${((stats.airborne / stats.total) * 100).toFixed(0)}%`}
            subtitle="In flight"
          />
          <StatCard
            title="Avg. Altitude"
            value={`${(stats.avgAltitude / 1000).toFixed(1)} km`}
            icon={<TrendingUp className="h-4 w-4" />}
            subtitle="Airborne aircraft"
          />
          <StatCard
            title="Avg. Speed"
            value={`${stats.avgSpeed} m/s`}
            icon={<Gauge className="h-4 w-4" />}
            subtitle="Airborne aircraft"
          />
        </StatGrid>

        {/* Map and Charts */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <div className="h-[500px]">
              <FlightMap aircraft={aircraft} />
            </div>
          </div>

          <div className="space-y-6">
            {/* Altitude Distribution */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Altitude Distribution
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={altitudeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                      isAnimationActive={false}
                    >
                      {altitudeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} style={{ cursor: 'default' }} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {altitudeData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 text-xs">
                    <span 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: item.color }} 
                    />
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className="font-mono text-foreground ml-auto">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Countries */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Top Countries
              </h3>
              <div className="space-y-3">
                {stats.topCountries.map(([country, count], i) => (
                  <div key={country} className="flex items-center gap-3">
                    <span className="text-xs font-mono text-muted-foreground w-4">{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-foreground truncate">{country}</span>
                        <span className="text-xs font-mono text-primary">{count}</span>
                      </div>
                      <div className="h-1 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${(count / stats.topCountries[0][1]) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Access Airports */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Major Airports
            </h3>
            <Link 
              to="/airports" 
              className="text-sm text-primary hover:underline"
            >
              View all →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {airports.slice(0, 10).map((airport) => (
              <Link
                key={airport.icao}
                to={`/airport/${airport.icao}`}
                className="group rounded-lg border border-border bg-secondary/30 p-4 transition-all hover:bg-secondary hover:border-primary/50"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-lg font-bold text-primary group-hover:glow-text">
                    {airport.iata}
                  </span>
                  <span className="text-xs text-muted-foreground">/ {airport.icao}</span>
                </div>
                <p className="text-sm text-foreground truncate">{airport.city}</p>
                <p className="text-xs text-muted-foreground">{airport.country}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Plane className="h-4 w-4 text-primary" />
              <span>SkyPulse — Powered by OpenSky Network & Open-Meteo</span>
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              Data refreshes every 30 seconds • {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
