import { createFileRoute, Outlet } from "@tanstack/react-router";
import { TabBar } from "@/components/wf/TabBar";

export const Route = createFileRoute("/app")({
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
