import { createFileRoute } from "@tanstack/react-router";
import { EmptyState } from "@/components/wf/EmptyState";

export const Route = createFileRoute("/app/goals")({
  head: () => ({ meta: [{ title: "Goals — WealthFlow" }] }),
  component: () => (
    <main className="px-5 pt-10">
      <h1 className="mb-6 text-3xl font-black tracking-tight">Goals</h1>
      <EmptyState icon="🎯" title="Coming in Phase 2" subtitle="Full goal cards with milestones, progress animations, and confetti land in the next phase." />
    </main>
  ),
});
