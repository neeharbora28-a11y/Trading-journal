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
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Analytics</h1>
          <p className="text-sm text-text-secondary">Deep dive into your trading performance.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pair Performance */}
        <div className="glass-panel p-6">
          <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider mb-6">P/L by Pair</h3>
          <div className="h-40 sm:h-52 md:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pairPerformance} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                <Tooltip 
                  cursor={{fill: 'var(--color-surface-hover)'}}
                  contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: '8px' }}
                />
                <Bar dataKey="win" stackId="a" fill="var(--color-profit)" radius={[0, 0, 4, 4]} barSize={32} />
                <Bar dataKey="loss" stackId="a" fill="var(--color-loss)" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Setup Performance */}
        <div className="glass-panel p-6">
          <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider mb-6">Setup Distribution</h3>
          <div className="h-40 sm:h-52 md:h-64 flex flex-col md:flex-row items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={setupPerformance}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {setupPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--color-text-primary)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-full md:w-1/2 space-y-3 mt-4 md:mt-0">
              {setupPerformance.map((setup, i) => (
                <div key={setup.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                    <span className="text-text-secondary">{setup.name}</span>
                  </div>
                  <span className="font-medium text-text-primary">{setup.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Psychology vs Results */}
        <div className="glass-panel p-6 md:col-span-2">
          <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider mb-6">Psychology vs P/L</h3>
          <div className="h-40 sm:h-52 md:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={emotionPerformance} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="emotion" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  cursor={{fill: 'var(--color-surface-hover)'}}
                  contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: '8px' }}
                />
                <Bar dataKey="pl" radius={[4, 4, 0, 0]} barSize={48}>
                  {emotionPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.pl > 0 ? 'var(--color-profit)' : 'var(--color-loss)'} />
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
