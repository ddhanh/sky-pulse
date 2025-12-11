import { useState } from "react";
import { Header } from "@/components/Header";
import { AirportSearch } from "@/components/AirportSearch";
import { airports, Airport } from "@/data/airports";
import { Link } from "react-router-dom";
import { MapPin, Plane, Ruler, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Airports() {
  const [filter, setFilter] = useState<"all" | "usa" | "europe" | "asia">("all");

  const filteredAirports = airports.filter(a => {
    if (filter === "all") return true;
    if (filter === "usa") return a.country === "United States";
    if (filter === "europe") return ["United Kingdom", "France", "Germany", "Netherlands", "Spain"].includes(a.country);
    if (filter === "asia") return ["Japan", "Hong Kong", "Singapore", "China"].includes(a.country);
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Airport Search</h1>
          <p className="text-muted-foreground">
            Search for airports by name, city, IATA or ICAO code
          </p>
        </div>

        <AirportSearch className="mb-8 max-w-2xl" autoFocus />

        {/* Filters */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-sm text-muted-foreground">Filter:</span>
          {[
            { key: "all", label: "All" },
            { key: "usa", label: "USA" },
            { key: "europe", label: "Europe" },
            { key: "asia", label: "Asia" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key as typeof filter)}
              className={cn(
                "px-3 py-1.5 text-sm rounded-lg transition-colors",
                filter === f.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Airport Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAirports.map((airport) => (
            <Link
              key={airport.icao}
              to={`/airport/${airport.icao}`}
              className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-glow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
                    <span className="font-mono text-lg font-bold text-primary">{airport.iata}</span>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-mono">{airport.icao}</p>
                    <p className="text-sm font-medium text-foreground">{airport.city}</p>
                  </div>
                </div>
                <Plane className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>

              <h3 className="text-foreground font-medium mb-3 line-clamp-2 min-h-[48px]">
                {airport.name}
              </h3>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{airport.country}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Ruler className="h-4 w-4" />
                  <span>{airport.runways.length} runway{airport.runways.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Globe className="h-4 w-4" />
                  <span className="font-mono text-xs">
                    {airport.lat.toFixed(2)}°, {airport.lon.toFixed(2)}°
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
