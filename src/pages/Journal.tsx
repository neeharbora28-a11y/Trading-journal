import { useState } from "react";
import { Filter, ChevronDown, ArrowUpRight, ArrowDownRight, Image as ImageIcon, MessageSquare } from "lucide-react";
import { cn, filterTradesByDateRange } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { useStore } from "@/store";
import { toast } from "sonner";

export function Journal() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"All" | "Wins" | "Losses">("All");
  const allTrades = useStore(state => state.trades);
  const selectedAccountId = useStore(state => state.selectedAccountId);
  const selectedDateRange = useStore(state => state.selectedDateRange);
  
  const accountTrades = allTrades.filter(t => t.accountId === selectedAccountId);
  const trades = filterTradesByDateRange(accountTrades, selectedDateRange);

  const filteredTrades = trades.filter(trade => {
    if (activeTab === "Wins") return trade.result > 0;
    if (activeTab === "Losses") return trade.result <= 0;
    return true;
  });

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Trading Journal</h1>
          <p className="text-sm text-text-secondary">Review your past trades and lessons learned.</p>
        </div>
        
        <div className="flex items-center gap-3 overflow-x-auto pb-2 sm:pb-0">
          <button 
            onClick={() => toast.info("Filters modal coming soon!")}
            className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-sm text-text-secondary hover:text-text-primary transition-colors whitespace-nowrap"
          >
            <Filter size={16} />
            Filters
          </button>
          <div className="flex bg-surface border border-border rounded-lg p-1 shrink-0">
            <button 
              onClick={() => setActiveTab("All")}
              className={cn("px-4 py-1.5 text-sm rounded transition-colors", activeTab === "All" ? "bg-surface-hover text-text-primary shadow-sm" : "text-text-secondary hover:text-text-primary")}
            >
              All
            </button>
            <button 
              onClick={() => setActiveTab("Wins")}
              className={cn("px-4 py-1.5 text-sm rounded transition-colors", activeTab === "Wins" ? "bg-surface-hover text-text-primary shadow-sm" : "text-text-secondary hover:text-text-primary")}
            >
              Wins
            </button>
            <button 
              onClick={() => setActiveTab("Losses")}
              className={cn("px-4 py-1.5 text-sm rounded transition-colors", activeTab === "Losses" ? "bg-surface-hover text-text-primary shadow-sm" : "text-text-secondary hover:text-text-primary")}
            >
              Losses
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredTrades.map((trade) => (
          <div key={trade.id} className="p-4 glass-panel hover:border-accent/50 transition-colors cursor-pointer"
               onClick={() => setExpandedId(expandedId === trade.id ? null : trade.id)}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full shrink-0",
                  trade.direction === 'long' ? "bg-profit-muted text-profit" : "bg-loss-muted text-loss"
                )}>
                  {trade.direction === 'long' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-text-primary">{trade.pair}</span>
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded uppercase font-medium",
                    trade.direction === 'long' ? "bg-profit-muted text-profit" : "bg-loss-muted text-loss"
                  )}>
                    {trade.direction}
                  </span>
                </div>
              </div>
              <div className="text-xs text-text-muted hidden sm:block">{trade.date}, {trade.entryTime}</div>
            </div>

            <div className="flex items-center justify-between ml-11">
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
                  className="overflow-hidden ml-11"
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

                    <div className="flex items-center gap-3 flex-wrap">
                      {trade.hasScreenshot && (
                        <button className="flex items-center gap-2 text-sm text-accent hover:text-indigo-400 transition-colors py-2 px-3 -ml-3">
                          <ImageIcon size={16} /> View Screenshot
                        </button>
                      )}
                      <button className="ml-auto text-sm text-text-muted hover:text-text-primary transition-colors py-2 px-3 -mr-3">
                        Edit Trade
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
