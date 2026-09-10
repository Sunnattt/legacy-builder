import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { TabBar } from "@/components/wf/TabBar";
import { supabase } from "@/integrations/supabase/client";
import { useSettingsStore } from "@/store/useSettingsStore";

export const Route = createFileRoute("/app")({
  // Protect every /app/* route. Runs on the client; the browser Supabase
  // client restores the session from localStorage before this resolves.
  beforeLoad: async ({ location }) => {
    // The session lives in browser storage only, so skip the check during SSR —
    // otherwise a refresh or direct link to /app always bounces to /login.
    if (typeof window === "undefined") return;
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
  },
  component: AppShell,
});

function AppShell() {
  const hydrate = useSettingsStore((s) => s.hydrateFromCloud);
  useEffect(() => {
    void hydrate();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) void hydrate();
    });
    return () => sub.subscription.unsubscribe();
  }, [hydrate]);
  return (
    <div className="mx-auto min-h-screen max-w-md pb-24">
      <Outlet />
      <TabBar />
    </div>
  );
}
