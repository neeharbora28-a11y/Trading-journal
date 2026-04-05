import { useState } from "react";
import { Filter, ChevronDown, ArrowUpRight, ArrowDownRight, Image as ImageIcon, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

const mockTrades = [
  {
    id: "1",
    pair: "GBP/JPY",
    direction: "long",
    setup: "Break & Retest",
    entryTime: "10:30 AM",
    date: "Today",
    result: 320.50,
    rr: "1:2.5",
    emotion: "Confident",
    notes: "Waited for the 15m candle to close above the key level. Perfect execution.",
    hasScreenshot: true,
  },
  {
    id: "2",
    pair: "EUR/USD",
    direction: "short",
    setup: "Liquidity Sweep",
    entryTime: "08:15 AM",
    date: "Today",
    result: -150.00,
    rr: "1:1",
    emotion: "FOMO",
    notes: "Entered too early before the sweep was confirmed. Need to wait for the close.",
    hasScreenshot: false,
  },
  {
    id: "3",
    pair: "XAU/USD",
    direction: "long",
    setup: "Trend Continuation",
    entryTime: "02:45 PM",
    date: "Yesterday",
    result: 850.00,
    rr: "1:4",
    emotion: "Patient",
    notes: "Held through the pullback. Trailed stop loss perfectly.",
    hasScreenshot: true,
  }
];

export function Journal() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Trading Journal</h1>
          <p className="text-sm text-text-secondary">Review your past trades and lessons learned.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-surface border border-border rounded-lg text-sm text-text-secondary hover:text-text-primary transition-colors">
            <Filter size={16} />
            Filters
          </button>
          <div className="flex bg-surface border border-border rounded-lg p-1">
            <button className="px-3 py-1 text-sm bg-surface-hover text-text-primary rounded shadow-sm">All</button>
            <button className="px-3 py-1 text-sm text-text-secondary hover:text-text-primary rounded">Wins</button>
            <button className="px-3 py-1 text-sm text-text-secondary hover:text-text-primary rounded">Losses</button>
          </div>
        </div>
      </div>

      <div className="space-y-8 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
        {mockTrades.map((trade) => (
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
