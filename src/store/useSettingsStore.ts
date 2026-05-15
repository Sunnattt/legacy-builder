import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/integrations/supabase/client";

interface State {
  currency: string;
  privacyMode: boolean;
  reminderHour: number;
  hydrated: boolean;
  setCurrency: (c: string) => void;
  togglePrivacy: () => void;
  setReminder: (h: number) => void;
  hydrateFromCloud: () => Promise<void>;
}

async function persistToCloud(patch: { currency?: string; privacy_mode?: boolean }) {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;
  await supabase.from("profiles").update(patch).eq("id", data.user.id);
}

export const useSettingsStore = create<State>()(
  persist(
    (set, get) => ({
      currency: "USD",
      privacyMode: false,
      reminderHour: 20,
      hydrated: false,
      setCurrency: (c) => {
        set({ currency: c });
        void persistToCloud({ currency: c });
      },
      togglePrivacy: () => {
        const next = !get().privacyMode;
        set({ privacyMode: next });
        void persistToCloud({ privacy_mode: next });
      },
      setReminder: (h) => set({ reminderHour: h }),
      hydrateFromCloud: async () => {
        const { data: u } = await supabase.auth.getUser();
        if (!u.user) return;
        const { data } = await supabase
          .from("profiles")
          .select("currency, privacy_mode")
          .eq("id", u.user.id)
          .maybeSingle();
        if (data) {
          set({
            currency: data.currency ?? get().currency,
            privacyMode: data.privacy_mode ?? get().privacyMode,
            hydrated: true,
          });
        } else {
          set({ hydrated: true });
        }
      },
    }),
    { name: "wf-settings" }
  )
);
