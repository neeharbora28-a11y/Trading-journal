import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  LineChart,
  BrainCircuit,
  Settings,
  Briefcase,
  Calendar,
  Library,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "journal", label: "Journal", icon: BookOpen },
  { id: "trades", label: "Trades", icon: Briefcase },
  { id: "setups", label: "Setup Library", icon: Library },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "analytics", label: "Analytics", icon: LineChart },
  { id: "psychology", label: "Psychology", icon: BrainCircuit },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 h-screen border-r border-border bg-surface flex flex-col fixed left-0 top-0">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <div className="flex items-center gap-2 text-accent font-bold text-lg tracking-tight">
          <div className="w-6 h-6 rounded bg-accent flex items-center justify-center text-white">
            <LineChart size={14} strokeWidth={3} />
          </div>
          FX Journal
        </div>
      </div>

      <nav className="flex-1 py-6 px-3 flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === `/${item.id}`;
          return (
            <Link
              key={item.id}
              to={`/${item.id}`}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-accent-muted text-accent"
                  : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
              )}
            >
              <Icon size={18} className={isActive ? "text-accent" : "text-text-muted"} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <button 
          onClick={() => toast.info("Settings panel coming soon!")}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors"
        >
          <Settings size={18} className="text-text-muted" />
          Settings
        </button>
      </div>
    </aside>
  );
}
