import { createFileRoute } from "@tanstack/react-router";
import { EmptyState } from "@/components/wf/EmptyState";

export const Route = createFileRoute("/app/analytics")({
  head: () => ({ meta: [{ title: "Analytics — WealthFlow" }] }),
  component: () => (
    <main className="px-5 pt-10">
      <h1 className="mb-6 text-3xl font-black tracking-tight">Analytics</h1>
      <EmptyState icon="📊" title="Coming in Phase 3" subtitle="Time-range charts, donut breakdowns, monthly comparisons, and trend cards arrive in Phase 3." />
    </main>
  ),
});
