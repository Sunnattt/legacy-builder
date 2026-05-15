import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Transaction } from "@/types/wealthflow";
import { buildMockTransactions } from "@/lib/mockData";

interface State {
  transactions: Transaction[];
  hydrated: boolean;
  add: (tx: Omit<Transaction, "id">) => Transaction;
  remove: (id: string) => void;
  setAll: (txs: Transaction[]) => void;
  reset: () => void;
}

export const useTransactionStore = create<State>()(
  persist(
    (set) => ({
      transactions: buildMockTransactions(),
      hydrated: false,
      add: (tx) => {
        const created: Transaction = { ...tx, id: Math.random().toString(36).slice(2, 11) };
        set((s) => ({ transactions: [created, ...s.transactions] }));
        return created;
      },
      remove: (id) => set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) })),
      setAll: (txs) => set({ transactions: txs }),
      reset: () => set({ transactions: buildMockTransactions() }),
    }),
    {
      name: "wf-transactions",
      onRehydrateStorage: () => (state) => {
        state && (state.hydrated = true);
      },
    }
  )
);
