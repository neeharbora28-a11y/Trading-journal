import { NavLink } from "react-router-dom";
import { LayoutDashboard, BookOpen, PlusCircle, BarChart2, Sparkles, Zap } from "lucide-react";
import { useStore } from "@/store";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

export function BottomNav({ className }: { className?: string }) {
  const setQuickLogOpen = useStore(state => state.setQuickLogOpen);

  const navItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Home" },
    { to: "/journal", icon: BookOpen, label: "Journal" },
  ];

  const navItemsRight = [
    { to: "/analytics", icon: BarChart2, label: "Charts" },
    { to: "/aicoach", icon: Sparkles, label: "AI" },
  ];

  return (
    <nav className={cn("bg-surface/80 backdrop-blur-xl border-t border-border flex items-center justify-around px-1 h-20 safe-area-pb", className)}>
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center justify-center gap-1 min-w-[72px] h-full transition-all tap-target-48",
              isActive ? "text-accent" : "text-text-muted hover:text-text-primary"
            )
          }
        >
          <item.icon size={22} className={cn("transition-transform", "active:scale-90")} />
          <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
        </NavLink>
      ))}

      <div className="relative h-full flex items-center justify-center -mt-6">
        <button
          onClick={() => setQuickLogOpen(true)}
          className="flex flex-col items-center justify-center gap-1 group active:scale-90 transition-transform tap-target-48"
        >
          <div className="bg-surface rounded-full p-1.5 shadow-2xl">
            <div className="bg-accent text-white rounded-2xl p-3 shadow-xl shadow-accent/40 flex items-center justify-center group-hover:bg-accent/90">
              <Zap size={24} className="fill-current" />
            </div>
          </div>
          <span className="text-[9px] font-black uppercase text-accent tracking-tighter mt-1">Quick Log</span>
        </button>
      </div>

      {navItemsRight.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center justify-center gap-1 min-w-[72px] h-full transition-all tap-target-48",
              isActive ? "text-accent" : "text-text-muted hover:text-text-primary"
            )
          }
        >
          <item.icon size={22} className={cn("transition-transform", "active:scale-90")} />
          <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
