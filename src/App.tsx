/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { Dashboard } from "./pages/Dashboard";
import { Journal } from "./pages/Journal";
import { Analytics } from "./pages/Analytics";
import { Psychology } from "./pages/Psychology";
import { SetupLibrary } from "./pages/SetupLibrary";
import { Calendar } from "./pages/Calendar";

export default function App() {
  const [activePage, setActivePage] = useState("dashboard");

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Topbar />
        
        <main className="flex-1 overflow-y-auto pb-12">
          {activePage === "dashboard" && <Dashboard />}
          {activePage === "journal" && <Journal />}
          {activePage === "analytics" && <Analytics />}
          {activePage === "psychology" && <Psychology />}
          {activePage === "setups" && <SetupLibrary />}
          {activePage === "calendar" && <Calendar />}
          {activePage === "trades" && <div className="p-8 text-text-secondary">Trades view coming soon...</div>}
        </main>
      </div>
    </div>
  );
}
