import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Sector,
  LineChart, Line
} from "recharts";

const pairPerformance = [
  { name: "GBP/JPY", win: 4500, loss: 1200 },
  { name: "EUR/USD", win: 3200, loss: 2100 },
  { name: "XAU/USD", win: 5600, loss: 4800 },
  { name: "USD/JPY", win: 1500, loss: 800 },
];

const setupPerformance = [
  { name: "Break & Retest", value: 45 },
  { name: "Trend Cont.", value: 30 },
  { name: "Liquidity Sweep", value: 15 },
  { name: "Reversal", value: 10 },
];

const COLORS = ['var(--color-accent)', '#818cf8', '#a5b4fc', '#c7d2fe'];

const emotionPerformance = [
  { emotion: "Confident", pl: 2500 },
  { emotion: "Patient", pl: 1800 },
  { emotion: "Neutral", pl: 400 },
  { emotion: "Anxious", pl: -800 },
  { emotion: "FOMO", pl: -1500 },
];

export function Analytics() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Analytics</h1>
          <p className="text-sm text-text-secondary">Deep dive into your trading performance.</p>
        </div>
        <div className="flex bg-surface border border-border rounded-lg p-1">
          <button className="px-3 py-1 text-sm text-text-secondary hover:text-text-primary rounded">This Month</button>
          <button className="px-3 py-1 text-sm bg-surface-hover text-text-primary rounded shadow-sm">Last Month</button>
          <button className="px-3 py-1 text-sm text-text-secondary hover:text-text-primary rounded">All Time</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Pair Performance */}
        <div className="glass-panel p-6">
          <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider mb-6">P/L by Pair</h3>
          <div className="h-64">
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
          <div className="h-64 flex items-center">
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
            <div className="w-1/2 space-y-3">
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
        <div className="glass-panel p-6 col-span-2">
          <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider mb-6">Psychology vs P/L</h3>
          <div className="h-64">
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
