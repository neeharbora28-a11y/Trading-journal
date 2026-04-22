import React, { useState, useEffect, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Upload, Calculator, Check, ChevronDown, Trash2, ArrowUpRight, ArrowDownRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { useStore, Trade } from "@/store";
import { toast } from "sonner";
import { generateTradeReflection } from "../lib/ai";

export function QuickLog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const addTrade = useStore(state => state.addTrade);
  const updateTrade = useStore(state => state.updateTrade);
  const accounts = useStore(state => state.accounts);
  const selectedAccountId = useStore(state => state.selectedAccountId);
  const allTrades = useStore(state => state.trades);
  
  const currentAccount = accounts.find(a => a.id === selectedAccountId) || accounts[0];
  const accountTrades = allTrades.filter(t => t.accountId === selectedAccountId);
  const totalPnL = accountTrades.reduce((sum, t) => sum + t.result, 0);
  const accountBalance = (currentAccount?.startingBalance || 10000) + totalPnL;

  const [formData, setFormData] = useState({
    pair: '',
    direction: null as 'long' | 'short' | null,
    setupType: '',
    entryPrice: '',
    stopLoss: '',
    takeProfit: '',
    positionSize: '',
    realizedPnL: '',
    emotion: '',
    lesson: '',
    screenshot: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateForm = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size exceeds 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        updateForm('screenshot', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateForm('screenshot', '');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isValid = formData.pair && formData.direction && formData.setupType && formData.entryPrice && formData.stopLoss && formData.takeProfit && formData.positionSize && formData.realizedPnL && formData.emotion && formData.lesson;

  const handleSave = () => {
    const entry = parseFloat(formData.entryPrice);
    const tp = parseFloat(formData.takeProfit);
    const sl = parseFloat(formData.stopLoss);
    const realizedPnL = parseFloat(formData.realizedPnL);
    
    const rrValue = Math.abs((tp - entry) / (entry - sl));
    const result = isNaN(realizedPnL) ? 0 : realizedPnL;

    const tradeData: Omit<Trade, 'id'> = {
      accountId: selectedAccountId,
      pair: formData.pair,
      direction: formData.direction!,
      setup: formData.setupType,
      entryTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString('en-CA'),
      result: result,
      rr: `1:${rrValue.toFixed(1)}`,
      emotion: formData.emotion,
      notes: formData.lesson,
      screenshot: formData.screenshot || undefined,
      timestamp: Date.now(),
    };

    const newTradeId = addTrade(tradeData);

    toast.success("Quick Log saved!");
    onOpenChange(false);

    // AI Reflection
    (async () => {
      const insight = await generateTradeReflection({ ...tradeData, id: newTradeId } as Trade);
      updateTrade(newTradeId, { aiInsight: insight });
      toast.info("AI Coach Reflection", {
        description: insight,
        duration: 8000,
      });
    })();

    // Reset form after modal closes
    setTimeout(() => {
      setFormData({
        pair: '', direction: null, setupType: '', entryPrice: '', stopLoss: '', takeProfit: '', positionSize: '', realizedPnL: '', emotion: '', lesson: '', screenshot: ''
      });
    }, 300);
  };

  // Risk Calculator logic
  const entry = parseFloat(formData.entryPrice);
  const sl = parseFloat(formData.stopLoss);
  const tp = parseFloat(formData.takeProfit);
  
  let pips = 0;
  let lotSize = 0;
  let rrRatio = 0;
  let potentialProfit = 0;
  const riskPercent = 1.0;
  const riskAmount = accountBalance * (riskPercent / 100);
  
  if (!isNaN(entry) && !isNaN(sl)) {
    const diff = Math.abs(entry - sl);
    const multiplier = entry > 50 ? 100 : 10000;
    pips = diff * multiplier;
    lotSize = pips > 0 ? riskAmount / (pips * 10) : 0;
    
    if (!isNaN(tp)) {
      const tpDiff = Math.abs(tp - entry);
      rrRatio = diff > 0 ? tpDiff / diff : 0;
      potentialProfit = riskAmount * rrRatio;
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity" />
        <Dialog.Content className="fixed inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full md:max-w-5xl md:h-[80vh] bg-surface border-0 md:border border-border rounded-none md:rounded-2xl shadow-2xl z-50 flex flex-col md:flex-row overflow-hidden">
          
          <div className="flex-1 p-4 md:p-8 flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <Dialog.Title className="text-xl font-bold text-text-primary">Quick Log</Dialog.Title>
                <p className="text-sm text-text-secondary">Single-tap entry for speed.</p>
              </div>
              <Dialog.Close className="text-text-muted hover:text-text-primary transition-colors">
                <X size={20} />
              </Dialog.Close>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Form */}
              <div className="space-y-6">
                {/* Pair & Direction */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase mb-2">Market Pair</label>
                    <div className="relative">
                      <select 
                        value={formData.pair}
                        onChange={(e) => updateForm('pair', e.target.value)}
                        className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent appearance-none"
                      >
                        <option value="" disabled>Select pair...</option>
                        <option value="EUR/USD">EUR/USD</option>
                        <option value="GBP/USD">GBP/USD</option>
                        <option value="BTC/USD">BTC/USD</option>
                        <option value="XAU/USD">XAU/USD</option>
                        <option value="USD/JPY">USD/JPY</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase mb-2">Direction</label>
                    <div className="flex gap-1.5 p-1 bg-background rounded-lg border border-border">
                      <button 
                        onClick={() => updateForm('direction', 'long')}
                        className={cn(
                          "flex-1 py-1.5 rounded-md text-xs font-bold transition-all",
                          formData.direction === 'long' ? "bg-profit text-white shadow-lg shadow-profit/20" : "text-text-secondary hover:text-text-primary"
                        )}
                      >
                        Long
                      </button>
                      <button 
                        onClick={() => updateForm('direction', 'short')}
                        className={cn(
                          "flex-1 py-1.5 rounded-md text-xs font-bold transition-all",
                          formData.direction === 'short' ? "bg-loss text-white shadow-lg shadow-loss/20" : "text-text-secondary hover:text-text-primary"
                        )}
                      >
                        Short
                      </button>
                    </div>
                  </div>
                </div>

                {/* Entry/SL/TP */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase mb-2">Entry</label>
                    <input 
                      type="number" 
                      placeholder="0.00" 
                      value={formData.entryPrice}
                      onChange={(e) => updateForm('entryPrice', e.target.value)}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm font-mono text-text-primary focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase mb-2 text-loss">SL</label>
                    <input 
                      type="number" 
                      placeholder="0.00" 
                      value={formData.stopLoss}
                      onChange={(e) => updateForm('stopLoss', e.target.value)}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm font-mono text-text-primary focus:outline-none focus:border-loss"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase mb-2 text-profit">TP</label>
                    <input 
                      type="number" 
                      placeholder="0.00" 
                      value={formData.takeProfit}
                      onChange={(e) => updateForm('takeProfit', e.target.value)}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm font-mono text-text-primary focus:outline-none focus:border-profit"
                    />
                  </div>
                </div>

                {/* Size & Result */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase mb-2">Lots</label>
                    <input 
                      type="number" 
                      placeholder="1.00" 
                      value={formData.positionSize}
                      onChange={(e) => updateForm('positionSize', e.target.value)}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm font-mono text-text-primary focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase mb-2">PnL ($)</label>
                    <input 
                      type="number" 
                      placeholder="0.00" 
                      value={formData.realizedPnL}
                      onChange={(e) => updateForm('realizedPnL', e.target.value)}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm font-mono text-text-primary focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                {/* Emotion & Setup */}
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase mb-2">Setup & State</label>
                  <div className="flex gap-2 mb-3">
                    <select 
                      value={formData.setupType}
                      onChange={(e) => updateForm('setupType', e.target.value)}
                      className="flex-1 bg-background border border-border rounded-lg px-4 py-2 text-xs text-text-primary focus:outline-none"
                    >
                      <option value="" disabled>Select setup...</option>
                      <option value="Break & Retest">Break & Retest</option>
                      <option value="Liquidity Sweep">Liquidity Sweep</option>
                      <option value="Trend Continuation">Trend Continuation</option>
                      <option value="Reversal">Reversal</option>
                    </select>
                    <select 
                      value={formData.emotion}
                      onChange={(e) => updateForm('emotion', e.target.value)}
                      className="flex-1 bg-background border border-border rounded-lg px-4 py-2 text-xs text-text-primary focus:outline-none"
                    >
                      <option value="" disabled>How'd you feel?</option>
                      <option value="Confident">Confident</option>
                      <option value="Anxious">Anxious</option>
                      <option value="FOMO">FOMO</option>
                      <option value="Neutral">Neutral</option>
                    </select>
                  </div>
                  <input 
                    type="text"
                    placeholder="Key lesson learned..."
                    value={formData.lesson}
                    onChange={(e) => updateForm('lesson', e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Right Column: Sidebar & Screenshot */}
              <div className="space-y-6">
                {/* Desktop Risk Calc (Inline) */}
                <div className="bg-background rounded-xl border border-border p-5 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-text-muted uppercase mb-2">
                    <Calculator size={14} className="text-accent" />
                    Live Metrics
                  </div>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                    <div>
                      <div className="text-[10px] text-text-muted uppercase mb-0.5 tracking-wider">Account Balance</div>
                      <div className="font-mono text-sm text-text-primary">${accountBalance.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-text-muted uppercase mb-0.5 tracking-wider">Risk Amount</div>
                      <div className="font-mono text-sm text-loss">-${riskAmount.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-text-muted uppercase mb-0.5 tracking-wider">Stop (Pips)</div>
                      <div className="font-mono text-sm text-text-primary">{pips.toFixed(1)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-text-muted uppercase mb-0.5 tracking-wider">RR Ratio</div>
                      <div className="font-mono text-sm text-profit font-bold">1:{rrRatio.toFixed(1)}</div>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-border/50">
                    <div className="text-[10px] text-text-muted uppercase mb-1 tracking-wider">Recommended Size</div>
                    <div className="text-2xl font-bold text-accent font-mono">{lotSize > 0 ? lotSize.toFixed(2) : '0.00'} <span className="text-xs font-normal opacity-50">Lots</span></div>
                  </div>
                </div>

                {/* Screenshot Area (Compact) */}
                <div className="relative">
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                  {formData.screenshot ? (
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-border group bg-background">
                      <img src={formData.screenshot} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 p-1.5 bg-loss text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full aspect-video rounded-xl border border-dashed border-border flex flex-col items-center justify-center gap-2 hover:border-accent hover:bg-accent-muted/10 transition-colors group"
                    >
                      <Upload size={20} className="text-text-muted group-hover:text-accent transition-colors" />
                      <span className="text-xs text-text-muted group-hover:text-text-primary">Attach Screenshot</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-auto pt-6 flex items-center justify-between border-t border-border">
              <div className="text-xs text-text-muted italic flex items-center gap-1.5">
                <Sparkles size={12} className="text-accent" />
                AI reflection will generate after saving.
              </div>
              <button 
                onClick={handleSave}
                disabled={!isValid}
                className="bg-accent hover:bg-accent/90 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-accent/20 active:scale-95"
              >
                Save Trade <Check size={18} />
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
