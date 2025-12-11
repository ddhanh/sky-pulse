import { AircraftState, getFlightPhase, calculateDistance } from "@/lib/api";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, Gauge, Clock } from "lucide-react";

interface CongestionIndicatorProps {
  aircraft: AircraftState[];
  airportLat: number;
  airportLon: number;
  className?: string;
}

export function CongestionIndicator({ 
  aircraft, 
  airportLat, 
  airportLon,
  className 
}: CongestionIndicatorProps) {
  const congestionData = useMemo(() => {
    const inboundNear = aircraft.filter(a => {
      if (!a.latitude || !a.longitude) return false;
      const dist = calculateDistance(airportLat, airportLon, a.latitude, a.longitude);
      return dist < 100 && !a.on_ground;
    });

    const holdingPatterns = inboundNear.filter(a => {
      // Low altitude, low speed = potential holding
      const altitude = a.baro_altitude || 0;
      const speed = a.velocity || 0;
      return altitude < 3000 && altitude > 500 && speed < 150;
    });

    const groundTraffic = aircraft.filter(a => {
      if (!a.latitude || !a.longitude) return false;
      const dist = calculateDistance(airportLat, airportLon, a.latitude, a.longitude);
      return dist < 10 && a.on_ground;
    });

    const approaching = inboundNear.filter(a => {
      const altitude = a.baro_altitude || 0;
      const vertRate = a.vertical_rate || 0;
      return altitude < 3000 && vertRate < -2;
    });

    const departing = inboundNear.filter(a => {
      const altitude = a.baro_altitude || 0;
      const vertRate = a.vertical_rate || 0;
      return altitude < 5000 && vertRate > 2;
    });

    // Calculate congestion score (0-100)
    const score = Math.min(100, 
      (inboundNear.length * 2) + 
      (holdingPatterns.length * 10) + 
      (groundTraffic.length * 3) +
      (approaching.length * 5)
    );

    let level: "low" | "moderate" | "high" | "severe";
    if (score < 25) level = "low";
    else if (score < 50) level = "moderate";
    else if (score < 75) level = "high";
    else level = "severe";

    return {
      score,
      level,
      inboundCount: inboundNear.length,
      holdingCount: holdingPatterns.length,
      groundCount: groundTraffic.length,
      approachingCount: approaching.length,
      departingCount: departing.length,
      estimatedDelay: holdingPatterns.length * 5 + Math.max(0, approaching.length - 3) * 2,
    };
  }, [aircraft, airportLat, airportLon]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case "low": return "text-success";
      case "moderate": return "text-primary";
      case "high": return "text-warning";
      case "severe": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  const getLevelBg = (level: string) => {
    switch (level) {
      case "low": return "bg-success/10 border-success/30";
      case "moderate": return "bg-primary/10 border-primary/30";
      case "high": return "bg-warning/10 border-warning/30";
      case "severe": return "bg-destructive/10 border-destructive/30";
      default: return "bg-muted";
    }
  };

  return (
    <div className={cn("rounded-xl border border-border bg-card p-6", className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Airport Congestion</h3>
        {congestionData.level === "severe" && (
          <div className="flex items-center gap-2 text-destructive text-sm font-medium animate-pulse">
            <AlertTriangle className="h-4 w-4" />
            High Traffic Alert
          </div>
        )}
      </div>

      <div className="flex items-center gap-6 mb-6">
        <div className={cn(
          "flex h-20 w-20 items-center justify-center rounded-2xl border-2",
          getLevelBg(congestionData.level)
        )}>
          <div className="text-center">
            <span className={cn("text-3xl font-mono font-bold", getLevelColor(congestionData.level))}>
              {congestionData.score}
            </span>
          </div>
        </div>
        <div>
          <p className={cn("text-xl font-semibold capitalize", getLevelColor(congestionData.level))}>
            {congestionData.level} Congestion
          </p>
          {congestionData.estimatedDelay > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <Clock className="h-4 w-4" />
              Est. delay: ~{congestionData.estimatedDelay} min
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="rounded-lg bg-secondary/50 p-3">
          <p className="text-2xl font-mono font-bold text-foreground">{congestionData.inboundCount}</p>
          <p className="text-xs text-muted-foreground">Inbound (100km)</p>
        </div>
        <div className="rounded-lg bg-secondary/50 p-3">
          <p className="text-2xl font-mono font-bold text-warning">{congestionData.holdingCount}</p>
          <p className="text-xs text-muted-foreground">Holding</p>
        </div>
        <div className="rounded-lg bg-secondary/50 p-3">
          <p className="text-2xl font-mono font-bold text-foreground">{congestionData.groundCount}</p>
          <p className="text-xs text-muted-foreground">On Ground</p>
        </div>
        <div className="rounded-lg bg-secondary/50 p-3">
          <p className="text-2xl font-mono font-bold text-success">{congestionData.approachingCount}</p>
          <p className="text-xs text-muted-foreground">Approaching</p>
        </div>
        <div className="rounded-lg bg-secondary/50 p-3">
          <p className="text-2xl font-mono font-bold text-primary">{congestionData.departingCount}</p>
          <p className="text-xs text-muted-foreground">Departing</p>
        </div>
      </div>
    </div>
  );
}
