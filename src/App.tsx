/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { BottomNav } from "./components/BottomNav";
import { Dashboard } from "./pages/Dashboard";
import { Journal } from "./pages/Journal";
import { Analytics } from "./pages/Analytics";
import { Psychology } from "./pages/Psychology";
import { SetupLibrary } from "./pages/SetupLibrary";
import { Calendar } from "./pages/Calendar";
import AICoach from "./pages/AICoach";
import { QuickLog } from "./components/QuickLog";
import { TradeEntryModal } from "./components/TradeEntryModal";
import { useStore } from "./store";
import { Loader2 } from "lucide-react";

export default function App() {
  const [isAppLoading, setIsAppLoading] = useState(true);

  const isTradeModalOpen = useStore(state => state.isTradeModalOpen);
  const setTradeModalOpen = useStore(state => state.setTradeModalOpen);
  const isQuickLogOpen = useStore(state => state.isQuickLogOpen);
  const setQuickLogOpen = useStore(state => state.setQuickLogOpen);

  useEffect(() => {
    // Simulate initial data fetching
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isAppLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-text-muted">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
          <p className="text-sm font-medium">Loading your journal...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background flex">
        <Sidebar className="hidden md:flex" />
        
        <div className="flex-1 ml-0 md:ml-64 flex flex-col min-h-screen pb-24 md:pb-0">
          <Topbar />
          
          <main className="flex-1 overflow-y-auto safe-area-pb">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/trades" element={<Journal />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/psychology" element={<Psychology />} />
              <Route path="/setups" element={<SetupLibrary />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/aicoach" element={<AICoach />} />
            </Routes>
          </main>
        </div>
        
        <BottomNav className="md:hidden fixed bottom-0 left-0 right-0 z-50" />
      </div>
      <Toaster position="bottom-right" theme="dark" />
      <TradeEntryModal open={isTradeModalOpen} onOpenChange={setTradeModalOpen} />
      <QuickLog open={isQuickLogOpen} onOpenChange={setQuickLogOpen} />
    </>
  );
}
