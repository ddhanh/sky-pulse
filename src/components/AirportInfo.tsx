import { Airport } from "@/data/airports";
import { MapPin, Gauge, Clock, Ruler } from "lucide-react";
import { cn } from "@/lib/utils";

interface AirportInfoProps {
  airport: Airport;
  className?: string;
}

export function AirportInfo({ airport, className }: AirportInfoProps) {
  return (
    <div className={cn("rounded-xl border border-border bg-card overflow-hidden", className)}>
      <div className="border-b border-border bg-gradient-to-r from-primary/10 to-transparent px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/20 border border-primary/30">
            <span className="font-mono text-xl font-bold text-primary">{airport.iata}</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{airport.name}</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {airport.city}, {airport.country}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div>
            <p className="text-xs text-muted-foreground mb-1">ICAO Code</p>
            <p className="font-mono font-bold text-foreground">{airport.icao}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Elevation</p>
            <p className="font-mono font-bold text-foreground">{airport.elevation}m</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Coordinates</p>
            <p className="font-mono text-sm text-foreground">
              {airport.lat.toFixed(4)}°, {airport.lon.toFixed(4)}°
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Timezone</p>
            <p className="font-mono text-sm text-foreground">{airport.timezone}</p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Ruler className="h-4 w-4 text-primary" />
            Runways ({airport.runways.length})
          </h3>
          <div className="grid gap-2">
            {airport.runways.map((runway) => (
              <div
                key={runway.id}
                className="flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-2"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-primary">{runway.id}</span>
                  <span className="text-xs text-muted-foreground">{runway.surface}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">
                    {runway.length}m × {runway.width}m
                  </span>
                  <span className="font-mono text-foreground">{runway.heading}°</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
