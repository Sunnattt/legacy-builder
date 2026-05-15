import { createFileRoute } from "@tanstack/react-router";
import { EmptyState } from "@/components/wf/EmptyState";

export const Route = createFileRoute("/app/add")({
  head: () => ({ meta: [{ title: "Add transaction — WealthFlow" }] }),
  component: () => (
    <main className="px-5 pt-10">
      <h1 className="mb-6 text-3xl font-black tracking-tight">Add</h1>
      <EmptyState icon="＋" title="Coming in Phase 2" subtitle="The full transaction form with type selector, giant amount input, and category chips ships next." />
    </main>
  ),
});
