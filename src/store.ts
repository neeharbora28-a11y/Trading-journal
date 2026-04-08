import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Trade {
  id: string;
  pair: string;
  direction: 'long' | 'short';
  setup: string;
  entryTime: string;
  date: string; // ISO date string YYYY-MM-DD
  result: number;
  rr: string;
  emotion: string;
  notes: string;
  hasScreenshot: boolean;
}

export interface Setup {
  id: string;
  name: string;
  category: string;
  winRate: string;
  profitFactor: string;
  description: string;
  rules: string[];
}

export interface DailyLog {
  date: string;
  confidence: number;
  discipline: number;
  patience: number;
  fomo: number;
  stress: number;
  notes: string;
}

interface AppState {
  trades: Trade[];
  setups: Setup[];
  dailyLogs: DailyLog[];
  isTradeModalOpen: boolean;
  selectedAccount: string;
  selectedDateRange: string;
  isLoading: boolean;
  addTrade: (trade: Omit<Trade, 'id'>) => void;
  updateTrade: (id: string, trade: Partial<Trade>) => void;
  deleteTrade: (id: string) => void;
  addSetup: (setup: Omit<Setup, 'id'>) => void;
  saveDailyLog: (log: DailyLog) => void;
  setTradeModalOpen: (isOpen: boolean) => void;
  setSelectedAccount: (account: string) => void;
  setSelectedDateRange: (range: string) => void;
  setIsLoading: (loading: boolean) => void;
}

const initialSetups: Setup[] = [
  {
    id: "1",
    name: "Break & Retest",
    category: "Breakout",
    winRate: "65%",
    profitFactor: "2.4",
    description: "Price breaks through a key support/resistance level, then returns to retest it as new support/resistance before continuing in the breakout direction.",
    rules: [
      "Clear break of S/R with strong momentum",
      "Wait for pullback to the broken level",
      "Entry on rejection candle (pin bar, engulfing)"
    ],
  },
  {
    id: "2",
    name: "Liquidity Sweep",
    category: "Reversal",
    winRate: "58%",
    profitFactor: "3.1",
    description: "Price briefly breaks a significant high/low to trigger stop losses (liquidity), then immediately reverses direction.",
    rules: [
      "Identify clear swing high/low with resting liquidity",
      "Wait for price to pierce the level",
      "Immediate rejection and close back inside the range"
    ],
  },
  {
    id: "3",
    name: "Trend Continuation",
    category: "Trend",
    winRate: "72%",
    profitFactor: "1.8",
    description: "Entering in the direction of the established trend after a brief consolidation or pullback to a moving average or minor S/R.",
    rules: [
      "Clear trend on higher timeframe",
      "Pullback to 20/50 EMA or minor structure",
      "Continuation pattern (flag, pennant) breakout"
    ],
  }
];

const initialTrades: Trade[] = [
  {
    id: "1",
    pair: "GBP/JPY",
    direction: "long",
    setup: "Break & Retest",
    entryTime: "10:30 AM",
    date: new Date().toISOString().split('T')[0],
    result: 320.50,
    rr: "1:2.5",
    emotion: "Confident",
    notes: "Waited for the 15m candle to close above the key level. Perfect execution.",
    hasScreenshot: true,
  },
  {
    id: "2",
    pair: "EUR/USD",
    direction: "short",
    setup: "Liquidity Sweep",
    entryTime: "08:15 AM",
    date: new Date().toISOString().split('T')[0],
    result: -150.00,
    rr: "1:1",
    emotion: "FOMO",
    notes: "Entered too early before the sweep was confirmed. Need to wait for the close.",
    hasScreenshot: false,
  },
  {
    id: "3",
    pair: "XAU/USD",
    direction: "long",
    setup: "Trend Continuation",
    entryTime: "02:45 PM",
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    result: 850.00,
    rr: "1:4",
    emotion: "Patient",
    notes: "Held through the pullback. Trailed stop loss perfectly.",
    hasScreenshot: true,
  }
];

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      trades: initialTrades,
      setups: initialSetups,
      dailyLogs: [],
      isTradeModalOpen: false,
      selectedAccount: "Main Account",
      selectedDateRange: "This Week",
      isLoading: false,
      
      addTrade: (trade) => set((state) => ({ 
        trades: [{ ...trade, id: Date.now().toString() }, ...state.trades] 
      })),
      
      updateTrade: (id, updatedTrade) => set((state) => ({
        trades: state.trades.map(t => t.id === id ? { ...t, ...updatedTrade } : t)
      })),
      
      deleteTrade: (id) => set((state) => ({
        trades: state.trades.filter(t => t.id !== id)
      })),
      
      addSetup: (setup) => set((state) => ({
        setups: [...state.setups, { ...setup, id: Date.now().toString() }]
      })),

      saveDailyLog: (log) => set((state) => {
        const existingIndex = state.dailyLogs.findIndex(l => l.date === log.date);
        if (existingIndex >= 0) {
          const newLogs = [...state.dailyLogs];
          newLogs[existingIndex] = log;
          return { dailyLogs: newLogs };
        }
        return { dailyLogs: [...state.dailyLogs, log] };
      }),

      setTradeModalOpen: (isOpen) => set({ isTradeModalOpen: isOpen }),
      setSelectedAccount: (account) => set({ selectedAccount: account }),
      setSelectedDateRange: (range) => set({ selectedDateRange: range }),
      setIsLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'fx-journal-storage',
    }
  )
);
