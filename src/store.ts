import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Account {
  id: string;
  name: string;
  startingBalance: number;
  createdAt: string;
}

export interface Trade {
  id: string;
  accountId: string;
  pair: string;
  direction: 'long' | 'short';
  setup: string;
  entryTime: string;
  date: string; // ISO date string YYYY-MM-DD
  result: number;
  rr: string;
  emotion: string;
  notes: string;
  aiInsight?: string;
  screenshot?: string;
  timestamp: number;
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
  accounts: Account[];
  trades: Trade[];
  setups: Setup[];
  dailyLogs: DailyLog[];
  isTradeModalOpen: boolean;
  isQuickLogOpen: boolean;
  selectedAccountId: string;
  selectedDateRange: string;
  isLoading: boolean;
  addAccount: (account: Omit<Account, 'id' | 'createdAt'>) => void;
  deleteAccount: (id: string) => void;
  addTrade: (trade: Omit<Trade, 'id'> & { id?: string }) => string;
  updateTrade: (id: string, trade: Partial<Trade>) => void;
  deleteTrade: (id: string) => void;
  addSetup: (setup: Omit<Setup, 'id'>) => void;
  saveDailyLog: (log: DailyLog) => void;
  setTradeModalOpen: (isOpen: boolean) => void;
  setQuickLogOpen: (isOpen: boolean) => void;
  setSelectedAccountId: (accountId: string) => void;
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

const initialAccounts: Account[] = [
  {
    id: "default-account",
    name: "Main Account",
    startingBalance: 10000,
    createdAt: new Date().toISOString()
  }
];

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      accounts: initialAccounts,
      trades: [],
      setups: initialSetups,
      dailyLogs: [],
      isTradeModalOpen: false,
      isQuickLogOpen: false,
      selectedAccountId: "default-account",
      selectedDateRange: "This Week",
      isLoading: false,
      
      addAccount: (account) => set((state) => {
        const newAccount = {
          ...account,
          id: Date.now().toString(),
          createdAt: new Date().toISOString()
        };
        return {
          accounts: [...state.accounts, newAccount],
          selectedAccountId: newAccount.id
        };
      }),

      deleteAccount: (id) => set((state) => {
        const newAccounts = state.accounts.filter(a => a.id !== id);
        return {
          accounts: newAccounts,
          selectedAccountId: newAccounts.length > 0 ? newAccounts[0].id : "",
          trades: state.trades.filter(t => t.accountId !== id)
        };
      }),

      addTrade: (trade) => {
        const id = trade.id || Date.now().toString();
        const newTrade = { ...trade, id };
        set((state) => ({ 
          trades: [newTrade as Trade, ...state.trades] 
        }));
        return id;
      },
      
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
      setQuickLogOpen: (isOpen) => set({ isQuickLogOpen: isOpen }),
      setSelectedAccountId: (accountId) => set({ selectedAccountId: accountId }),
      setSelectedDateRange: (range) => set({ selectedDateRange: range }),
      setIsLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'fx-journal-storage',
    }
  )
);
