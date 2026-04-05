import { useState } from "react";
import { Filter, ChevronDown, ArrowUpRight, ArrowDownRight, Image as ImageIcon, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { useStore } from "@/store";

export function Journal() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"All" | "Wins" | "Losses">("All");
  const trades = useStore(state => state.trades);

  const filteredTrades = trades.filter(trade => {
    if (activeTab === "Wins") return trade.result > 0;
    if (activeTab === "Losses") return trade.result <= 0;
    return true;
  });

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Trading Journal</h1>
          <p className="text-sm text-text-secondary">Review your past trades and lessons learned.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => alert("Filters modal coming soon!")}
            className="flex items-center gap-2 px-3 py-1.5 bg-surface border border-border rounded-lg text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <Filter size={16} />
            Filters
          </button>
          <div className="flex bg-surface border border-border rounded-lg p-1">
            <button 
              onClick={() => setActiveTab("All")}
              className={cn("px-3 py-1 text-sm rounded transition-colors", activeTab === "All" ? "bg-surface-hover text-text-primary shadow-sm" : "text-text-secondary hover:text-text-primary")}
            >
              All
            </button>
            <button 
              onClick={() => setActiveTab("Wins")}
              className={cn("px-3 py-1 text-sm rounded transition-colors", activeTab === "Wins" ? "bg-surface-hover text-text-primary shadow-sm" : "text-text-secondary hover:text-text-primary")}
            >
              Wins
            </button>
            <button 
              onClick={() => setActiveTab("Losses")}
              className={cn("px-3 py-1 text-sm rounded transition-colors", activeTab === "Losses" ? "bg-surface-hover text-text-primary shadow-sm" : "text-text-secondary hover:text-text-primary")}
            >
              Losses
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-8 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
        {filteredTrades.map((trade) => (
          <div key={trade.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            {/* Timeline dot */}
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-surface shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
              {trade.direction === 'long' ? (
                <ArrowUpRight size={16} className="text-profit" />
              ) : (
                <ArrowDownRight size={16} className="text-loss" />
              )}
            </div>

            {/* Card */}
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 glass-panel hover:border-accent/50 transition-colors cursor-pointer"
                 onClick={() => setExpandedId(expandedId === trade.id ? null : trade.id)}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-text-primary">{trade.pair}</span>
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded uppercase font-medium",
                    trade.direction === 'long' ? "bg-profit-muted text-profit" : "bg-loss-muted text-loss"
                  )}>
                    {trade.direction}
                  </span>
                </div>
                <div className="text-xs text-text-muted">{trade.date}, {trade.entryTime}</div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-text-secondary">{trade.setup}</div>
                <div className={cn(
                  "font-mono font-semibold",
                  trade.result > 0 ? "text-profit" : "text-loss"
                )}>
                  {trade.result > 0 ? '+' : ''}${Math.abs(trade.result).toFixed(2)}
                </div>
              </div>

              <AnimatePresence>
                {expandedId === trade.id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                          <span className="text-text-muted block mb-1">Risk/Reward</span>
                          <span className="font-mono text-text-primary">{trade.rr}</span>
                        </div>
                        <div>
                          <span className="text-text-muted block mb-1">Emotion</span>
                          <span className="text-text-primary">{trade.emotion}</span>
                        </div>
                      </div>
                      
                      <div className="bg-surface-hover rounded-lg p-3 text-sm text-text-secondary mb-4">
                        <div className="flex items-center gap-2 mb-1 text-text-primary">
                          <MessageSquare size={14} /> Notes
                        </div>
                        {trade.notes}
                      </div>

                      <div className="flex items-center gap-3">
                        {trade.hasScreenshot && (
                          <button className="flex items-center gap-2 text-xs text-accent hover:text-indigo-400 transition-colors">
                            <ImageIcon size={14} /> View Screenshot
                          </button>
                        )}
                        <button className="ml-auto text-xs text-text-muted hover:text-text-primary transition-colors">
                          Edit Trade
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
