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
  Sparkles,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useStore } from "@/store";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "journal", label: "Journal", icon: BookOpen },
  { id: "trades", label: "Trades", icon: Briefcase },
  { id: "setups", label: "Setup Library", icon: Library },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "analytics", label: "Analytics", icon: LineChart },
  { id: "psychology", label: "Psychology", icon: BrainCircuit },
  { id: "aicoach", label: "AI Coach", icon: Sparkles },
];

export function Sidebar({ className }: { className?: string }) {
  const location = useLocation();
  const setQuickLogOpen = useStore(state => state.setQuickLogOpen);

  return (
    <aside className={cn("w-64 h-screen border-r border-border bg-surface flex flex-col fixed left-0 top-0 z-50", className)}>
      <div className="h-16 md:h-20 flex items-center px-6 border-b border-border safe-area-pt">
        <div className="flex items-center gap-2 text-accent font-bold text-lg tracking-tight">
          <div className="w-6 h-6 rounded bg-accent flex items-center justify-center text-white">
            <LineChart size={14} strokeWidth={3} />
          </div>
          FX Journal
        </div>
      </div>

      <div className="px-4 pt-6 pb-2">
        <button 
          onClick={() => setQuickLogOpen(true)}
          className="w-full bg-accent hover:bg-accent/90 text-white py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-accent/20 active:scale-95"
        >
          <Zap size={16} />
          Quick Log
        </button>
      </div>

      <nav className="flex-1 py-4 px-3 flex flex-col gap-1">
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
