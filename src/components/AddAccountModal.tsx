import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Check } from "lucide-react";
import { useStore } from "@/store";
import { toast } from "sonner";

export function AddAccountModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const addAccount = useStore(state => state.addAccount);
  const [name, setName] = useState("");
  const [startingBalance, setStartingBalance] = useState("");

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Account name is required");
      return;
    }
    
    const balance = parseFloat(startingBalance);
    if (isNaN(balance) || balance < 0) {
      toast.error("Please enter a valid starting balance");
      return;
    }

    addAccount({
      name: name.trim(),
      startingBalance: balance
    });

    toast.success("Account created successfully!");
    onOpenChange(false);
    setTimeout(() => {
      setName("");
      setStartingBalance("");
    }, 300);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity" />
        <Dialog.Content className="fixed inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full md:max-w-md bg-surface border-0 md:border border-border rounded-none md:rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden">
          
          <div className="p-4 md:p-6 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <Dialog.Title className="text-xl font-bold text-text-primary">Add New Account</Dialog.Title>
              <Dialog.Close className="text-text-muted hover:text-text-primary transition-colors">
                <X size={20} />
              </Dialog.Close>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-2">Account Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Prop Firm Challenge" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 md:py-2 text-base md:text-sm text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent" 
                />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-2">Starting Balance ($)</label>
                <input 
                  type="number" 
                  placeholder="10000" 
                  value={startingBalance}
                  onChange={(e) => setStartingBalance(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 md:py-2 text-base md:text-sm text-text-primary font-mono focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent" 
                />
              </div>
            </div>

            <div className="flex items-center justify-end mt-auto md:mt-8 pt-6 border-t border-border gap-3">
              <Dialog.Close className="px-4 py-3 md:py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
                Cancel
              </Dialog.Close>
              
              <button 
                onClick={handleSave}
                disabled={!name.trim() || !startingBalance}
                className="bg-accent hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 md:py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
              >
                Create Account <Check size={16} />
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
