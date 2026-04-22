import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, TrendingUp, TrendingDown, Activity, Target, Plus, X } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, parseISO } from "date-fns";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useStore } from "@/store";
import { motion, AnimatePresence } from "motion/react";

export function Calendar() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  const allTrades = useStore(state => state.trades);
  const selectedAccountId = useStore(state => state.selectedAccountId);
  
  const trades = allTrades.filter(t => t.accountId === selectedAccountId);

  const setTradeModalOpen = useStore(state => state.setTradeModalOpen);

  const dailyData = useMemo(() => {
    const data: Record<string, { pnl: number, trades: number, winRate: number, setups: string[], wins: number }> = {};
    
    trades.forEach(trade => {
      if (!data[trade.date]) {
        data[trade.date] = { pnl: 0, trades: 0, winRate: 0, setups: [], wins: 0 };
      }
      const day = data[trade.date];
      day.pnl += trade.result;
      day.trades += 1;
      if (trade.result > 0) day.wins += 1;
      if (!day.setups.includes(trade.setup)) {
        day.setups.push(trade.setup);
      }
      day.winRate = Math.round((day.wins / day.trades) * 100);
    });
    
    return data;
  }, [trades]);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsSheetOpen(true);
  };

  // Calculate monthly stats
  const currentMonthData = Object.entries(dailyData).filter(([dateStr]) => {
    const d = parseISO(dateStr);
    return isSameMonth(d, currentDate);
  });
  
  const monthlyPnl = currentMonthData.reduce((sum, [_, data]: [string, any]) => sum + data.pnl, 0);
  const monthlyTrades = currentMonthData.reduce((sum, [_, data]: [string, any]) => sum + data.trades, 0);
  const winningDays = currentMonthData.filter(([_, data]: [string, any]) => data.pnl > 0).length;
  const totalDaysTraded = currentMonthData.length;
  const winRate = totalDaysTraded > 0 ? Math.round((winningDays / totalDaysTraded) * 100) : 0;

  // Calendar Grid Generation
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start on Monday
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const dateFormat = "d";
  const rows = [];
  let days = [];
  let day = startDate;
  let formattedDate = "";

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      formattedDate = format(day, dateFormat);
      const cloneDay = day;
      const dateKey = format(day, 'yyyy-MM-dd');
      const dayData = dailyData[dateKey];
      const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;

      days.push(
        <motion.div
          key={day.toString()}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleDateClick(cloneDay)}
          className={cn(
            "min-h-[64px] md:min-h-[100px] p-1.5 md:p-3 border-r border-b border-border relative cursor-pointer transition-all duration-200 hover:bg-surface-hover group",
            !isSameMonth(day, monthStart) ? "text-text-muted bg-background/30" : "text-text-primary bg-surface",
            isSelected && "ring-2 ring-inset ring-accent bg-accent-muted/10 z-10"
          )}
        >
          <div className="flex justify-between items-start">
            <span className={cn(
              "text-[11px] md:text-sm font-bold w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-lg",
              isSameDay(day, new Date()) && "bg-accent text-white shadow-sm", // Highlight "today"
              isSelected && !isSameDay(day, new Date()) && "text-accent bg-accent-muted/20"
            )}>
              {formattedDate}
            </span>
            {dayData && (
              <span className="text-[9px] text-text-muted hidden md:block group-hover:opacity-100 transition-opacity">
                {dayData.trades} trades
              </span>
            )}
          </div>
          
          {dayData && (
            <div className="mt-1 md:mt-3 flex flex-col gap-1">
              <span className={cn(
                "text-[10px] md:text-xs font-black font-mono tracking-tighter truncate",
                dayData.pnl >= 0 ? "text-profit" : "text-loss"
              )}>
                {dayData.pnl >= 0 ? '+' : '-'}${Math.abs(dayData.pnl).toFixed(0)}
              </span>
              <div className="flex gap-1 flex-wrap">
                {dayData.setups.slice(0, 3).map((setup, idx) => (
                  <span key={idx} className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-accent/60" title={setup}></span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div className="grid grid-cols-7" key={day.toString()}>
        {days}
      </div>
    );
    days = [];
  }

  const selectedDateKey = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null;
  const selectedDayData = selectedDateKey ? dailyData[selectedDateKey] : null;

  const DetailPanel = ({ isMobile = false }) => (
    <div className={cn(
      "flex flex-col h-full",
      isMobile ? "p-6" : "p-6 glass-panel"
    )}>
      {selectedDate ? (
        <>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-black text-text-primary tracking-tight">
                {format(selectedDate, 'EEEE')}
              </h3>
              <p className="text-sm text-text-secondary">
                {format(selectedDate, 'MMMM d, yyyy')}
              </p>
            </div>
            {isMobile && (
              <button 
                onClick={() => setIsSheetOpen(false)}
                className="w-10 h-10 rounded-full bg-surface-hover flex items-center justify-center text-text-muted"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {selectedDayData ? (
            <div className="space-y-6 flex-1">
              <div className="p-5 rounded-2xl border border-border bg-background shadow-inner">
                <div className="text-[10px] text-text-muted uppercase font-bold tracking-widest mb-2">Daily P/L</div>
                <div className={cn(
                  "text-3xl font-black font-mono tracking-tighter",
                  selectedDayData.pnl >= 0 ? "text-profit" : "text-loss"
                )}>
                  {selectedDayData.pnl >= 0 ? '+' : '-'}${Math.abs(selectedDayData.pnl).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-border bg-background">
                  <div className="text-[10px] text-text-muted uppercase font-bold tracking-widest mb-1">Trades</div>
                  <div className="text-lg font-bold text-text-primary">{selectedDayData.trades} executed</div>
                </div>
                <div className="p-4 rounded-xl border border-border bg-background">
                  <div className="text-[10px] text-text-muted uppercase font-bold tracking-widest mb-1">Win Rate</div>
                  <div className="text-lg font-bold text-text-primary">{selectedDayData.winRate}%</div>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Setups Traded</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedDayData.setups.map((setup, idx) => (
                    <span key={idx} className="px-3 py-1.5 rounded-lg bg-surface border border-border text-xs font-medium text-text-primary transition-colors hover:border-accent/40">
                      {setup}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="mt-auto pt-8">
                <button 
                  onClick={() => navigate("/journal")}
                  className="w-full bg-accent hover:bg-black/10 text-white h-12 rounded-xl text-sm font-bold transition-all shadow-lg shadow-accent/20 active:scale-95"
                >
                  View in Journal
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
              <div className="w-16 h-16 rounded-3xl bg-surface-hover flex items-center justify-center text-text-muted mb-4 border border-border">
                <CalendarIcon size={24} />
              </div>
              <p className="text-text-primary font-bold text-lg mb-1 tracking-tight">Market Inactivity</p>
              <p className="text-sm text-text-secondary mb-8">No trade logs found for this session.</p>
              <button 
                onClick={() => setTradeModalOpen(true)}
                className="flex items-center gap-2 bg-background border border-border px-6 py-3 rounded-xl text-sm text-accent hover:text-indigo-400 font-bold transition-all active:scale-95 shadow-sm"
              >
                <Plus size={18} /> New Trade
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-text-muted text-sm italic">
          Tap a session to see metrics
        </div>
      )}
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 pb-24 md:pb-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight">Session Calendar</h1>
          <p className="text-sm text-text-secondary font-medium italic">Track your discipline, day by day.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-surface border border-border rounded-xl p-1 shadow-sm w-full md:w-auto">
          <button onClick={prevMonth} className="flex-1 md:flex-none p-3 text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-all active:scale-90">
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1 md:w-40 text-center font-bold text-text-primary uppercase tracking-widest text-xs">
            {format(currentDate, 'MMMM yyyy')}
          </div>
          <button onClick={nextMonth} className="flex-1 md:flex-none p-3 text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-all active:scale-90">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Monthly Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="glass-panel p-4 flex items-center gap-4">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
            monthlyPnl >= 0 ? "bg-profit/10 text-profit" : "bg-loss/10 text-loss"
          )}>
            {monthlyPnl >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
          </div>
          <div className="truncate">
            <div className="text-[10px] text-text-muted uppercase font-bold tracking-wider mb-0.5">Net P/L</div>
            <div className={cn("font-black text-xl font-mono tracking-tighter truncate", monthlyPnl >= 0 ? "text-profit" : "text-loss")}>
              {monthlyPnl >= 0 ? '+' : '-'}${Math.abs(monthlyPnl).toFixed(0)}
            </div>
          </div>
        </div>

        <div className="glass-panel p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0 border border-accent/20">
            <Target size={20} />
          </div>
          <div>
            <div className="text-[10px] text-text-muted uppercase font-bold tracking-wider mb-0.5">Win Rate</div>
            <div className="font-black text-xl text-text-primary tracking-tighter">{winRate}%</div>
          </div>
        </div>

        <div className="glass-panel p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-surface-hover flex items-center justify-center text-text-primary shrink-0 border border-border">
            <Activity size={20} />
          </div>
          <div>
            <div className="text-[10px] text-text-muted uppercase font-bold tracking-wider mb-0.5">Trades</div>
            <div className="font-black text-xl text-text-primary tracking-tighter">{monthlyTrades}</div>
          </div>
        </div>
        
        <div className="glass-panel p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-surface-hover flex items-center justify-center text-text-primary shrink-0 border border-border">
            <CalendarIcon size={20} />
          </div>
          <div>
            <div className="text-[10px] text-text-muted uppercase font-bold tracking-wider mb-0.5">Active</div>
            <div className="font-black text-xl text-text-primary tracking-tighter">{totalDaysTraded} <span className="text-[10px] font-medium text-text-muted opacity-60">Days</span></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Calendar Grid */}
        <div className="md:col-span-3 glass-panel overflow-hidden flex flex-col border border-border">
          <div className="grid grid-cols-7 border-b border-border bg-surface-hover/50">
            {weekDays.map(day => (
              <div key={day} className="py-3 text-center text-[10px] font-bold text-text-muted uppercase tracking-widest border-r border-border last:border-r-0">
                {day}
              </div>
            ))}
          </div>
          <div className="flex-1 flex flex-col bg-background border-t-0 border-l border-border [&>div>div:first-child]:border-l-0">
            {rows}
          </div>
        </div>

        {/* Daily Details Panel - Desktop Only */}
        <div className="hidden md:block md:col-span-1 h-full">
          <DetailPanel />
        </div>
      </div>

      {/* Mobile Bottom Sheet */}
      <AnimatePresence>
        {isSheetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSheetOpen(false)}
              className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="md:hidden fixed bottom-0 left-0 right-0 max-h-[85vh] bg-surface rounded-t-3xl z-[70] shadow-2xl safe-area-pb"
            >
              <div className="w-12 h-1 bg-border/50 rounded-full mx-auto my-3" />
              <div className="overflow-y-auto max-h-[calc(85vh-3rem)]">
                <DetailPanel isMobile />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
