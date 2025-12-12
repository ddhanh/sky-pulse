import { Plane, Search, BarChart3, Globe, MapPin } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", label: "Dashboard", icon: Globe },
  { path: "/airports", label: "Airports", icon: MapPin },
  { path: "/rankings", label: "Rankings", icon: BarChart3 },
];

export function Header() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 animate-ping-slow rounded-full bg-primary/30" />
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 border border-primary/30">
              <Plane className="h-5 w-5 text-primary transition-transform group-hover:rotate-12" />
            </div>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-foreground">
              SkyPulse
            </h1>
            <p className="text-xs text-muted-foreground font-mono">
              GLOBAL FLIGHT INSIGHTS
            </p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "nav-link flex items-center gap-2",
                location.pathname === item.path && "active"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
              </span>
              LIVE
            </div>
          </div>
          <span className="text-[10px] text-muted-foreground font-mono">
            Data refreshes every 30 seconds • {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>
    </header>
  );
}
