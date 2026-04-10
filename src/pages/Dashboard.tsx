import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Target, 
  Clock, 
  AlertTriangle 
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
import { filterTradesByDateRange } from "@/lib/utils";

export function Dashboard() {
  const allTrades = useStore(state => state.trades);
  const accounts = useStore(state => state.accounts);
  const selectedAccountId = useStore(state => state.selectedAccountId);
  const selectedDateRange = useStore(state => state.selectedDateRange);
  
  const currentAccount = accounts.find(a => a.id === selectedAccountId) || accounts[0];
  const startingBalance = currentAccount?.startingBalance || 10000;
  
  const accountTrades = allTrades.filter(t => t.accountId === selectedAccountId);
  const trades = filterTradesByDateRange(accountTrades, selectedDateRange);
  
  // Use local timezone for "today" instead of UTC
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

  // Calculate session data dynamically based on entryTime
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

      // Simplified session assignment
      if (hours >= 3 && hours < 8) {
        sessionData[0].value += trade.result; // London
      } else if (hours >= 8 && hours < 17) {
        sessionData[1].value += trade.result; // New York
      } else {
        sessionData[2].value += trade.result; // Asian
      }
    }
  });

  // Dynamic Computations
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
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Today's Snapshot */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        <StatCard 
          title="Today's P/L" 
          value={`${todaysPnL >= 0 ? '+' : ''}$${todaysPnL.toFixed(2)}`} 
          trend={todaysPnL >= 0 ? 'up' : 'down'} 
          subtitle={`${todaysTrades.length} trades`} 
        />
        <StatCard title="Win Rate" value={`${winRate}%`} trend="up" subtitle={`Total ${trades.length} trades`} />
        <StatCard title="Risk/Reward" value={`1:${avgRR}`} trend="neutral" subtitle="Average" />
        <StatCard title="Trades Taken" value={trades.length.toString()} trend="neutral" subtitle="All time" />
        <StatCard title="Emotional Score" value="8/10" trend="up" subtitle="Focused" />
      </div>

      {/* Equity Curve */}
      <div className="glass-panel p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Equity Curve</h2>
            <p className="text-sm text-text-secondary">Account balance over time</p>
          </div>
          <div className="text-right overflow-hidden">
            <div className="text-xl sm:text-2xl font-bold text-text-primary font-mono truncate">${currentBalance.toFixed(2)}</div>
            <div className="text-sm text-profit flex items-center justify-end gap-1">
              <TrendingUp size={14} /> +{((currentBalance - startingBalance) / (startingBalance || 1) * 100).toFixed(1)}% total
            </div>
          </div>
        </div>
        <div className="h-40 sm:h-52 md:h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={equityData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="date" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis 
                stroke="var(--color-text-muted)" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(val) => `$${val}`} 
                domain={[
                  (dataMin: number) => Math.min(dataMin, startingBalance), 
                  (dataMax: number) => Math.max(dataMax, startingBalance)
                ]} 
              />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: '8px' }}
                itemStyle={{ color: 'var(--color-text-primary)' }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="var(--color-accent)" 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#colorValue)" 
                baseValue={startingBalance}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Performance Cards */}
        <div className="space-y-4 md:col-span-1">
          <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider">Performance Insights</h3>
          
          <div className="glass-panel p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-profit-muted flex items-center justify-center text-profit">
              <Target size={20} />
            </div>
            <div>
              <div className="text-sm text-text-secondary">Best Pair</div>
              <div className="font-semibold text-text-primary">{bestPair[0]} <span className="text-profit text-sm font-normal ml-1">{bestPair[1] >= 0 ? '+' : ''}${bestPair[1].toFixed(2)}</span></div>
            </div>
          </div>

          <div className="glass-panel p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-loss-muted flex items-center justify-center text-loss">
              <Activity size={20} />
            </div>
            <div>
              <div className="text-sm text-text-secondary">Worst Session</div>
              <div className="font-semibold text-text-primary">{worstSession.name} <span className="text-loss text-sm font-normal ml-1">{worstSession.value >= 0 ? '+' : ''}${worstSession.value.toFixed(2)}</span></div>
            </div>
          </div>

          <div className="glass-panel p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-accent-muted flex items-center justify-center text-accent">
              <TrendingUp size={20} />
            </div>
            <div>
              <div className="text-sm text-text-secondary">Profit Factor</div>
              <div className="font-semibold text-text-primary">{profitFactor}</div>
            </div>
          </div>

          <div className="glass-panel p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-caution/10 flex items-center justify-center text-caution">
              <AlertTriangle size={20} />
            </div>
            <div>
              <div className="text-sm text-text-secondary">Max Drawdown</div>
              <div className="font-semibold text-text-primary">{maxDrawdownPct}%</div>
            </div>
          </div>
        </div>

        {/* Session Performance */}
        <div className="glass-panel p-6 md:col-span-2">
          <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider mb-6">Session Performance</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sessionData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} width={80} />
                <Tooltip 
                  cursor={{fill: 'var(--color-surface-hover)'}}
                  contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: '8px' }}
                />
                <Bar dataKey="value" radius={4} barSize={24}>
                  {sessionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.value >= 0 ? 'var(--color-profit)' : 'var(--color-loss)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs text-text-muted mb-2 uppercase">Top Setups</h4>
              <div className="flex flex-wrap gap-2">
                {topSetups.length > 0 ? topSetups.map(s => (
                  <span key={s.name} className="px-2 py-1 rounded bg-surface border border-border text-xs text-text-secondary">{s.name} ({s.winRate}%)</span>
                )) : <span className="text-xs text-text-muted">Not enough data</span>}
              </div>
            </div>
            <div>
              <h4 className="text-xs text-text-muted mb-2 uppercase">Common Mistakes</h4>
              <div className="flex flex-wrap gap-2">
                {commonMistakes.length > 0 ? commonMistakes.map(m => (
                  <span key={m} className="px-2 py-1 rounded bg-loss-muted border border-loss/20 text-xs text-loss">{m}</span>
                )) : <span className="text-xs text-text-muted">Not enough data</span>}
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
    <div className="glass-panel p-4">
      <div className="text-sm text-text-secondary mb-1">{title}</div>
      <div className="text-xl sm:text-2xl font-bold text-text-primary font-mono mb-2 truncate">{value}</div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-text-muted">{subtitle}</span>
        {trend === 'up' && <span className="text-profit flex items-center"><TrendingUp size={12} className="mr-1"/></span>}
        {trend === 'down' && <span className="text-loss flex items-center"><TrendingDown size={12} className="mr-1"/></span>}
      </div>
    </div>
  );
}
