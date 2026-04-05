import { useState } from "react";
import { Plus, Search, Image as ImageIcon, Target, Activity, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/store";

export function SetupLibrary() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const setups = useStore(state => state.setups);
  const categories = ["All", "Breakout", "Reversal", "Trend", "Range"];

  const filteredSetups = setups.filter(setup => {
    const matchesCategory = activeCategory === "All" || setup.category === activeCategory;
    const matchesSearch = setup.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          setup.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Setup Library</h1>
          <p className="text-sm text-text-secondary">Define and catalog your high-probability trading patterns.</p>
        </div>
        <button 
          onClick={() => alert("New Setup modal coming soon!")}
          className="bg-accent hover:bg-indigo-400 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-lg shadow-accent/20"
        >
          <Plus size={16} />
          New Setup
        </button>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search setups..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
          />
        </div>
        <div className="flex bg-surface border border-border rounded-lg p-1">
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-4 py-1.5 text-sm rounded transition-colors",
                activeCategory === cat 
                  ? "bg-surface-hover text-text-primary shadow-sm" 
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {filteredSetups.length > 0 ? (
          filteredSetups.map(setup => (
            <div key={setup.id} className="glass-panel p-0 overflow-hidden flex flex-col group cursor-pointer hover:border-accent/50 transition-colors">
              <div className="h-48 bg-surface-hover relative flex items-center justify-center border-b border-border overflow-hidden">
                {/* Subtle grid background for chart placeholder */}
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(var(--color-border) 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.5 }}></div>
                <div className="relative z-10 flex flex-col items-center text-text-muted group-hover:text-accent transition-colors duration-300">
                  <ImageIcon size={32} className="mb-2 opacity-50" />
                  <span className="text-xs font-medium uppercase tracking-wider">Example Chart</span>
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-text-primary">{setup.name}</h3>
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-surface border border-border text-text-secondary">
                        {setup.category}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary line-clamp-2">{setup.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-background rounded-lg p-3 border border-border">
                    <div className="text-xs text-text-muted mb-1 flex items-center gap-1"><Target size={12}/> Win Rate</div>
                    <div className="text-lg font-mono font-semibold text-profit">{setup.winRate}</div>
                  </div>
                  <div className="bg-background rounded-lg p-3 border border-border">
                    <div className="text-xs text-text-muted mb-1 flex items-center gap-1"><Activity size={12}/> Profit Factor</div>
                    <div className="text-lg font-mono font-semibold text-text-primary">{setup.profitFactor}</div>
                  </div>
                </div>

                <div className="mt-auto">
                  <h4 className="text-xs font-medium text-text-primary uppercase tracking-wider mb-3 flex items-center gap-2">
                    <BookOpen size={14} className="text-accent"/> Key Rules
                  </h4>
                  <ul className="space-y-2">
                    {setup.rules.map((rule, idx) => (
                      <li key={idx} className="text-sm text-text-secondary flex items-start gap-2">
                        <span className="text-accent mt-0.5">•</span>
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 py-12 text-center text-text-muted">
            No setups found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}
