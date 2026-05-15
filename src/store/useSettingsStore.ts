import { create } from "zustand";
import { persist } from "zustand/middleware";

interface State {
  currency: string;
  privacyMode: boolean;
  reminderHour: number;
  setCurrency: (c: string) => void;
  togglePrivacy: () => void;
  setReminder: (h: number) => void;
}

export const useSettingsStore = create<State>()(
  persist(
    (set) => ({
      currency: "USD",
      privacyMode: false,
      reminderHour: 20,
      setCurrency: (c) => set({ currency: c }),
      togglePrivacy: () => set((s) => ({ privacyMode: !s.privacyMode })),
      setReminder: (h) => set({ reminderHour: h }),
    }),
    { name: "wf-settings" }
  )
);
