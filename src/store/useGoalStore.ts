import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Goal } from "@/types/wealthflow";
import { buildMockGoals } from "@/lib/mockData";

interface State {
  goals: Goal[];
  add: (g: Omit<Goal, "id" | "milestones_hit" | "is_completed">) => Goal;
  update: (id: string, patch: Partial<Goal>) => void;
  remove: (id: string) => void;
  reset: () => void;
}

export const useGoalStore = create<State>()(
  persist(
    (set) => ({
      goals: buildMockGoals(),
      add: (g) => {
        const created: Goal = {
          ...g,
          id: Math.random().toString(36).slice(2, 11),
          milestones_hit: [],
          is_completed: false,
        };
        set((s) => ({ goals: [created, ...s.goals] }));
        return created;
      },
      update: (id, patch) =>
        set((s) => ({ goals: s.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)) })),
      remove: (id) => set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),
      reset: () => set({ goals: buildMockGoals() }),
    }),
    { name: "wf-goals" }
  )
);
