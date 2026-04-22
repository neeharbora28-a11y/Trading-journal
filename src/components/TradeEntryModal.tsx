import React, { useState, useEffect, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Upload, Calculator, ArrowRight, Check, ChevronDown, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { useStore } from "@/store";
import { toast } from "sonner";
import { generateTradeReflection } from "../lib/ai";

export function TradeEntryModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const addTrade = useStore(state => state.addTrade);
  const updateTrade = useStore(state => state.updateTrade);
  const accounts = useStore(state => state.accounts);
  const selectedAccountId = useStore(state => state.selectedAccountId);
  const allTrades = useStore(state => state.trades);
  
  const currentAccount = accounts.find(a => a.id === selectedAccountId) || accounts[0];
  const accountTrades = allTrades.filter(t => t.accountId === selectedAccountId);
  const totalPnL = accountTrades.reduce((sum, t) => sum + t.result, 0);
  const accountBalance = (currentAccount?.startingBalance || 10000) + totalPnL;

  const [step, setStep] = useState(1);
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
    screenshot: '' as string
  });

  const [isRiskCalcExpanded, setIsRiskCalcExpanded] = useState(false);

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

  const canProceed = () => {
    if (step === 1) return formData.pair && formData.direction && formData.setupType;
    if (step === 2) return formData.entryPrice && formData.stopLoss && formData.takeProfit && formData.positionSize && formData.realizedPnL;
    if (step === 3) return true; // Screenshot is optional
    if (step === 4) return formData.emotion && formData.lesson;
    return false;
  };

  const handleSave = () => {
    const entry = parseFloat(formData.entryPrice);
    const tp = parseFloat(formData.takeProfit);
    const sl = parseFloat(formData.stopLoss);
    const realizedPnL = parseFloat(formData.realizedPnL);
    
    const rrValue = Math.abs((tp - entry) / (entry - sl));
    const result = isNaN(realizedPnL) ? 0 : realizedPnL;

    const tradeData = {
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

    toast.success("Trade saved successfully!");
    onOpenChange(false);

    // AI Reflection
    (async () => {
      const insight = await generateTradeReflection({ ...tradeData, id: newTradeId });
      updateTrade(newTradeId, { aiInsight: insight });
      toast.info("AI Coach Reflection", {
        description: insight,
        duration: 8000,
      });
    })();

    // Reset form after modal closes
    setTimeout(() => {
      setStep(1);
      setFormData({
        pair: '', direction: null, setupType: '', entryPrice: '', stopLoss: '', takeProfit: '', positionSize: '', realizedPnL: '', emotion: '', lesson: '', screenshot: ''
      });
    }, 300);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'Enter' && canProceed()) {
        e.preventDefault();
        if (step < 4) {
          setStep(s => s + 1);
        } else {
          handleSave();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, step, canProceed]);

  // Live Risk Calculator Logic
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
    // Simple heuristic: JPY pairs usually > 50, others < 50
    const multiplier = entry > 50 ? 100 : 10000;
    pips = diff * multiplier;
    // Assuming standard lot where 1 pip = $10
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
        <Dialog.Content className="fixed inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full md:max-w-4xl bg-surface border-0 md:border border-border rounded-none md:rounded-2xl shadow-2xl z-50 flex flex-col md:flex-row overflow-hidden">
          
          {/* Main Form Area */}
          <div className="flex-1 p-4 md:p-8 flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <Dialog.Title className="text-xl font-bold text-text-primary">Log New Trade</Dialog.Title>
              <Dialog.Close className="text-text-muted hover:text-text-primary transition-colors">
                <X size={20} />
              </Dialog.Close>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center gap-2 mb-8">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex-1 h-1.5 rounded-full bg-surface-hover overflow-hidden">
                  <div 
                    className={cn(
                      "h-full bg-accent transition-all duration-300",
                      step >= s ? "w-full" : "w-0"
                    )}
                  />
                </div>
              ))}
            </div>

            <div className="flex-1 relative">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div 
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    <h3 className="text-lg font-medium text-text-primary">Trade Basics</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-text-secondary mb-2">Pair</label>
                        <div className="relative">
                          <select 
                            value={formData.pair}
                            onChange={(e) => updateForm('pair', e.target.value)}
                            className="w-full bg-background border border-border rounded-lg px-4 py-3 md:py-2 text-base md:text-sm text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent appearance-none" 
                          >
                            <option value="" disabled>Select a pair</option>
                            <option value="EUR/USD">EUR/USD</option>
                            <option value="GBP/USD">GBP/USD</option>
                            <option value="BTC/USD">BTC/USD</option>
                            <option value="XAU/USD">XAU/USD</option>
                          </select>
                          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-text-secondary mb-2">Direction</label>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => updateForm('direction', 'long')}
                            className={cn(
                              "flex-1 py-3 md:py-2 rounded-lg border text-sm font-medium transition-colors",
                              formData.direction === 'long' ? "bg-profit-muted border-profit text-profit" : "bg-background border-border text-text-secondary hover:border-profit/50"
                            )}
                          >
                            Long
                          </button>
                          <button 
                            onClick={() => updateForm('direction', 'short')}
                            className={cn(
                              "flex-1 py-3 md:py-2 rounded-lg border text-sm font-medium transition-colors",
                              formData.direction === 'short' ? "bg-loss-muted border-loss text-loss" : "bg-background border-border text-text-secondary hover:border-loss/50"
                            )}
                          >
                            Short
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-text-secondary mb-2">Setup Type</label>
                      <div className="flex flex-wrap gap-2">
                        {['Break & Retest', 'Liquidity Sweep', 'Trend Continuation', 'Reversal'].map(setup => (
                          <button 
                            key={setup} 
                            onClick={() => updateForm('setupType', setup)}
                            className={cn(
                              "px-4 py-2.5 md:px-3 md:py-1.5 rounded-full border text-sm transition-colors",
                              formData.setupType === setup 
                                ? "bg-accent-muted border-accent text-accent" 
                                : "border-border bg-background text-text-secondary hover:border-accent hover:text-text-primary"
                            )}
                          >
                            {setup}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div 
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    <h3 className="text-lg font-medium text-text-primary">Risk Details</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm text-text-secondary mb-2">Entry Price</label>
                        <input 
                          type="number" 
                          placeholder="0.0000" 
                          value={formData.entryPrice}
                          onChange={(e) => updateForm('entryPrice', e.target.value)}
                          className="w-full bg-background border border-border rounded-lg px-4 py-3 md:py-2 text-base font-mono focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-text-primary" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-text-secondary mb-2">Stop Loss</label>
                        <input 
                          type="number" 
                          placeholder="0.0000" 
                          value={formData.stopLoss}
                          onChange={(e) => updateForm('stopLoss', e.target.value)}
                          className="w-full bg-background border border-border rounded-lg px-4 py-3 md:py-2 text-base font-mono focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-text-primary" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-text-secondary mb-2">Take Profit</label>
                        <input 
                          type="number" 
                          placeholder="0.0000" 
                          value={formData.takeProfit}
                          onChange={(e) => updateForm('takeProfit', e.target.value)}
                          className="w-full bg-background border border-border rounded-lg px-4 py-3 md:py-2 text-base font-mono focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-text-primary" 
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-text-secondary mb-2">Position Size (Lots)</label>
                        <input 
                          type="number" 
                          placeholder="1.0" 
                          value={formData.positionSize}
                          onChange={(e) => updateForm('positionSize', e.target.value)}
                          className="w-full bg-background border border-border rounded-lg px-4 py-3 md:py-2 text-base font-mono focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-text-primary" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-text-secondary mb-2">Realized P/L ($)</label>
                        <input 
                          type="number" 
                          placeholder="e.g. 150.50 or -50.00" 
                          value={formData.realizedPnL}
                          onChange={(e) => updateForm('realizedPnL', e.target.value)}
                          className="w-full bg-background border border-border rounded-lg px-4 py-3 md:py-2 text-base font-mono focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-text-primary" 
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div 
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    <h3 className="text-lg font-medium text-text-primary">Screenshot</h3>
                    
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/png, image/jpeg, image/gif"
                      className="hidden"
                    />

                    {formData.screenshot ? (
                      <div className="relative rounded-xl overflow-hidden group border border-border aspect-video bg-background">
                        <img 
                          src={formData.screenshot} 
                          alt="Trade Screenshot" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain" 
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                          <button 
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                          >
                            Replace
                          </button>
                          <button 
                            type="button"
                            onClick={handleRemoveImage}
                            className="p-2 bg-loss text-white rounded-lg hover:bg-red-600 transition-colors"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-border rounded-xl bg-background flex flex-col items-center justify-center py-12 hover:border-accent/50 hover:bg-accent-muted/10 transition-colors cursor-pointer group"
                      >
                        <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center text-text-muted group-hover:text-accent mb-4 transition-colors">
                          <Upload size={24} />
                        </div>
                        <p className="text-text-primary font-medium mb-1">Click to upload or drag and drop</p>
                        <p className="text-sm text-text-muted">PNG, JPG or GIF (max. 5MB)</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div 
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    <h3 className="text-lg font-medium text-text-primary">Reflection</h3>
                    
                    <div>
                      <label className="block text-sm text-text-secondary mb-2">Emotion at Entry</label>
                      <div className="flex flex-wrap gap-2">
                        {['Confident', 'Patient', 'Anxious', 'FOMO', 'Neutral'].map(emotion => (
                          <button 
                            key={emotion} 
                            onClick={() => updateForm('emotion', emotion)}
                            className={cn(
                              "px-4 py-2.5 md:px-3 md:py-1.5 rounded-full border text-sm transition-colors",
                              formData.emotion === emotion
                                ? "bg-accent-muted border-accent text-accent"
                                : "border-border bg-background text-text-secondary hover:border-accent hover:text-text-primary"
                            )}
                          >
                            {emotion}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-text-secondary mb-2">One-line lesson</label>
                      <input 
                        type="text" 
                        placeholder="What did you learn from this trade?" 
                        value={formData.lesson}
                        onChange={(e) => updateForm('lesson', e.target.value)}
                        className="w-full bg-background border border-border rounded-lg px-4 py-3 md:py-2 text-base md:text-sm text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent" 
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-between mt-auto pt-6 border-t border-border">
              <button 
                onClick={() => setStep(s => Math.max(1, s - 1))}
                className={cn(
                  "px-4 py-3 md:py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors",
                  step === 1 && "opacity-0 pointer-events-none"
                )}
              >
                Back
              </button>
              
              {step < 4 ? (
                <button 
                  onClick={() => setStep(s => Math.min(4, s + 1))}
                  disabled={!canProceed()}
                  className="bg-accent hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 md:py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                >
                  Next <ArrowRight size={16} />
                </button>
              ) : (
                <button 
                  onClick={handleSave}
                  disabled={!canProceed()}
                  className="bg-profit hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 md:py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                >
                  Save Trade <Check size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Mobile Risk Calculator Accordion */}
          <div className="md:hidden border-t border-border bg-surface shrink-0">
            <button 
              onClick={() => setIsRiskCalcExpanded(!isRiskCalcExpanded)}
              className="w-full p-4 flex justify-between items-center bg-surface-hover hover:bg-surface-active transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                  <Calculator size={18} />
                </div>
                <div className="text-left">
                  <div className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Risk Metric</div>
                  <div className="text-sm font-bold text-text-primary">
                    {lotSize > 0 ? lotSize.toFixed(2) : '0.00'} <span className="text-text-muted font-normal">Lots</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Risk</div>
                  <div className="text-xs font-mono text-loss">-${riskAmount.toFixed(2)}</div>
                </div>
                <motion.div
                  animate={{ rotate: isRiskCalcExpanded ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <ChevronDown size={18} className="text-text-muted" />
                </motion.div>
              </div>
            </button>

            <motion.div
              initial={false}
              animate={{ 
                height: isRiskCalcExpanded ? "auto" : 0,
                opacity: isRiskCalcExpanded ? 1 : 0
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden bg-background"
            >
              <div className="p-5 space-y-4 text-sm border-t border-border/50">
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-panel p-3">
                    <div className="text-[10px] text-text-muted uppercase mb-1">Account Balance</div>
                    <div className="font-mono text-text-primary">${accountBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                  </div>
                  <div className="glass-panel p-3">
                    <div className="text-[10px] text-text-muted uppercase mb-1">Stop Loss (Pips)</div>
                    <div className="font-mono text-text-primary">{pips > 0 ? pips.toFixed(1) : '0.0'}</div>
                  </div>
                  <div className="glass-panel p-3">
                    <div className="text-[10px] text-text-muted uppercase mb-1">Risk %</div>
                    <div className="font-mono text-text-primary">1.0%</div>
                  </div>
                  <div className="glass-panel p-3">
                    <div className="text-[10px] text-text-muted uppercase mb-1">RR Ratio</div>
                    <div className="font-mono text-profit">1:{rrRatio > 0 ? rrRatio.toFixed(2) : '0.00'}</div>
                  </div>
                </div>
                <div className="glass-panel p-3 bg-profit/5 border-profit/20">
                  <div className="text-[10px] text-text-muted uppercase mb-1">Potential Take Profit</div>
                  <div className="text-lg font-bold text-profit font-mono">+${potentialProfit > 0 ? potentialProfit.toFixed(2) : '0.00'}</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Desktop Risk Calculator Sidebar */}
          <div className="hidden md:flex w-64 bg-background border-l border-border p-6 flex-col">
            <div className="flex items-center gap-2 text-text-primary font-medium mb-6">
              <Calculator size={18} className="text-accent" />
              Live Risk Calc
            </div>

            <div className="space-y-4 flex-1">
              <div>
                <div className="text-xs text-text-muted mb-1">Account Balance</div>
                <div className="font-mono text-text-primary">${accountBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
              </div>
              
              <div className="h-px bg-border my-2"></div>

              <div>
                <div className="text-xs text-text-muted mb-1">Risk %</div>
                <div className="font-mono text-text-primary">{riskPercent.toFixed(1)}%</div>
              </div>

              <div>
                <div className="text-xs text-text-muted mb-1">Risk Amount</div>
                <div className="font-mono text-loss">-${riskAmount.toFixed(2)}</div>
              </div>

              <div className="h-px bg-border my-2"></div>

              <div>
                <div className="text-xs text-text-muted mb-1">Stop Loss (Pips)</div>
                <div className="font-mono text-text-primary">{pips > 0 ? pips.toFixed(1) : '0.0'}</div>
              </div>

              <div>
                <div className="text-xs text-text-muted mb-1">Suggested Lot Size</div>
                <div className="font-mono text-accent font-bold text-lg">{lotSize > 0 ? lotSize.toFixed(2) : '0.00'}</div>
              </div>

              <div className="h-px bg-border my-2"></div>

              <div>
                <div className="text-xs text-text-muted mb-1">Reward/Risk</div>
                <div className="font-mono text-text-primary">1:{rrRatio > 0 ? rrRatio.toFixed(2) : '0.00'}</div>
              </div>

              <div>
                <div className="text-xs text-text-muted mb-1">Potential Profit</div>
                <div className="font-mono text-profit">+${potentialProfit > 0 ? potentialProfit.toFixed(2) : '0.00'}</div>
              </div>
            </div>
          </div>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
