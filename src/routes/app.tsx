import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { TabBar } from "@/components/wf/TabBar";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/app")({
  // Protect every /app/* route. Runs on the client; the browser Supabase
  // client restores the session from localStorage before this resolves.
  beforeLoad: async ({ location }) => {
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
  return (
    <div className="mx-auto min-h-screen max-w-md pb-24">
      <Outlet />
      <TabBar />
    </div>
  );
}
