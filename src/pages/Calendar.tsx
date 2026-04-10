import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, TrendingUp, TrendingDown, Activity, Target, Plus } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, parseISO } from "date-fns";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useStore } from "@/store";

export function Calendar() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
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
        <div
          key={day.toString()}
          onClick={() => setSelectedDate(cloneDay)}
          className={cn(
            "min-h-[100px] p-2 border-r border-b border-border relative cursor-pointer transition-all duration-200 hover:bg-surface-hover group",
            !isSameMonth(day, monthStart) ? "text-text-muted bg-background/30" : "text-text-primary bg-surface",
            isSelected && "ring-2 ring-inset ring-accent bg-accent-muted/10 z-10"
          )}
        >
          <div className="flex justify-between items-start">
            <span className={cn(
              "text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full",
              isSameDay(day, new Date()) && "bg-accent text-white", // Highlight "today"
              isSelected && !isSameDay(day, new Date()) && "text-accent"
            )}>
              {formattedDate}
            </span>
            {dayData && (
              <span className="text-[10px] text-text-muted opacity-0 group-hover:opacity-100 transition-opacity">
                {dayData.trades} trades
              </span>
            )}
          </div>
          
          {dayData && (
            <div className="mt-2 flex flex-col gap-1.5">
              <span className={cn(
                "text-xs font-mono font-semibold px-1.5 py-0.5 rounded w-fit",
                dayData.pnl >= 0 ? "bg-profit-muted text-profit" : "bg-loss-muted text-loss"
              )}>
                {dayData.pnl >= 0 ? '+' : ''}${Math.abs(dayData.pnl).toFixed(2)}
              </span>
              <div className="flex gap-1 flex-wrap">
                {dayData.setups.slice(0, 2).map((setup, idx) => (
                  <span key={idx} className="w-1.5 h-1.5 rounded-full bg-accent" title={setup}></span>
                ))}
                {dayData.setups.length > 2 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-text-muted"></span>
                )}
              </div>
            </div>
          )}
        </div>
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

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Trading Calendar</h1>
          <p className="text-sm text-text-secondary">Visualize your performance and consistency over time.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-surface border border-border rounded-lg p-1">
          <button onClick={prevMonth} className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded transition-colors">
            <ChevronLeft size={18} />
          </button>
          <div className="w-32 text-center font-medium text-text-primary">
            {format(currentDate, 'MMMM yyyy')}
          </div>
          <button onClick={nextMonth} className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Monthly Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass-panel p-4 flex items-center gap-4">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            monthlyPnl >= 0 ? "bg-profit-muted text-profit" : "bg-loss-muted text-loss"
          )}>
            {monthlyPnl >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
          </div>
          <div>
            <div className="text-sm text-text-secondary">Net P/L</div>
            <div className={cn("font-bold text-lg font-mono", monthlyPnl >= 0 ? "text-profit" : "text-loss")}>
              {monthlyPnl >= 0 ? '+' : ''}${Math.abs(monthlyPnl).toFixed(2)}
            </div>
          </div>
        </div>

        <div className="glass-panel p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-accent-muted flex items-center justify-center text-accent">
            <Target size={20} />
          </div>
          <div>
            <div className="text-sm text-text-secondary">Winning Days</div>
            <div className="font-bold text-lg text-text-primary">{winRate}%</div>
          </div>
        </div>

        <div className="glass-panel p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-surface-hover flex items-center justify-center text-text-primary">
            <Activity size={20} />
          </div>
          <div>
            <div className="text-sm text-text-secondary">Total Trades</div>
            <div className="font-bold text-lg text-text-primary">{monthlyTrades}</div>
          </div>
        </div>
        
        <div className="glass-panel p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-surface-hover flex items-center justify-center text-text-primary">
            <CalendarIcon size={20} />
          </div>
          <div>
            <div className="text-sm text-text-secondary">Active Days</div>
            <div className="font-bold text-lg text-text-primary">{totalDaysTraded}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Calendar Grid */}
        <div className="md:col-span-3 glass-panel overflow-hidden flex flex-col">
          <div className="grid grid-cols-7 border-b border-border bg-surface-hover">
            {weekDays.map(day => (
              <div key={day} className="py-3 text-center text-xs font-medium text-text-secondary uppercase tracking-wider border-r border-border last:border-r-0">
                {day}
              </div>
            ))}
          </div>
          <div className="flex-1 flex flex-col bg-background border-t-0 border-l border-border [&>div>div:first-child]:border-l-0">
            {rows}
          </div>
        </div>

        {/* Daily Details Panel */}
        <div className="md:col-span-1 glass-panel p-6 flex flex-col">
          {selectedDate ? (
            <>
              <div className="mb-6">
                <h3 className="text-lg font-bold text-text-primary mb-1">
                  {format(selectedDate, 'EEEE')}
                </h3>
                <p className="text-sm text-text-secondary">
                  {format(selectedDate, 'MMMM d, yyyy')}
                </p>
              </div>

              {selectedDayData ? (
                <div className="space-y-6 flex-1">
                  <div className="p-4 rounded-lg border border-border bg-background">
                    <div className="text-sm text-text-secondary mb-1">Daily P/L</div>
                    <div className={cn(
                      "text-2xl font-bold font-mono",
                      selectedDayData.pnl >= 0 ? "text-profit" : "text-loss"
                    )}>
                      {selectedDayData.pnl >= 0 ? '+' : ''}${Math.abs(selectedDayData.pnl).toFixed(2)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg border border-border bg-background">
                      <div className="text-xs text-text-muted mb-1">Trades</div>
                      <div className="font-medium text-text-primary">{selectedDayData.trades}</div>
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-background">
                      <div className="text-xs text-text-muted mb-1">Win Rate</div>
                      <div className="font-medium text-text-primary">{selectedDayData.winRate}%</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-3">Setups Traded</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedDayData.setups.map((setup, idx) => (
                        <span key={idx} className="px-2 py-1 rounded bg-surface border border-border text-xs text-text-primary">
                          {setup}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-6">
                    <button 
                      onClick={() => navigate("/journal")}
                      className="w-full bg-surface hover:bg-surface-hover border border-border text-text-primary py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      View Trades
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-full bg-surface-hover flex items-center justify-center text-text-muted mb-4">
                    <CalendarIcon size={24} />
                  </div>
                  <p className="text-text-primary font-medium mb-1">No Activity</p>
                  <p className="text-sm text-text-secondary mb-6">You didn't log any trades on this day.</p>
                  <button 
                    onClick={() => setTradeModalOpen(true)}
                    className="flex items-center gap-2 text-sm text-accent hover:text-indigo-400 font-medium transition-colors"
                  >
                    <Plus size={16} /> Log a Trade
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-text-muted text-sm">
              Select a day to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
