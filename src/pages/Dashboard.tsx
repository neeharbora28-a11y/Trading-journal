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

const sessionData = [
  { name: "London", value: 450 },
  { name: "New York", value: 220 },
  { name: "Asian", value: -120 },
];

export function Dashboard() {
  const trades = useStore(state => state.trades);
  
  const today = new Date().toISOString().split('T')[0];
  const todaysTrades = trades.filter(t => t.date === today);
  const todaysPnL = todaysTrades.reduce((sum, t) => sum + t.result, 0);
  
  const wins = trades.filter(t => t.result > 0).length;
  const winRate = trades.length > 0 ? Math.round((wins / trades.length) * 100) : 0;
  
  let totalPnL = 0;
  const equityData = trades.slice().reverse().map((t, i) => {
    totalPnL += t.result;
    return { date: `T${i+1}`, value: 10000 + totalPnL };
  });
  
  if (equityData.length === 0) {
    equityData.push({ date: "Start", value: 10000 });
  }

  const currentBalance = equityData[equityData.length - 1].value;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Today's Snapshot */}
      <div className="grid grid-cols-5 gap-4">
        <StatCard 
          title="Today's P/L" 
          value={`${todaysPnL >= 0 ? '+' : ''}$${todaysPnL.toFixed(2)}`} 
          trend={todaysPnL >= 0 ? 'up' : 'down'} 
          subtitle={`${todaysTrades.length} trades`} 
        />
        <StatCard title="Win Rate" value={`${winRate}%`} trend="up" subtitle={`Total ${trades.length} trades`} />
        <StatCard title="Risk/Reward" value="1:2.4" trend="neutral" subtitle="Average" />
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
          <div className="text-right">
            <div className="text-2xl font-bold text-text-primary font-mono">${currentBalance.toFixed(2)}</div>
            <div className="text-sm text-profit flex items-center justify-end gap-1">
              <TrendingUp size={14} /> +{((currentBalance - 10000) / 100).toFixed(1)}% total
            </div>
          </div>
        </div>
        <div className="h-64 w-full">
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
              <YAxis stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} domain={['auto', 'auto']} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: '8px' }}
                itemStyle={{ color: 'var(--color-text-primary)' }}
              />
              <Area type="monotone" dataKey="value" stroke="var(--color-accent)" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Performance Cards */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider">Performance Insights</h3>
          
          <div className="glass-panel p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-profit-muted flex items-center justify-center text-profit">
              <Target size={20} />
            </div>
            <div>
              <div className="text-sm text-text-secondary">Best Pair</div>
              <div className="font-semibold text-text-primary">GBP/JPY <span className="text-profit text-sm font-normal ml-1">+$1,240</span></div>
            </div>
          </div>

          <div className="glass-panel p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-loss-muted flex items-center justify-center text-loss">
              <Activity size={20} />
            </div>
            <div>
              <div className="text-sm text-text-secondary">Worst Session</div>
              <div className="font-semibold text-text-primary">Asian <span className="text-loss text-sm font-normal ml-1">-$320</span></div>
            </div>
          </div>

          <div className="glass-panel p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-accent-muted flex items-center justify-center text-accent">
              <Clock size={20} />
            </div>
            <div>
              <div className="text-sm text-text-secondary">Avg Hold Time</div>
              <div className="font-semibold text-text-primary">4h 15m</div>
            </div>
          </div>

          <div className="glass-panel p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-caution/10 flex items-center justify-center text-caution">
              <AlertTriangle size={20} />
            </div>
            <div>
              <div className="text-sm text-text-secondary">Max Drawdown</div>
              <div className="font-semibold text-text-primary">4.2%</div>
            </div>
          </div>
        </div>

        {/* Session Performance */}
        <div className="glass-panel p-6 col-span-2">
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
                <span className="px-2 py-1 rounded bg-surface border border-border text-xs text-text-secondary">Break & Retest (65%)</span>
                <span className="px-2 py-1 rounded bg-surface border border-border text-xs text-text-secondary">Trend Continuation (52%)</span>
              </div>
            </div>
            <div>
              <h4 className="text-xs text-text-muted mb-2 uppercase">Common Mistakes</h4>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 rounded bg-loss-muted border border-loss/20 text-xs text-loss">FOMO Entry</span>
                <span className="px-2 py-1 rounded bg-loss-muted border border-loss/20 text-xs text-loss">Moved Stop Loss</span>
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
      <div className="text-2xl font-bold text-text-primary font-mono mb-2">{value}</div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-text-muted">{subtitle}</span>
        {trend === 'up' && <span className="text-profit flex items-center"><TrendingUp size={12} className="mr-1"/></span>}
        {trend === 'down' && <span className="text-loss flex items-center"><TrendingDown size={12} className="mr-1"/></span>}
      </div>
    </div>
  );
}
