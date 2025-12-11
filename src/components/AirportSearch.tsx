import { useState, useEffect, useRef } from "react";
import { Search, MapPin, Plane } from "lucide-react";
import { searchAirports, Airport } from "@/data/airports";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface AirportSearchProps {
  onSelect?: (airport: Airport) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export function AirportSearch({
  onSelect,
  placeholder = "Search airports by name, city, or code...",
  className,
  autoFocus = false,
}: AirportSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Airport[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (query.length > 0) {
      const found = searchAirports(query);
      setResults(found);
      setIsOpen(found.length > 0);
      setSelectedIndex(0);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query]);

  const handleSelect = (airport: Airport) => {
    setQuery("");
    setIsOpen(false);
    if (onSelect) {
      onSelect(airport);
    } else {
      navigate(`/airport/${airport.icao}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="search-input w-full rounded-xl border bg-secondary/30 py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-xs text-muted-foreground font-mono">
          <kbd className="rounded bg-muted px-1.5 py-0.5">↑↓</kbd>
          <kbd className="rounded bg-muted px-1.5 py-0.5">Enter</kbd>
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 max-h-96 overflow-auto rounded-xl border border-border bg-popover shadow-elevated">
          {results.map((airport, index) => (
            <button
              key={airport.icao}
              onClick={() => handleSelect(airport)}
              className={cn(
                "flex w-full items-center gap-4 px-4 py-3 text-left transition-colors",
                index === selectedIndex
                  ? "bg-primary/10 text-foreground"
                  : "hover:bg-secondary text-foreground"
              )}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <Plane className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-primary">
                    {airport.iata}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    / {airport.icao}
                  </span>
                </div>
                <p className="truncate text-sm">{airport.name}</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {airport.city}, {airport.country}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
