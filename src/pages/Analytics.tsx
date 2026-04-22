import { useState, useMemo } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Sector,
  LineChart, Line
} from "recharts";
import { BarChart as BarChartIcon } from "lucide-react";
import { cn, filterTradesByDateRange } from "@/lib/utils";
import { useStore } from "@/store";

const COLORS = ['var(--color-accent)', '#818cf8', '#a5b4fc', '#c7d2fe'];

export function Analytics() {
  const allTrades = useStore(state => state.trades);
  const selectedAccountId = useStore(state => state.selectedAccountId);
  const selectedDateRange = useStore(state => state.selectedDateRange);
  
  const accountTrades = allTrades.filter(t => t.accountId === selectedAccountId);
  const filteredTrades = filterTradesByDateRange(accountTrades, selectedDateRange);

  const pairPerformance = useMemo(() => {
    const data: Record<string, { name: string, win: number, loss: number }> = {};
    filteredTrades.forEach(t => {
      if (!data[t.pair]) data[t.pair] = { name: t.pair, win: 0, loss: 0 };
      if (t.result > 0) data[t.pair].win += t.result;
      else data[t.pair].loss += Math.abs(t.result);
    });
    return Object.values(data);
  }, [filteredTrades]);

  const setupPerformance = useMemo(() => {
    const data: Record<string, number> = {};
    filteredTrades.forEach(t => {
      data[t.setup] = (data[t.setup] || 0) + 1;
    });
    const total = filteredTrades.length || 1;
    return Object.entries(data).map(([name, count]) => ({
      name,
      value: Math.round((count / total) * 100)
    }));
  }, [filteredTrades]);

  const emotionPerformance = useMemo(() => {
    const data: Record<string, { emotion: string, pl: number }> = {};
    filteredTrades.forEach(t => {
      if (!data[t.emotion]) data[t.emotion] = { emotion: t.emotion, pl: 0 };
      data[t.emotion].pl += t.result;
    });
    return Object.values(data);
  }, [filteredTrades]);

  if (filteredTrades.length === 0) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Analytics</h1>
            <p className="text-sm text-text-secondary">Deep dive into your trading performance.</p>
          </div>
        </div>
        
        <div className="h-[60vh] flex flex-col items-center justify-center text-center glass-panel">
          <div className="w-16 h-16 rounded-full bg-surface-hover flex items-center justify-center text-text-muted mb-6">
            <BarChartIcon size={32} />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Not Enough Data</h2>
          <p className="text-text-secondary max-w-md">
            There are no trades logged for the selected time range. Log more trades to see your performance analytics.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 pb-24 md:pb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight">Analytics Dashboard</h1>
          <p className="text-sm text-text-secondary font-medium italic">Uncover the patterns behind your P/L.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pair Performance */}
        <div className="glass-panel p-5 md:p-6 shadow-sm">
          <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-6 border-b border-border pb-2 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
            P/L by Asset Pair
          </h3>
          <div className="h-48 sm:h-56 md:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pairPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} opacity={0.5} />
                <XAxis 
                  dataKey="name" 
                  stroke="var(--color-text-muted)" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  interval={0}
                  tick={{ fill: 'var(--color-text-secondary)' }}
                />
                <YAxis 
                  stroke="var(--color-text-muted)" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => `$${val > 999 ? (val/1000).toFixed(0) + 'k' : val}`}
                  tick={{ fill: 'var(--color-text-secondary)' }}
                />
                <Tooltip 
                  cursor={{fill: 'var(--color-surface-hover)', opacity: 0.4}}
                  contentStyle={{ 
                    backgroundColor: 'var(--color-surface)', 
                    borderColor: 'var(--color-border)', 
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    padding: '8px 12px'
                  }}
                  itemStyle={{ padding: '2px 0' }}
                  trigger="click"
                />
                <Bar dataKey="win" stackId="a" fill="var(--color-profit)" radius={[0, 0, 4, 4]} barSize={24} minPointSize={2} />
                <Bar dataKey="loss" stackId="a" fill="var(--color-loss)" radius={[4, 4, 0, 0]} barSize={24} minPointSize={2} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Setup Performance */}
        <div className="glass-panel p-5 md:p-6 shadow-sm">
          <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-6 border-b border-border pb-2 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
            Setup Distribution
          </h3>
          <div className="flex flex-col gap-6">
            <div className="h-48 sm:h-56 md:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={setupPerformance}
                    cx="50%"
                    cy="50%"
                    innerRadius="60%"
                    outerRadius="85%"
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {setupPerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={8} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--color-surface)', 
                      borderColor: 'var(--color-border)', 
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                    trigger="click"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              {setupPerformance.map((setup, i) => (
                <div key={setup.name} className="flex items-center justify-between text-xs p-2 rounded-lg bg-surface-hover/30 border border-border/40">
                  <div className="flex items-center gap-2 truncate">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                    <span className="text-text-secondary truncate font-medium">{setup.name}</span>
                  </div>
                  <span className="font-bold text-text-primary ml-2">{setup.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Psychology vs Results */}
        <div className="glass-panel p-5 md:p-6 md:col-span-2 shadow-sm">
          <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-6 border-b border-border pb-2 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
            Psychological Edge vs P/L
          </h3>
          <div className="h-56 sm:h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={emotionPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} opacity={0.5} />
                <XAxis 
                  dataKey="emotion" 
                  stroke="var(--color-text-muted)" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fill: 'var(--color-text-secondary)' }}
                />
                <YAxis 
                  stroke="var(--color-text-muted)" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => `$${val}`}
                  tick={{ fill: 'var(--color-text-secondary)' }}
                />
                <Tooltip 
                  cursor={{fill: 'var(--color-surface-hover)', opacity: 0.4}}
                  contentStyle={{ 
                    backgroundColor: 'var(--color-surface)', 
                    borderColor: 'var(--color-border)', 
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                  trigger="click"
                />
                <Bar dataKey="pl" radius={[6, 6, 6, 6]} barSize={40}>
                  {emotionPerformance.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.pl > 0 ? 'var(--color-profit)' : 'var(--color-loss)'}
                      opacity={0.9} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
