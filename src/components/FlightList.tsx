import { FlightData } from "@/lib/api";
import { getAirportByCode } from "@/data/airports";
import { Plane, Clock, ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface FlightListProps {
  flights: FlightData[];
  type: "arrivals" | "departures";
  className?: string;
}

function formatTime(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

export function FlightList({ flights, type, className }: FlightListProps) {
  const isArrivals = type === "arrivals";
  
  return (
    <div className={cn("rounded-xl border border-border bg-card overflow-hidden", className)}>
      <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-secondary/30">
        <div className="flex items-center gap-2">
          {isArrivals ? (
            <ArrowLeft className="h-4 w-4 text-success" />
          ) : (
            <ArrowRight className="h-4 w-4 text-primary" />
          )}
          <h3 className="font-semibold text-foreground">
            {isArrivals ? "Recent Arrivals" : "Recent Departures"}
          </h3>
        </div>
        <span className="text-xs font-mono text-muted-foreground">
          {flights.length} flights
        </span>
      </div>

      <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
        {flights.length === 0 ? (
          <div className="px-4 py-8 text-center text-muted-foreground">
            <Plane className="mx-auto h-8 w-8 mb-2 opacity-50" />
            <p>No recent flights</p>
          </div>
        ) : (
          flights.slice(0, 15).map((flight, i) => {
            const otherAirport = isArrivals
              ? flight.estDepartureAirport
              : flight.estArrivalAirport;
            const otherAirportData = otherAirport
              ? getAirportByCode(otherAirport)
              : null;
            const duration = flight.lastSeen - flight.firstSeen;

            return (
              <div
                key={`${flight.icao24}-${i}`}
                className="flight-row flex items-center justify-between px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                    <Plane
                      className={cn(
                        "h-4 w-4",
                        isArrivals ? "text-success rotate-90" : "text-primary -rotate-90"
                      )}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-foreground">
                        {flight.callsign || flight.icao24.toUpperCase()}
                      </span>
                      {otherAirport && (
                        <span className="text-xs text-muted-foreground">
                          {isArrivals ? "from" : "to"}{" "}
                          <span className="font-mono text-primary">{otherAirport}</span>
                        </span>
                      )}
                    </div>
                    {otherAirportData && (
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {otherAirportData.city}, {otherAirportData.country}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <p className="font-mono text-sm text-foreground">
                      {formatTime(isArrivals ? flight.lastSeen : flight.firstSeen)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isArrivals ? "Landed" : "Departed"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDuration(duration)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
