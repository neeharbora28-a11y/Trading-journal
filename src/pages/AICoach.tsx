import { useState } from "react";
import { Sparkles, BarChart3, ListChecks, Loader2, MessageSquare, AlertCircle } from "lucide-react";
import { useStore } from "../store";
import { generateWeeklySummary, detectTradingPatterns } from "../lib/ai";
import { toast } from "sonner";
import { motion } from "motion/react";

export default function AICoach() {
  const trades = useStore(state => state.trades);
  const dailyLogs = useStore(state => state.dailyLogs);
  const selectedAccountId = useStore(state => state.selectedAccountId);
  
  const [weeklySummary, setWeeklySummary] = useState<string | null>(null);
  const [patterns, setPatterns] = useState<string[] | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isDetectingPatterns, setIsDetectingPatterns] = useState(false);

  const accountTrades = trades.filter(t => t.accountId === selectedAccountId);

  const handleGenerateSummary = async () => {
    if (accountTrades.length === 0) {
      toast.error("No trades found for this account to analyze.");
      return;
    }
    setIsGeneratingSummary(true);
    try {
      const summary = await generateWeeklySummary(accountTrades, dailyLogs);
      setWeeklySummary(summary);
      toast.success("Weekly summary generated!");
    } catch (error) {
      toast.error("Failed to generate summary.");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleDetectPatterns = async () => {
    if (accountTrades.length < 5) {
      toast.error("Need at least 5 trades to detect significant patterns.");
      return;
    }
    setIsDetectingPatterns(true);
    try {
      const detected = await detectTradingPatterns(accountTrades);
      setPatterns(detected);
      toast.success("Patterns analyzed!");
    } catch (error) {
      toast.error("Failed to detect patterns.");
    } finally {
      setIsDetectingPatterns(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
          <Sparkles className="text-accent" size={32} />
          AI Trading Coach
        </h1>
        <p className="text-text-secondary italic">
          Leveraging Gemini intelligence to refine your trading edge.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weekly Summary Card */}
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col h-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-accent-muted text-accent">
              <BarChart3 size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary uppercase tracking-tight">Weekly Performance Review</h2>
              <p className="text-xs text-text-muted font-mono">Synthesis of execution & psychology</p>
            </div>
          </div>
          
          <div className="flex-1 bg-background/50 rounded-xl p-4 mb-6 min-h-[200px] border border-border/50">
            {weeklySummary ? (
              <div className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap font-sans italic">
                {weeklySummary}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-text-muted opacity-40">
                <MessageSquare size={48} className="mb-2" />
                <p className="text-sm italic">Analyze your week's work to see patterns between your mood and balance.</p>
              </div>
            )}
          </div>

          <button
            onClick={handleGenerateSummary}
            disabled={isGeneratingSummary || accountTrades.length === 0}
            className="w-full bg-accent hover:bg-accent/90 disabled:opacity-50 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98]"
          >
            {isGeneratingSummary ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
            {weeklySummary ? "Refining Report..." : "Generate Weekly Report"}
          </button>
        </div>

        {/* Pattern Detection Card */}
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col h-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-profit-muted text-profit">
              <ListChecks size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary uppercase tracking-tight">Behavioral Pattern Logs</h2>
              <p className="text-xs text-text-muted font-mono">Identifying recurring leakages</p>
            </div>
          </div>

          <div className="flex-1 bg-background/50 rounded-xl p-4 mb-6 min-h-[200px] border border-border/50">
            {patterns ? (
              <ul className="space-y-4">
                {patterns.map((pattern, i) => (
                  <motion.li 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-surface border border-border text-sm text-text-primary font-medium shadow-sm"
                  >
                    <div className="w-5 h-5 rounded-full bg-profit text-white flex items-center justify-center text-[10px] mt-0.5 shrink-0">
                      {i + 1}
                    </div>
                    {pattern}
                  </motion.li>
                ))}
              </ul>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-text-muted opacity-40">
                <AlertCircle size={48} className="mb-2" />
                <p className="text-sm italic italic">The AI requires at least 5 logged trades to effectively detect statistically significant habits.</p>
              </div>
            )}
          </div>

          <button
            onClick={handleDetectPatterns}
            disabled={isDetectingPatterns || accountTrades.length < 5}
            className="w-full bg-accent hover:bg-accent/90 disabled:opacity-50 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98]"
          >
            {isDetectingPatterns ? <Loader2 className="animate-spin" size={20} /> : <BarChart3 size={20} />}
            {patterns ? "Updating Analysis..." : "Detect Patterns"}
          </button>
        </div>
      </div>

      {/* Static Coaching Corner */}
      <div className="bg-surface border border-border rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
        <div className="relative z-10 space-y-4">
          <h3 className="text-xl font-bold text-text-primary italic">Coaching Philosophy</h3>
          <p className="text-text-secondary leading-relaxed">
            Trading is not about being right, it's about being disciplined. Our AI Coach analyzes the 
            intersections of your <span className="text-accent font-semibold">Psychology</span>, 
            <span className="text-profit font-semibold">Execution</span>, and <span className="text-loss font-semibold">Risk Management</span>.
            Use these reports to build self-awareness and eliminate emotional leakage from your trading process.
          </p>
        </div>
      </div>
    </div>
  );
}
