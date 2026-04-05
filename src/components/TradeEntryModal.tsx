import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Upload, Calculator, ArrowRight, Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { useStore } from "@/store";

export function TradeEntryModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const addTrade = useStore(state => state.addTrade);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    pair: '',
    direction: null as 'long' | 'short' | null,
    setupType: '',
    entryPrice: '',
    stopLoss: '',
    takeProfit: '',
    positionSize: '',
    emotion: '',
    lesson: ''
  });

  const updateForm = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    if (step === 1) return formData.pair && formData.direction && formData.setupType;
    if (step === 2) return formData.entryPrice && formData.stopLoss && formData.takeProfit && formData.positionSize;
    if (step === 3) return true; // Screenshot is optional
    if (step === 4) return formData.emotion && formData.lesson;
    return false;
  };

  const handleSave = () => {
    const entry = parseFloat(formData.entryPrice);
    const tp = parseFloat(formData.takeProfit);
    const sl = parseFloat(formData.stopLoss);
    
    // Simple mock result calculation based on TP/SL
    // If direction is long, and it hits TP, result is positive.
    // We'll just mock a positive result for now, or random.
    const isWin = Math.random() > 0.5;
    const riskAmount = 106.50; // from the calculator
    const rrValue = Math.abs((tp - entry) / (entry - sl));
    const result = isWin ? riskAmount * rrValue : -riskAmount;

    addTrade({
      pair: formData.pair,
      direction: formData.direction!,
      setup: formData.setupType,
      entryTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toISOString().split('T')[0],
      result: result,
      rr: `1:${rrValue.toFixed(1)}`,
      emotion: formData.emotion,
      notes: formData.lesson,
      hasScreenshot: false,
    });

    alert("Trade saved successfully!");
    onOpenChange(false);
    // Reset form after modal closes
    setTimeout(() => {
      setStep(1);
      setFormData({
        pair: '', direction: null, setupType: '', entryPrice: '', stopLoss: '', takeProfit: '', positionSize: '', emotion: '', lesson: ''
      });
    }, 300);
  };

  // Live Risk Calculator Logic
  const entry = parseFloat(formData.entryPrice);
  const sl = parseFloat(formData.stopLoss);
  let pips = 0;
  let lotSize = 0;
  
  if (!isNaN(entry) && !isNaN(sl)) {
    const diff = Math.abs(entry - sl);
    // Simple heuristic: JPY pairs usually > 50, others < 50
    const multiplier = entry > 50 ? 100 : 10000;
    pips = diff * multiplier;
    // Assuming standard lot where 1 pip = $10
    lotSize = pips > 0 ? 106.50 / (pips * 10) : 0;
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl bg-surface border border-border rounded-2xl shadow-2xl z-50 flex overflow-hidden">
          
          {/* Main Form Area */}
          <div className="flex-1 p-8 flex flex-col">
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
                            className="w-full bg-background border border-border rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent appearance-none" 
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
                              "flex-1 py-2 rounded-lg border text-sm font-medium transition-colors",
                              formData.direction === 'long' ? "bg-profit-muted border-profit text-profit" : "bg-background border-border text-text-secondary hover:border-profit/50"
                            )}
                          >
                            Long
                          </button>
                          <button 
                            onClick={() => updateForm('direction', 'short')}
                            className={cn(
                              "flex-1 py-2 rounded-lg border text-sm font-medium transition-colors",
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
                              "px-3 py-1.5 rounded-full border text-sm transition-colors",
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
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm text-text-secondary mb-2">Entry Price</label>
                        <input 
                          type="number" 
                          placeholder="0.0000" 
                          value={formData.entryPrice}
                          onChange={(e) => updateForm('entryPrice', e.target.value)}
                          className="w-full bg-background border border-border rounded-lg px-4 py-2 text-text-primary font-mono focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-text-secondary mb-2">Stop Loss</label>
                        <input 
                          type="number" 
                          placeholder="0.0000" 
                          value={formData.stopLoss}
                          onChange={(e) => updateForm('stopLoss', e.target.value)}
                          className="w-full bg-background border border-border rounded-lg px-4 py-2 text-text-primary font-mono focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-text-secondary mb-2">Take Profit</label>
                        <input 
                          type="number" 
                          placeholder="0.0000" 
                          value={formData.takeProfit}
                          onChange={(e) => updateForm('takeProfit', e.target.value)}
                          className="w-full bg-background border border-border rounded-lg px-4 py-2 text-text-primary font-mono focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent" 
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-text-secondary mb-2">Position Size (Lots)</label>
                      <input 
                        type="number" 
                        placeholder="1.0" 
                        value={formData.positionSize}
                        onChange={(e) => updateForm('positionSize', e.target.value)}
                        className="w-1/3 bg-background border border-border rounded-lg px-4 py-2 text-text-primary font-mono focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent" 
                      />
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
                    
                    <div className="border-2 border-dashed border-border rounded-xl bg-background flex flex-col items-center justify-center py-12 hover:border-accent/50 hover:bg-accent-muted/10 transition-colors cursor-pointer group">
                      <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center text-text-muted group-hover:text-accent mb-4 transition-colors">
                        <Upload size={24} />
                      </div>
                      <p className="text-text-primary font-medium mb-1">Click to upload or drag and drop</p>
                      <p className="text-sm text-text-muted">SVG, PNG, JPG or GIF (max. 5MB)</p>
                    </div>
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
                              "px-3 py-1.5 rounded-full border text-sm transition-colors",
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
                        className="w-full bg-background border border-border rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent" 
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <button 
                onClick={() => setStep(s => Math.max(1, s - 1))}
                className={cn(
                  "px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors",
                  step === 1 && "opacity-0 pointer-events-none"
                )}
              >
                Back
              </button>
              
              {step < 4 ? (
                <button 
                  onClick={() => setStep(s => Math.min(4, s + 1))}
                  disabled={!canProceed()}
                  className="bg-accent hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                >
                  Next <ArrowRight size={16} />
                </button>
              ) : (
                <button 
                  onClick={handleSave}
                  disabled={!canProceed()}
                  className="bg-profit hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                >
                  Save Trade <Check size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Risk Calculator Sidebar */}
          <div className="w-64 bg-background border-l border-border p-6 flex flex-col">
            <div className="flex items-center gap-2 text-text-primary font-medium mb-6">
              <Calculator size={18} className="text-accent" />
              Live Risk Calc
            </div>

            <div className="space-y-4 flex-1">
              <div>
                <div className="text-xs text-text-muted mb-1">Account Balance</div>
                <div className="font-mono text-text-primary">$10,650.00</div>
              </div>
              
              <div className="h-px bg-border my-2"></div>

              <div>
                <div className="text-xs text-text-muted mb-1">Risk %</div>
                <div className="font-mono text-text-primary">1.0%</div>
              </div>

              <div>
                <div className="text-xs text-text-muted mb-1">Risk Amount</div>
                <div className="font-mono text-loss">-$106.50</div>
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
            </div>
          </div>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
