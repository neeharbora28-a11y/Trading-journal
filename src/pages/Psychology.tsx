import { useState, useEffect } from "react";
import { Brain, Target, AlertCircle, TrendingUp } from "lucide-react";
import * as Slider from "@radix-ui/react-slider";
import { useStore } from "@/store";
import { toast } from "sonner";

export function Psychology() {
  const saveDailyLog = useStore(state => state.saveDailyLog);
  const dailyLogs = useStore(state => state.dailyLogs);
  const today = new Date().toISOString().split('T')[0];
  
  const [sliders, setSliders] = useState({
    confidence: 7,
    discipline: 8,
    patience: 6,
    fomo: 3,
    stress: 4,
  });
  
  const [notes, setNotes] = useState("Tend to move stop loss to breakeven too early when anxious. Need to trust the original invalidation level.");

  useEffect(() => {
    const todayLog = dailyLogs.find(l => l.date === today);
    if (todayLog) {
      setSliders({
        confidence: todayLog.confidence,
        discipline: todayLog.discipline,
        patience: todayLog.patience,
        fomo: todayLog.fomo,
        stress: todayLog.stress,
      });
      setNotes(todayLog.notes);
    }
  }, [dailyLogs, today]);

  const handleSave = () => {
    saveDailyLog({
      date: today,
      ...sliders,
      notes
    });
    toast.success("Daily log saved successfully!");
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Psychology</h1>
          <p className="text-sm text-text-secondary">Track your mental state and behavioral patterns.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Behaviour Score */}
        <div className="glass-panel p-6 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-accent-muted flex items-center justify-center text-accent mb-4">
            <Brain size={32} />
          </div>
          <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider mb-2">Behaviour Score</h3>
          <div className="text-5xl font-bold text-text-primary font-mono mb-2">82</div>
          <div className="text-sm text-profit flex items-center gap-1">
            <TrendingUp size={14} /> +5 pts this week
          </div>
        </div>

        {/* AI Summary */}
        <div className="glass-panel p-6 col-span-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
            <Target size={16} className="text-accent" />
            AI Insight
          </h3>
          <p className="text-lg text-text-primary leading-relaxed">
            "This week you <span className="text-loss font-medium">overtraded during the London session</span> and underperformed on impulsive entries. However, your <span className="text-profit font-medium">patience on Break & Retest setups</span> improved significantly, yielding your best results."
          </p>
        </div>

        {/* Mood Tracker */}
        <div className="glass-panel p-6 col-span-2">
          <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider mb-6">Daily Mood Tracker</h3>
          
          <div className="space-y-6">
            {Object.entries(sliders).map(([key, value]) => (
              <div key={key}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="capitalize text-text-primary font-medium">{key}</span>
                  <span className="text-text-muted font-mono">{value}/10</span>
                </div>
                <Slider.Root
                  className="relative flex items-center select-none touch-none w-full h-5"
                  value={[value]}
                  max={10}
                  step={1}
                  onValueChange={(val) => setSliders(s => ({ ...s, [key]: val[0] }))}
                >
                  <Slider.Track className="bg-surface-hover relative grow rounded-full h-2">
                    <Slider.Range className="absolute bg-accent rounded-full h-full" />
                  </Slider.Track>
                  <Slider.Thumb
                    className="block w-5 h-5 bg-white shadow-md rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-accent transition-colors cursor-grab active:cursor-grabbing"
                    aria-label={key}
                  />
                </Slider.Root>
              </div>
            ))}
          </div>
          
          <div className="mt-8 flex justify-end">
            <button 
              onClick={handleSave}
              className="bg-surface hover:bg-surface-hover border border-border text-text-primary px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Save Daily Log
            </button>
          </div>
        </div>

        {/* Notes Widget */}
        <div className="glass-panel p-6 flex flex-col">
          <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
            <AlertCircle size={16} className="text-caution" />
            Pattern Notes
          </h3>
          <textarea 
            className="flex-1 bg-surface border border-border rounded-lg p-3 text-sm text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all resize-none"
            placeholder="E.g., Revenge trading after 2 consecutive losses..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
