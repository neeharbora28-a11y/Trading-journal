import { useState, useEffect } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Target, 
  Clock, 
  AlertTriangle,
  Zap,
  Plus,
  RefreshCw,
  ArrowDown
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts";
import { useStore } from "@/store";
import { filterTradesByDateRange, cn } from "@/lib/utils";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { toast } from "sonner";

export function Dashboard() {
  const allTrades = useStore(state => state.trades);
  const accounts = useStore(state => state.accounts);
  const selectedAccountId = useStore(state => state.selectedAccountId);
  const selectedDateRange = useStore(state => state.selectedDateRange);
  const setTradeModalOpen = useStore(state => state.setTradeModalOpen);
  const setQuickLogOpen = useStore(state => state.setQuickLogOpen);
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { scrollY } = useScroll();
  const pullDistance = useTransform(scrollY, [-100, 0], [100, 0]);
  const pullOpacity = useTransform(scrollY, [-100, -20], [1, 0]);

  useEffect(() => {
    const unsubscribe = scrollY.on("change", (latest) => {
      if (latest < -80 && !isRefreshing) {
        handleRefresh();
      }
    });
    return () => unsubscribe();
  }, [scrollY, isRefreshing]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    toast.promise(new Promise(resolve => setTimeout(resolve, 1500)), {
      loading: 'Refreshing market data...',
      success: 'Data up to date!',
      error: 'Refresh failed',
    });
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  const currentAccount = accounts.find(a => a.id === selectedAccountId) || accounts[0];
  const startingBalance = currentAccount?.startingBalance || 10000;
  
  const accountTrades = allTrades.filter(t => t.accountId === selectedAccountId);
  const trades = filterTradesByDateRange(accountTrades, selectedDateRange);
  
  const today = new Date().toLocaleDateString('en-CA');
  const todaysTrades = trades.filter(t => t.date === today);
  const todaysPnL = todaysTrades.reduce((sum, t) => sum + t.result, 0);
  
  const wins = trades.filter(t => t.result > 0).length;
  const winRate = trades.length > 0 ? Math.round((wins / trades.length) * 100) : 0;
  
  let totalPnL = 0;
  const equityData = trades.slice().reverse().map((t, i) => {
    totalPnL += t.result;
    return { date: `T${i+1}`, value: startingBalance + totalPnL };
  });
  
  if (equityData.length === 0) {
    equityData.push({ date: "Start", value: startingBalance });
  }

  const currentBalance = equityData[equityData.length - 1].value;

  const sessionData = [
    { name: "London", value: 0 },
    { name: "New York", value: 0 },
    { name: "Asian", value: 0 },
  ];

  trades.forEach(trade => {
    const timeMatch = trade.entryTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const isPM = timeMatch[3].toUpperCase() === 'PM';
      if (isPM && hours < 12) hours += 12;
      if (!isPM && hours === 12) hours = 0;

      if (hours >= 3 && hours < 8) {
        sessionData[0].value += trade.result; // London
      } else if (hours >= 8 && hours < 17) {
        sessionData[1].value += trade.result; // New York
      } else {
        sessionData[2].value += trade.result; // Asian
      }
    }
  });

  const rrValues = trades.map(t => parseFloat(t.rr.split(':')[1])).filter(n => !isNaN(n));
  const avgRR = rrValues.length > 0 ? (rrValues.reduce((a, b) => a + b, 0) / rrValues.length).toFixed(1) : "0.0";

  const pairStats = trades.reduce((acc, t) => {
    acc[t.pair] = (acc[t.pair] || 0) + t.result;
    return acc;
  }, {} as Record<string, number>);
  const bestPair = Object.entries(pairStats).sort((a, b) => b[1] - a[1])[0] || ["N/A", 0];

  const worstSession = [...sessionData].sort((a, b) => a.value - b.value)[0] || { name: "N/A", value: 0 };

  let peak = startingBalance;
  let maxDrawdown = 0;
  equityData.forEach(d => {
    if (d.value > peak) peak = d.value;
    const drawdown = (peak - d.value) / peak;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
  });
  const maxDrawdownPct = (maxDrawdown * 100).toFixed(1);

  const grossProfit = trades.filter(t => t.result > 0).reduce((sum, t) => sum + t.result, 0);
  const grossLoss = Math.abs(trades.filter(t => t.result < 0).reduce((sum, t) => sum + t.result, 0));
  const profitFactor = grossLoss === 0 ? (grossProfit > 0 ? "∞" : "0.00") : (grossProfit / grossLoss).toFixed(2);

  const setupStats = trades.reduce((acc, t) => {
    if (!acc[t.setup]) acc[t.setup] = { trades: 0, wins: 0 };
    acc[t.setup].trades += 1;
    if (t.result > 0) acc[t.setup].wins += 1;
    return acc;
  }, {} as Record<string, { trades: number, wins: number }>);
  const topSetups = Object.entries(setupStats)
    .map(([name, stats]) => ({ name, winRate: Math.round((stats.wins / stats.trades) * 100) }))
    .sort((a, b) => b.winRate - a.winRate)
    .slice(0, 2);

  const mistakeStats = trades.filter(t => t.result < 0).reduce((acc, t) => {
    acc[t.emotion] = (acc[t.emotion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const commonMistakes = Object.entries(mistakeStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(e => e[0]);

  if (trades.length === 0) {
    return (
      <div className="p-8 max-w-7xl mx-auto h-[80vh] flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-surface-hover flex items-center justify-center text-text-muted mb-6">
          <Activity size={32} />
        </div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">Welcome to FX Journal</h2>
        <p className="text-text-secondary max-w-md mb-8">
          You haven't logged any trades yet. Start tracking your performance by adding your first trade.
        </p>
        <button 
          onClick={() => useStore.getState().setTradeModalOpen(true)}
          className="bg-accent hover:bg-indigo-400 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-lg shadow-accent/20"
        >
          Log Your First Trade
        </button>
      </div>
    );
  }

  return (
    <div className="relative p-4 md:p-8 max-w-7xl mx-auto space-y-6 pb-24 md:pb-8">
      {/* Pull to refresh visual */}
      <motion.div 
        style={{ y: pullDistance, opacity: pullOpacity }}
        className="absolute top-0 left-0 right-0 flex justify-center pointer-events-none z-50 h-20 -mt-10"
      >
        <div className="bg-surface border border-border px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-xs font-bold text-accent">
          {isRefreshing ? <RefreshCw className="animate-spin" size={14} /> : <ArrowDown size={14} />}
          {isRefreshing ? "Updating..." : "Pull to Refresh"}
        </div>
      </motion.div>

      {/* Header with quick actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-surface p-5 md:p-6 rounded-2xl border border-border shadow-sm">
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-black text-text-primary tracking-tight">Performance Hub</h1>
          <p className="text-sm text-text-secondary font-medium">Refining your edge, session by session.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setQuickLogOpen(true)}
            className="flex-1 sm:flex-none h-12 px-6 bg-accent hover:bg-accent/90 text-white rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-accent/20 active:scale-95"
          >
            <Zap size={18} />
            Quick
          </button>
          <button 
            onClick={() => setTradeModalOpen(true)}
            className="flex-1 sm:flex-none h-12 px-6 bg-surface border border-border hover:border-accent/50 text-text-primary rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Plus size={18} />
            Guided
          </button>
        </div>
      </div>

      {/* Today's Snapshot - 2 columns on mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        <StatCard 
          title="Today's P/L" 
          value={`${todaysPnL >= 0 ? '+' : ''}$${todaysPnL.toFixed(0)}`} 
          trend={todaysPnL >= 0 ? 'up' : 'down'} 
          subtitle={`${todaysTrades.length} trades`} 
        />
        <StatCard title="Win Rate" value={`${winRate}%`} trend="up" subtitle={`All ${trades.length} trades`} />
        <StatCard title="R/R Avg" value={`1:${avgRR}`} trend="neutral" subtitle="Efficiency" />
        <StatCard title="Active Session" value="London" trend="neutral" subtitle="Primary" />
        <StatCard title="Psychology" value="8/10" trend="up" subtitle="Focused" />
      </div>

      {/* Equity Curve - Taller on mobile */}
      <div className="glass-panel p-5 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-xl font-black text-text-primary tracking-tight">Account Equity</h2>
            <p className="text-sm text-text-secondary font-medium italic">Growth trajectory & relative drawdowns</p>
          </div>
          <div className="bg-background/50 p-4 rounded-2xl border border-border flex items-center justify-between md:justify-end gap-6">
            <div className="text-right">
              <div className="text-xs text-text-muted uppercase font-bold tracking-widest mb-1">Current Balance</div>
              <div className="text-2xl font-black text-text-primary font-mono tracking-tighter">${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            </div>
            <div className={cn(
              "px-3 py-1 rounded-lg text-sm font-black flex items-center gap-1",
              currentBalance >= startingBalance ? "bg-profit/10 text-profit" : "bg-loss/10 text-loss"
            )}>
              {currentBalance >= startingBalance ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {((currentBalance - startingBalance) / (startingBalance || 1) * 100).toFixed(1)}%
            </div>
          </div>
        </div>
        <div className="h-64 sm:h-72 md:h-80 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={equityData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} opacity={0.5} />
              <XAxis dataKey="date" stroke="var(--color-text-muted)" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis 
                stroke="var(--color-text-muted)" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(val) => `$${val > 999 ? (val/1000).toFixed(0) + 'k' : val}`} 
                domain={[
                  (dataMin: number) => Math.min(dataMin, startingBalance) * 0.98, 
                  (dataMax: number) => Math.max(dataMax, startingBalance) * 1.02
                ]} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--color-surface)', 
                  borderColor: 'var(--color-border)', 
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
                itemStyle={{ color: 'var(--color-text-primary)' }}
                trigger="click"
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="var(--color-accent)" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorValue)" 
                baseValue={startingBalance}
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Performance Insights - Vertically stacked with better visual spacing */}
        <div className="space-y-4 md:col-span-1">
          <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest px-1">Edge Analytics</h3>
          
          <div className="glass-panel p-5 flex items-center gap-4 transition-all hover:border-accent/40 group">
            <div className="w-12 h-12 rounded-2xl bg-profit/10 flex items-center justify-center text-profit shrink-0 border border-profit/20 group-hover:scale-110 transition-transform">
              <Target size={24} />
            </div>
            <div className="truncate">
              <div className="text-[10px] text-text-muted uppercase font-bold tracking-wider mb-0.5">Primary Asset</div>
              <div className="font-black text-lg text-text-primary truncate tracking-tight">{bestPair[0]} <span className="text-profit text-xs font-bold ml-1">+{bestPair[1].toFixed(0)}</span></div>
            </div>
          </div>

          <div className="glass-panel p-5 flex items-center gap-4 transition-all hover:border-loss/40 group">
            <div className="w-12 h-12 rounded-2xl bg-loss/10 flex items-center justify-center text-loss shrink-0 border border-loss/20 group-hover:scale-110 transition-transform">
              <Activity size={24} />
            </div>
            <div className="truncate">
              <div className="text-[10px] text-text-muted uppercase font-bold tracking-wider mb-0.5">Toxity Session</div>
              <div className="font-black text-lg text-text-primary truncate tracking-tight">{worstSession.name} <span className="text-loss text-xs font-bold ml-1">{worstSession.value.toFixed(0)}</span></div>
            </div>
          </div>

          <div className="glass-panel p-5 flex items-center gap-4 transition-all hover:border-accent/40 group">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent shrink-0 border border-accent/20 group-hover:scale-110 transition-transform">
              <TrendingUp size={24} />
            </div>
            <div>
              <div className="text-[10px] text-text-muted uppercase font-bold tracking-wider mb-0.5">Profit Factor</div>
              <div className="font-black text-lg text-text-primary tracking-tight">{profitFactor}</div>
            </div>
          </div>

          <div className="glass-panel p-5 flex items-center gap-4 transition-all hover:border-caution/40 group">
            <div className="w-12 h-12 rounded-2xl bg-caution/10 flex items-center justify-center text-caution shrink-0 border border-caution/20 group-hover:scale-110 transition-transform">
              <AlertTriangle size={24} />
            </div>
            <div>
              <div className="text-[10px] text-text-muted uppercase font-bold tracking-wider mb-0.5">Max Drawdown</div>
              <div className="font-black text-lg text-text-primary tracking-tight">{maxDrawdownPct}%</div>
            </div>
          </div>
        </div>

        {/* Session Performance */}
        <div className="glass-panel p-5 md:p-8 md:col-span-2">
          <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-8 border-b border-border pb-2">Volume & Session Intensity</h3>
          <div className="h-56 md:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sessionData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={true} vertical={false} opacity={0.3} />
                <XAxis type="number" stroke="var(--color-text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="var(--color-text-muted)" fontSize={11} fontWeight="700" tickLine={false} axisLine={false} width={80} />
                <Tooltip 
                  cursor={{fill: 'var(--color-surface-hover)', opacity: 0.5}}
                  contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: '12px', fontSize: '12px' }}
                  trigger="click"
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={28}>
                  {sessionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.value >= 0 ? 'var(--color-profit)' : 'var(--color-loss)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-background/40 p-4 rounded-xl border border-border">
              <h4 className="text-[10px] text-text-muted mb-3 uppercase font-black tracking-widest">Optimized Setups</h4>
              <div className="flex flex-wrap gap-2">
                {topSetups.length > 0 ? topSetups.map(s => (
                  <span key={s.name} className="px-3 py-1.5 rounded-lg bg-surface border border-accent/20 text-xs font-bold text-text-primary shadow-sm">{s.name} <span className="text-accent underline underline-offset-2">{s.winRate}%</span></span>
                )) : <span className="text-xs text-text-muted italic">Insufficient trading history</span>}
              </div>
            </div>
            <div className="bg-background/40 p-4 rounded-xl border border-border">
              <h4 className="text-[10px] text-text-muted mb-3 uppercase font-black tracking-widest">Psychological Leaks</h4>
              <div className="flex flex-wrap gap-2">
                {commonMistakes.length > 0 ? commonMistakes.map(m => (
                  <span key={m} className="px-3 py-1.5 rounded-lg bg-loss/5 border border-loss/20 text-xs font-bold text-loss shadow-sm">{m}</span>
                )) : <span className="text-xs text-text-muted italic">Clear psychological state</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, subtitle }: { title: string, value: string, trend: 'up' | 'down' | 'neutral', subtitle: string }) {
  return (
    <motion.div 
      whileTap={{ scale: 0.95 }}
      className="glass-panel p-5 md:p-6 transition-all hover:border-accent/40"
    >
      <div className="text-[10px] text-text-muted uppercase font-bold tracking-widest mb-1">{title}</div>
      <div className="text-2xl md:text-3xl font-black text-text-primary font-mono tracking-tighter mb-2 truncate">{value}</div>
      <div className="flex items-center justify-between text-[11px] font-bold">
        <span className="text-text-secondary opacity-60 truncate">{subtitle}</span>
        {trend === 'up' && <span className="text-profit bg-profit/10 px-1.5 py-0.5 rounded flex items-center shadow-sm shadow-profit/10"><TrendingUp size={12} className="mr-1"/>+</span>}
        {trend === 'down' && <span className="text-loss bg-loss/10 px-1.5 py-0.5 rounded flex items-center shadow-sm shadow-loss/10"><TrendingDown size={12} className="mr-1"/>-</span>}
      </div>
    </motion.div>
  );
}
