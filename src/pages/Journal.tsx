import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Filter, ChevronDown, ArrowUpRight, ArrowDownRight, Image as ImageIcon, MessageSquare, X, Zap } from "lucide-react";
import { cn, filterTradesByDateRange } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { useStore } from "@/store";
import { toast } from "sonner";

export function Journal() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"All" | "Wins" | "Losses">("All");
  const allTrades = useStore(state => state.trades);
  const selectedAccountId = useStore(state => state.selectedAccountId);
  const selectedDateRange = useStore(state => state.selectedDateRange);
  const setQuickLogOpen = useStore(state => state.setQuickLogOpen);
  
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

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setQuickLogOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-lg text-sm font-bold transition-all shadow-md active:scale-95"
          >
            <Zap size={14} />
            Quick Log
          </button>
          
          <div className="flex items-center gap-3 overflow-x-auto">
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
      </div>

      <div className="space-y-4">
        {filteredTrades.map((trade) => (
          <motion.div 
            key={trade.id} 
            whileTap={{ scale: 0.98 }}
            className={cn(
              "glass-panel transition-all cursor-pointer overflow-hidden border-border",
              expandedId === trade.id ? "border-accent ring-1 ring-accent/20 shadow-lg" : "hover:border-accent/40"
            )}
            onClick={() => setExpandedId(expandedId === trade.id ? null : trade.id)}
          >
            {/* Card Header/Trigger */}
            <div className="p-5 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-xl shrink-0 transition-colors",
                    trade.direction === 'long' ? "bg-profit/10 text-profit" : "bg-loss/10 text-loss"
                  )}>
                    {trade.direction === 'long' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-lg md:text-xl font-extrabold text-text-primary tracking-tight">{trade.pair}</span>
                      <span className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-widest border",
                        trade.direction === 'long' ? "bg-profit/10 border-profit/20 text-profit" : "bg-loss/10 border-loss/20 text-loss"
                      )}>
                        {trade.direction}
                      </span>
                    </div>
                    <div className="text-xs text-text-muted">
                      {trade.date} • {trade.entryTime}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-1">
                  <div className={cn(
                    "text-lg md:text-xl font-black font-mono tracking-tighter",
                    trade.result > 0 ? "text-profit" : "text-loss"
                  )}>
                    {trade.result > 0 ? '+' : ''}${Math.abs(trade.result).toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </div>
                  <motion.div
                    animate={{ rotate: expandedId === trade.id ? 180 : 0 }}
                    className="w-10 h-10 -mr-2 -mb-2 flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
                  >
                    <ChevronDown size={20} />
                  </motion.div>
                </div>
              </div>

              <div className="flex items-center justify-between pl-14">
                <span className="text-sm font-medium text-text-secondary">{trade.setup}</span>
                <span className="text-xs font-mono text-text-muted">ID: {trade.id.slice(0, 8)}</span>
              </div>
            </div>

            <AnimatePresence>
              {expandedId === trade.id && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <div className="px-5 pb-6 md:px-6 md:pb-8 pt-0 space-y-6">
                    <div className="h-px bg-border/50 w-full" />
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="bg-surface-hover/50 p-3 rounded-xl border border-border/50">
                        <span className="text-[10px] text-text-muted block mb-1 uppercase font-bold tracking-wider">Risk/Reward</span>
                        <span className="font-mono text-base font-bold text-text-primary">{trade.rr}</span>
                      </div>
                      <div className="bg-surface-hover/50 p-3 rounded-xl border border-border/50">
                        <span className="text-[10px] text-text-muted block mb-1 uppercase font-bold tracking-wider">Emotion</span>
                        <span className="text-base font-bold text-text-primary">{trade.emotion}</span>
                      </div>
                      <div className="bg-surface-hover/50 p-3 rounded-xl border border-border/50">
                        <span className="text-[10px] text-text-muted block mb-1 uppercase font-bold tracking-wider">Lots</span>
                        <span className="font-mono text-base font-bold text-text-primary">1.00</span>
                      </div>
                      <div className="bg-surface-hover/50 p-3 rounded-xl border border-border/50">
                        <span className="text-[10px] text-text-muted block mb-1 uppercase font-bold tracking-wider">Points</span>
                        <span className="font-mono text-base font-bold text-text-primary">12.5</span>
                      </div>
                    </div>
                    
                    <div className="bg-background/50 border border-border rounded-2xl p-4 md:p-5 text-sm leading-relaxed text-text-secondary relative group transition-colors hover:bg-background">
                      <div className="flex items-center gap-2 mb-3 text-text-primary font-bold uppercase text-[10px] tracking-widest">
                        <MessageSquare size={14} className="text-accent" /> Notes & Reflection
                      </div>
                      <p className="italic text-base">{trade.notes}</p>
                    </div>

                    {trade.screenshot && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-text-primary font-bold uppercase text-[10px] tracking-widest">
                          <ImageIcon size={14} className="text-accent" /> Chart Analysis
                        </div>
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedScreenshot(trade.screenshot!);
                          }}
                          className="relative w-full aspect-video md:aspect-[21/9] rounded-2xl overflow-hidden border border-border group cursor-zoom-in bg-background shadow-inner"
                        >
                          <img 
                            src={trade.screenshot} 
                            alt="Trade Screenshot" 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 text-white text-xs font-bold flex items-center gap-2">
                              <ImageIcon size={16} /> View Full Detail
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-4 pt-4">
                      <button 
                        onClick={(e) => { e.stopPropagation(); toast.info("Modify mode active"); }}
                        className="flex-1 md:flex-none h-12 px-6 bg-surface border border-border hover:border-accent/50 text-text-primary rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                      >
                        Edit Trade
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); toast.error("Coming soon"); }}
                        className="flex-1 md:flex-none h-12 px-6 border border-loss/20 hover:bg-loss/10 text-loss rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
      <Dialog.Root open={!!selectedScreenshot} onOpenChange={(open) => !open && setSelectedScreenshot(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] animate-in fade-in duration-300" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[90vw] max-h-[90vh] z-[101] flex items-center justify-center outline-none">
            <Dialog.Close className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors p-2 bg-white/10 rounded-full backdrop-blur-md">
              <X size={24} />
            </Dialog.Close>
            {selectedScreenshot && (
              <img 
                src={selectedScreenshot} 
                alt="Trade Screenshot Full" 
                referrerPolicy="no-referrer"
                className="max-w-full max-h-full object-contain shadow-2xl rounded-lg animate-in zoom-in-95 duration-300" 
              />
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

    </div>
  );
}
