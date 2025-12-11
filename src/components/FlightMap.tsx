import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import { AircraftState, getFlightPhase } from "@/lib/api";
import "leaflet/dist/leaflet.css";

interface FlightMapProps {
  aircraft: AircraftState[];
  center?: [number, number];
  zoom?: number;
  onAircraftClick?: (aircraft: AircraftState) => void;
}

function getAltitudeColor(altitude: number | null): string {
  if (!altitude || altitude === 0) return "hsl(38, 50%, 40%)";
  if (altitude < 3000) return "hsl(38, 92%, 50%)";
  if (altitude < 8000) return "hsl(142, 76%, 45%)";
  return "hsl(187, 100%, 50%)";
}

export function FlightMap({ 
  aircraft, 
  center = [30, 0], 
  zoom = 2,
  onAircraftClick 
}: FlightMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);

  const validAircraft = useMemo(() => 
    aircraft.filter(a => a.latitude !== null && a.longitude !== null),
    [aircraft]
  );

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = L.map(containerRef.current, {
      center: center,
      zoom: zoom,
      zoomControl: false,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update center when it changes
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView(center, zoom);
    }
  }, [center, zoom]);

  // Update markers when aircraft change
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear old markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    validAircraft.forEach(a => {
      const marker = L.circleMarker([a.latitude!, a.longitude!], {
        radius: a.on_ground ? 3 : 5,
        color: getAltitudeColor(a.baro_altitude),
        fillColor: getAltitudeColor(a.baro_altitude),
        fillOpacity: 0.8,
        weight: 1,
      });

      const popupContent = `
        <div style="min-width: 180px; font-family: system-ui, sans-serif;">
          <div style="font-weight: bold; margin-bottom: 8px; font-family: monospace;">
            ✈ ${a.callsign || a.icao24.toUpperCase()}
          </div>
          <div style="font-size: 12px; color: #666;">
            <p><b>Country:</b> ${a.origin_country}</p>
            <p><b>Altitude:</b> ${a.baro_altitude?.toFixed(0) || 0} m</p>
            <p><b>Speed:</b> ${a.velocity?.toFixed(0) || 0} m/s</p>
            <p><b>Heading:</b> ${a.true_track?.toFixed(0) || 0}°</p>
            <p><b>Phase:</b> ${getFlightPhase(a.baro_altitude, a.velocity, a.vertical_rate, a.on_ground)}</p>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      
      marker.on('click', () => {
        onAircraftClick?.(a);
      });

      marker.addTo(mapRef.current!);
      markersRef.current.push(marker);
    });
  }, [validAircraft, onAircraftClick]);

  return (
    <div className="relative w-full h-full min-h-[400px] rounded-xl overflow-hidden border border-border">
      <div 
        ref={containerRef} 
        className="w-full h-full"
        style={{ background: "hsl(222, 47%, 6%)" }}
      />

      {/* Altitude Legend */}
      <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-3 text-xs z-[1000]">
        <p className="font-medium mb-2 text-foreground">Altitude</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-altitude-high" />
            <span className="text-muted-foreground">&gt; 8000m (Cruise)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-altitude-mid" />
            <span className="text-muted-foreground">3000-8000m</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-altitude-low" />
            <span className="text-muted-foreground">&lt; 3000m</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ background: "hsl(38, 50%, 40%)" }} />
            <span className="text-muted-foreground">Ground</span>
          </div>
        </div>
      </div>

      {/* Stats overlay */}
      <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm border border-border rounded-lg px-4 py-2 font-mono text-sm z-[1000]">
        <span className="text-primary">{validAircraft.length}</span>
        <span className="text-muted-foreground"> aircraft tracked</span>
      </div>
    </div>
  );
}
