import { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/Header";
import { StatCard, StatGrid } from "@/components/StatCard";
import { fetchAllStates, AircraftState, calculateDistance } from "@/lib/api";
import { airports } from "@/data/airports";
import { Link } from "react-router-dom";
import { Trophy, Plane, MapPin, TrendingUp, Clock, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

type RankingCategory = "busiest" | "reliable" | "holding";

export default function Rankings() {
  const [aircraft, setAircraft] = useState<AircraftState[]>([]);
  const [category, setCategory] = useState<RankingCategory>("busiest");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const states = await fetchAllStates();
      setAircraft(states);
      setLoading(false);
    };

    fetchData();
  }, []);

  const rankings = useMemo(() => {
    // Calculate traffic around each airport
    const airportTraffic = airports.map(airport => {
      const nearby = aircraft.filter(a => {
        if (!a.latitude || !a.longitude) return false;
        const dist = calculateDistance(airport.lat, airport.lon, a.latitude, a.longitude);
        return dist < 100;
      });

      const inbound = nearby.filter(a => !a.on_ground);
      const grounded = nearby.filter(a => a.on_ground);
      
      // Holding pattern detection (low altitude, circling)
      const holding = nearby.filter(a => {
        const alt = a.baro_altitude || 0;
        const speed = a.velocity || 0;
        return alt < 3000 && alt > 500 && speed < 150 && !a.on_ground;
      });

      // Calculate reliability score (inverse of congestion + holding)
      const congestionScore = inbound.length + (holding.length * 3) + (grounded.length * 0.5);
      const reliabilityScore = Math.max(0, 100 - congestionScore);

      return {
        airport,
        totalNearby: nearby.length,
        inbound: inbound.length,
        grounded: grounded.length,
        holding: holding.length,
        reliabilityScore,
        congestionScore,
      };
    });

    // Sort by different criteria based on category
    const sorted = [...airportTraffic];
    
    switch (category) {
      case "busiest":
        sorted.sort((a, b) => b.totalNearby - a.totalNearby);
        break;
      case "reliable":
        sorted.sort((a, b) => b.reliabilityScore - a.reliabilityScore);
        break;
      case "holding":
        sorted.sort((a, b) => b.holding - a.holding);
        break;
    }

    return sorted;
  }, [aircraft, category]);

  const categories = [
    { key: "busiest" as RankingCategory, label: "Busiest Airports", icon: Activity },
    { key: "reliable" as RankingCategory, label: "Most Reliable", icon: Trophy },
    { key: "holding" as RankingCategory, label: "Highest Holding", icon: Clock },
  ];

  const getMedalColor = (index: number) => {
    if (index === 0) return "text-warning"; // Gold
    if (index === 1) return "text-muted-foreground"; // Silver
    if (index === 2) return "text-warning/60"; // Bronze
    return "text-muted-foreground";
  };

  const getScoreDisplay = (item: typeof rankings[0]) => {
    switch (category) {
      case "busiest":
        return { value: item.totalNearby, label: "aircraft nearby" };
      case "reliable":
        return { value: item.reliabilityScore.toFixed(0), label: "reliability score" };
      case "holding":
        return { value: item.holding, label: "in holding pattern" };
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Global Rankings</h1>
          <p className="text-muted-foreground">
            Real-time airport rankings based on live traffic data
          </p>
        </div>

        {/* Quick Stats */}
        <StatGrid columns={3} className="mb-8">
          <StatCard
            title="Total Aircraft Tracked"
            value={aircraft.length.toLocaleString()}
            icon={<Plane className="h-4 w-4" />}
          />
          <StatCard
            title="Airports Monitored"
            value={airports.length}
            icon={<MapPin className="h-4 w-4" />}
          />
          <StatCard
            title="Airborne"
            value={aircraft.filter(a => !a.on_ground).length.toLocaleString()}
            icon={<TrendingUp className="h-4 w-4" />}
          />
        </StatGrid>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setCategory(cat.key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
                category === cat.key
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              <cat.icon className="h-4 w-4" />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Rankings List */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="divide-y divide-border">
            {rankings.slice(0, 15).map((item, index) => {
              const score = getScoreDisplay(item);
              
              return (
                <Link
                  key={item.airport.icao}
                  to={`/airport/${item.airport.icao}`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-secondary/50 transition-colors"
                >
                  {/* Rank */}
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl font-mono font-bold text-lg",
                    index < 3 
                      ? "bg-primary/10 border border-primary/30" 
                      : "bg-secondary"
                  )}>
                    <span className={getMedalColor(index)}>
                      {index < 3 ? (
                        <Trophy className="h-5 w-5" />
                      ) : (
                        index + 1
                      )}
                    </span>
                  </div>

                  {/* Airport Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-primary text-lg">
                        {item.airport.iata}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        / {item.airport.icao}
                      </span>
                    </div>
                    <p className="text-sm text-foreground truncate">
                      {item.airport.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.airport.city}, {item.airport.country}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="hidden md:flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="font-mono font-bold text-foreground">{item.inbound}</p>
                      <p className="text-xs text-muted-foreground">Inbound</p>
                    </div>
                    <div className="text-center">
                      <p className="font-mono font-bold text-foreground">{item.grounded}</p>
                      <p className="text-xs text-muted-foreground">Ground</p>
                    </div>
                    <div className="text-center">
                      <p className={cn(
                        "font-mono font-bold",
                        item.holding > 0 ? "text-warning" : "text-foreground"
                      )}>
                        {item.holding}
                      </p>
                      <p className="text-xs text-muted-foreground">Holding</p>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <p className="font-mono text-2xl font-bold text-primary">
                      {score.value}
                    </p>
                    <p className="text-xs text-muted-foreground">{score.label}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
