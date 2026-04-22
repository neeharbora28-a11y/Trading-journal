import React, { useState } from "react";
import { Search, Plus, Moon, Sun, ChevronDown, Check, Zap, Menu, LineChart as LogoIcon, X } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { AddAccountModal } from "./AddAccountModal";
import { cn } from "@/lib/utils";
import { useStore } from "@/store";
import { toast } from "sonner";
import { Sidebar } from "./Sidebar";

export function Topbar() {
  const isModalOpen = useStore(state => state.isTradeModalOpen);
  const setIsModalOpen = useStore(state => state.setTradeModalOpen);
  const setQuickLogOpen = useStore(state => state.setQuickLogOpen);
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const accounts = useStore(state => state.accounts);
  const selectedAccountId = useStore(state => state.selectedAccountId);
  const setSelectedAccountId = useStore(state => state.setSelectedAccountId);
  
  const selectedDateRange = useStore(state => state.selectedDateRange);
  const setSelectedDateRange = useStore(state => state.setSelectedDateRange);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const dateRanges = ["Today", "This Week", "This Month", "This Year", "All Time"];

  const currentAccount = accounts.find(a => a.id === selectedAccountId) || accounts[0];

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    toast.success(`Theme toggled to ${!isDarkMode ? 'Dark' : 'Light'} mode!`);
  };

  return (
    <>
      <header className="h-16 md:h-20 border-b border-border bg-background flex items-center justify-between px-4 md:px-8 sticky top-0 z-40 safe-area-pt">
        <div className="flex items-center gap-3">
          {/* Mobile Hamburguer */}
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden w-10 h-10 flex items-center justify-center text-text-secondary hover:text-text-primary tap-target-48"
          >
            <Menu size={24} />
          </button>

          {/* Mobile Logo */}
          <div className="flex md:hidden items-center gap-2 text-accent font-black tracking-tighter">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white shadow-lg shadow-accent/20">
              <LogoIcon size={18} strokeWidth={3} />
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="flex items-center gap-2 text-sm font-bold text-text-primary hover:text-accent transition-colors outline-none tap-target-48">
                  {currentAccount?.name || "Select Account"} <ChevronDown size={14} className="text-text-muted" />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content 
                  className="min-w-[200px] bg-surface border border-border rounded-xl shadow-xl p-1 z-50 animate-in fade-in zoom-in-95 duration-200"
                  align="start"
                  sideOffset={8}
                >
                  {accounts.map(account => (
                    <DropdownMenu.Item 
                      key={account.id}
                      onClick={() => setSelectedAccountId(account.id)}
                      className="flex items-center justify-between px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg cursor-pointer outline-none transition-colors"
                    >
                      {account.name}
                      {selectedAccountId === account.id && <Check size={14} className="text-accent" />}
                    </DropdownMenu.Item>
                  ))}
                  <DropdownMenu.Separator className="h-px bg-border my-1" />
                  <DropdownMenu.Item 
                    onClick={() => setIsAddAccountOpen(true)}
                    className="px-3 py-2 text-sm font-bold text-accent hover:text-indigo-400 hover:bg-surface-hover rounded-lg cursor-pointer outline-none transition-colors"
                  >
                    + Add New Account
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
            
            <div className="relative group">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent transition-colors" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-surface border border-border rounded-full pl-9 pr-4 py-2 text-sm w-48 md:w-64 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all font-medium"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="flex items-center gap-2 text-xs md:text-sm font-bold text-text-secondary bg-surface px-4 py-2 rounded-full border border-border hover:text-text-primary hover:border-accent/50 transition-colors outline-none h-10">
                <span>{selectedDateRange}</span>
                <ChevronDown size={14} />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content 
                className="min-w-[160px] bg-surface border border-border rounded-xl shadow-xl p-1 z-50 animate-in fade-in zoom-in-95 duration-200"
                align="end"
                sideOffset={8}
              >
                {dateRanges.map(range => (
                  <DropdownMenu.Item 
                    key={range}
                    onClick={() => setSelectedDateRange(range)}
                    className="flex items-center justify-between px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg cursor-pointer outline-none transition-colors"
                  >
                    {range}
                    {selectedDateRange === range && <Check size={14} className="text-accent" />}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          <button 
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full flex items-center justify-center text-text-secondary hover:bg-surface hover:text-text-primary transition-colors tap-target-48"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button 
            onClick={() => setQuickLogOpen(true)}
            className="hidden md:flex h-10 bg-accent hover:bg-accent/90 text-white px-5 py-2 rounded-xl text-sm font-black items-center gap-2 transition-all shadow-lg shadow-accent/20"
          >
            <Zap size={16} className="fill-current" />
            Quick
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-[100]">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" 
            onClick={() => setIsSidebarOpen(false)} 
          />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-surface shadow-2xl animate-in slide-in-from-left duration-300 pointer-events-none">
            <div className="pointer-events-auto h-full overflow-y-auto">
              <Sidebar className="w-full relative h-full border-r-0" />
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-text-secondary tap-target-48"
              >
                <X size={24} />
              </button>
            </div>
          </div>
        </div>
      )}

      <AddAccountModal open={isAddAccountOpen} onOpenChange={setIsAddAccountOpen} />
    </>
  );
}
