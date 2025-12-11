import { WeatherData, getWeatherDescription } from "@/lib/api";
import { Cloud, Wind, Eye, Droplets, Thermometer, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeatherWidgetProps {
  weather: WeatherData;
  className?: string;
}

export function WeatherWidget({ weather, className }: WeatherWidgetProps) {
  const getVisibilityStatus = (visibility: number) => {
    if (visibility > 8000) return { label: "Excellent", color: "text-success" };
    if (visibility > 4000) return { label: "Good", color: "text-primary" };
    if (visibility > 1000) return { label: "Moderate", color: "text-warning" };
    return { label: "Poor", color: "text-destructive" };
  };

  const getWindStatus = (speed: number) => {
    if (speed < 10) return { label: "Calm", color: "text-success" };
    if (speed < 25) return { label: "Moderate", color: "text-primary" };
    if (speed < 40) return { label: "Strong", color: "text-warning" };
    return { label: "Severe", color: "text-destructive" };
  };

  const visStatus = getVisibilityStatus(weather.visibility);
  const windStatus = getWindStatus(weather.windSpeed);
  const hasPrecipitation = weather.precipitation > 0;
  const isStormy = weather.weatherCode >= 95;

  return (
    <div className={cn("rounded-xl border border-border bg-card p-6", className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Weather Conditions</h3>
        {isStormy && (
          <div className="flex items-center gap-2 text-destructive text-sm font-medium">
            <AlertTriangle className="h-4 w-4" />
            Storm Warning
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Thermometer className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-mono font-bold text-foreground">
              {weather.temperature.toFixed(1)}°C
            </p>
            <p className="text-xs text-muted-foreground">Temperature</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Wind className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-mono font-bold text-foreground">
              {weather.windSpeed.toFixed(0)} <span className="text-sm">km/h</span>
            </p>
            <p className={cn("text-xs", windStatus.color)}>
              {windStatus.label} • {weather.windDirection.toFixed(0)}°
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Eye className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-mono font-bold text-foreground">
              {(weather.visibility / 1000).toFixed(1)} <span className="text-sm">km</span>
            </p>
            <p className={cn("text-xs", visStatus.color)}>
              {visStatus.label} visibility
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Cloud className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-mono font-bold text-foreground">
              {weather.cloudCover.toFixed(0)}%
            </p>
            <p className="text-xs text-muted-foreground">Cloud cover</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Droplets className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-mono font-bold text-foreground">
              {weather.precipitation.toFixed(1)} <span className="text-sm">mm</span>
            </p>
            <p className={cn("text-xs", hasPrecipitation ? "text-warning" : "text-muted-foreground")}>
              {hasPrecipitation ? "Precipitation" : "No precipitation"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 col-span-2 md:col-span-1">
          <div className="rounded-lg bg-secondary/50 px-4 py-2 w-full">
            <p className="text-sm font-medium text-foreground">
              {getWeatherDescription(weather.weatherCode)}
            </p>
            <p className="text-xs text-muted-foreground">Current conditions</p>
          </div>
        </div>
      </div>
    </div>
  );
}
