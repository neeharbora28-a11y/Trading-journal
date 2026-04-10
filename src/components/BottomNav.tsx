import { NavLink } from "react-router-dom";
import { LayoutDashboard, BookOpen, PlusCircle, BarChart2, MoreHorizontal } from "lucide-react";
import { useStore } from "@/store";
import { cn } from "@/lib/utils";

export function BottomNav({ className }: { className?: string }) {
  const setTradeModalOpen = useStore(state => state.setTradeModalOpen);

  const navItems = [
    { to: "/", icon: LayoutDashboard, label: "Home" },
    { to: "/journal", icon: BookOpen, label: "Journal" },
  ];

  const navItemsRight = [
    { to: "/analytics", icon: BarChart2, label: "Charts" },
    { to: "/calendar", icon: MoreHorizontal, label: "More" }, // Using calendar as 'more' for now, or could link to a menu
  ];

  return (
    <div className={cn("bg-surface border-t border-border flex items-center justify-around px-2 py-2 safe-area-pb", className)}>
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center gap-1 p-2 min-w-[64px] rounded-lg transition-colors",
              isActive ? "text-accent" : "text-text-secondary hover:text-text-primary"
            )
          }
        >
          <item.icon size={20} />
          <span className="text-[10px] font-medium">{item.label}</span>
        </NavLink>
      ))}

      <button
        onClick={() => setTradeModalOpen(true)}
        className="flex flex-col items-center gap-1 p-2 min-w-[64px] text-accent hover:text-indigo-400 transition-colors -mt-4"
      >
        <div className="bg-surface rounded-full p-1">
          <div className="bg-accent text-white rounded-full p-2 shadow-lg shadow-accent/20">
            <PlusCircle size={24} />
          </div>
        </div>
        <span className="text-[10px] font-medium">Log</span>
      </button>

      {navItemsRight.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center gap-1 p-2 min-w-[64px] rounded-lg transition-colors",
              isActive ? "text-accent" : "text-text-secondary hover:text-text-primary"
            )
          }
        >
          <item.icon size={20} />
          <span className="text-[10px] font-medium">{item.label}</span>
        </NavLink>
      ))}
    </div>
  );
}
