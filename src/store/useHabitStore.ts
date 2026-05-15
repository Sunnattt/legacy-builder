import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Habit } from "@/types/wealthflow";
import { buildMockHabits } from "@/lib/mockData";
import { todayISO } from "@/lib/dates";

interface State {
  habits: Habit[];
  toggleToday: (id: string) => void;
  add: (name: string, icon: string) => void;
  remove: (id: string) => void;
}

export const useHabitStore = create<State>()(
  persist(
    (set) => ({
      habits: buildMockHabits(),
      toggleToday: (id) =>
        set((s) => ({
          habits: s.habits.map((h) => {
            if (h.id !== id) return h;
            const today = todayISO();
            const has = h.completed_dates.includes(today);
            const dates = has
              ? h.completed_dates.filter((d) => d !== today)
              : [today, ...h.completed_dates];
            const streak = has ? Math.max(0, h.streak - 1) : h.streak + 1;
            return {
              ...h,
              completed_dates: dates,
              streak,
              longest_streak: Math.max(h.longest_streak, streak),
            };
          }),
        })),
      add: (name, icon) =>
        set((s) => ({
          habits: [
            {
              id: Math.random().toString(36).slice(2, 11),
              name, icon,
              streak: 0, longest_streak: 0, completed_dates: [],
            },
            ...s.habits,
          ],
        })),
      remove: (id) => set((s) => ({ habits: s.habits.filter((h) => h.id !== id) })),
    }),
    { name: "wf-habits" }
  )
);
