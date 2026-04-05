import { useState } from "react";
import { Search, Plus, Moon, Sun, ChevronDown, Check } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { TradeEntryModal } from "./TradeEntryModal";
import { cn } from "@/lib/utils";

export function Topbar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState("Main Account");
  const [selectedDateRange, setSelectedDateRange] = useState("This Week");

  const accounts = ["Main Account", "Prop Firm Challenge", "Crypto Portfolio"];
  const dateRanges = ["Today", "This Week", "This Month", "This Year", "All Time"];

  return (
    <>
      <header className="h-16 border-b border-border bg-background flex items-center justify-between px-8 sticky top-0 z-10">
        <div className="flex items-center gap-6">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="flex items-center gap-2 text-sm font-medium text-text-primary hover:text-accent transition-colors outline-none">
                {selectedAccount} <ChevronDown size={14} className="text-text-muted" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content 
                className="min-w-[200px] bg-surface border border-border rounded-lg shadow-xl p-1 z-50 animate-in fade-in zoom-in-95 duration-200"
                align="start"
                sideOffset={8}
              >
                {accounts.map(account => (
                  <DropdownMenu.Item 
                    key={account}
                    onClick={() => setSelectedAccount(account)}
                    className="flex items-center justify-between px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-md cursor-pointer outline-none transition-colors"
                  >
                    {account}
                    {selectedAccount === account && <Check size={14} className="text-accent" />}
                  </DropdownMenu.Item>
                ))}
                <DropdownMenu.Separator className="h-px bg-border my-1" />
                <DropdownMenu.Item className="px-3 py-2 text-sm text-accent hover:text-indigo-400 hover:bg-surface-hover rounded-md cursor-pointer outline-none transition-colors">
                  + Add New Account
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
          
          <div className="relative group">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent transition-colors" />
            <input 
              type="text" 
              placeholder="Search trades, pairs..." 
              className="bg-surface border border-border rounded-full pl-9 pr-4 py-1.5 text-sm w-64 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="flex items-center gap-2 text-sm text-text-secondary bg-surface px-3 py-1.5 rounded-full border border-border hover:text-text-primary hover:border-accent/50 transition-colors outline-none">
                <span>{selectedDateRange}</span>
                <ChevronDown size={14} />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content 
                className="min-w-[160px] bg-surface border border-border rounded-lg shadow-xl p-1 z-50 animate-in fade-in zoom-in-95 duration-200"
                align="end"
                sideOffset={8}
              >
                {dateRanges.map(range => (
                  <DropdownMenu.Item 
                    key={range}
                    onClick={() => setSelectedDateRange(range)}
                    className="flex items-center justify-between px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-md cursor-pointer outline-none transition-colors"
                  >
                    {range}
                    {selectedDateRange === range && <Check size={14} className="text-accent" />}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          <button className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:bg-surface hover:text-text-primary transition-colors">
            <Sun size={18} />
          </button>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-accent hover:bg-indigo-400 text-white px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 transition-colors shadow-lg shadow-accent/20"
          >
            <Plus size={16} />
            Log Trade
          </button>
        </div>
      </header>

      <TradeEntryModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
}
