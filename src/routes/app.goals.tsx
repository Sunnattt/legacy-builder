import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Pencil, Trash2, PiggyBank } from "lucide-react";
import { useGoalStore } from "@/store/useGoalStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { formatCurrency, parseCurrencyInput, convertToBase } from "@/lib/currency";
import { daysBetween, formatShortDate } from "@/lib/dates";
import { monthlyNeeded } from "@/lib/calculations";
import { GOAL_MILESTONES, milestonesReached, newlyReached, progressColor } from "@/lib/milestones";
import { Button } from "@/components/wf/Button";
import { ProgressBar } from "@/components/wf/ProgressBar";
import { EmptyState } from "@/components/wf/EmptyState";
import { Confetti } from "@/components/wf/Confetti";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import type { Goal } from "@/types/wealthflow";

export const Route = createFileRoute("/app/goals")({
  head: () => ({ meta: [{ title: "Goals — WealthFlow" }] }),
  component: GoalsPage,
});

const EMOJI_OPTIONS = ["🏠","🚗","🛡️","🎯","🏖️","💍","🎓","💼","🛩️","⛵","🏆","💎","🎮","📚","🍣","🐶","🌍","💰","🧘","🎁"];
const COLOR_OPTIONS = ["#C9A84C","#28C78A","#4A8FE8","#7C5CBF","#E04545","#E6C97A"];

type GoalFilter = "all" | "active" | "completed";

function GoalsPage() {
  const { goals, add, update, remove } = useGoalStore();
  const { currency, privacyMode } = useSettingsStore();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [confettiTick, setConfettiTick] = useState(0);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [filter, setFilter] = useState<GoalFilter>("all");

  const isDone = (g: Goal) =>
    g.is_completed || Number(g.current_amount) >= Number(g.target_amount);

  const stats = useMemo(() => {
    const completed = goals.filter(isDone).length;
    return { total: goals.length, active: goals.length - completed, completed };
  }, [goals]);

  const visibleGoals = useMemo(() => {
    if (filter === "active") return goals.filter((g) => !isDone(g));
    if (filter === "completed") return goals.filter(isDone);
    return goals;
  }, [goals, filter]);

  const filterMeta: Record<GoalFilter, { title: string; subtitle: string; emptyTitle: string; emptySub: string }> = {
    all: { title: "All goals", subtitle: "Every milestone on your path.", emptyTitle: "No goals yet", emptySub: "Tap + to create your first financial goal." },
    active: { title: "Active goals", subtitle: "Still chasing the target.", emptyTitle: "No active goals", emptySub: "Every goal is complete — set a new one." },
    completed: { title: "Completed goals", subtitle: "Wins you've already locked in.", emptyTitle: "Nothing completed yet", emptySub: "Keep contributing — your first win is close." },
  };
  const meta = filterMeta[filter];

  const handleAddFunds = (g: Goal, amount: number) => {
    if (amount <= 0) return;
    const oldPct = (Number(g.current_amount) / Number(g.target_amount)) * 100;
    const next = Math.min(Number(g.target_amount), Number(g.current_amount) + amount);
    const newPct = (next / Number(g.target_amount)) * 100;
    const crossed = newlyReached(oldPct, newPct);
    const reached = milestonesReached(newPct);
    update(g.id, {
      current_amount: next,
      milestones_hit: reached,
      is_completed: newPct >= 100,
    });
    if (crossed.length > 0) {
      haptic("success");
      setConfettiTick((n) => n + 1);
    } else {
      haptic("tap");
    }
  };

  return (
    <main className="px-5 pt-8">
      <Confetti trigger={confettiTick} />

      <header className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Goals</h1>
          <p className="text-sm text-text-second">Track every milestone to your empire.</p>
        </div>
        <button
          onClick={() => { haptic("tap"); setSheetOpen(true); }}
          className="grid h-11 w-11 place-items-center rounded-full bg-gradient-gold text-[#07070E] shadow-glow"
          aria-label="Add goal"
        >
          <Plus size={22} strokeWidth={2.6} />
        </button>
      </header>

      {/* Stats chips */}
      <div className="mb-6 grid grid-cols-3 gap-2">
        {[
          { label: "Total", value: stats.total },
          { label: "Active", value: stats.active },
          { label: "Completed", value: stats.completed },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-surface px-3 py-3 text-center shadow-card">
            <div className="text-xl font-black tabular text-gradient-gold">{s.value}</div>
            <div className="text-[10px] uppercase tracking-widest text-text-second">{s.label}</div>
          </div>
        ))}
      </div>

      {goals.length === 0 ? (
        <EmptyState
          icon="🎯"
          title="No goals yet"
          subtitle="Tap + to create your first financial goal."
          action={<Button onClick={() => setSheetOpen(true)}>Create goal</Button>}
        />
      ) : (
        <div className="space-y-4">
          {goals.map((g) => (
            <GoalCard
              key={g.id}
              goal={g}
              currency={currency}
              privacyMode={privacyMode}
              onAddFunds={(amt) => handleAddFunds(g, convertToBase(amt, currency))}
              onMenu={() => setMenuId(g.id)}
            />
          ))}
        </div>
      )}

      {/* Goal action menu */}
      <AnimatePresence>
        {menuId && (
          <Sheet onClose={() => setMenuId(null)} title="Goal options">
            <div className="space-y-2">
              <SheetButton icon={<Pencil size={18} />} label="Edit goal (rename)" onClick={() => {
                const g = goals.find((x) => x.id === menuId);
                if (!g) return;
                const t = prompt("New title", g.title);
                if (t) update(g.id, { title: t });
                setMenuId(null);
              }} />
              <SheetButton
                icon={<Trash2 size={18} />}
                label="Delete goal"
                tone="danger"
                onClick={() => {
                  if (confirm("Delete this goal? This cannot be undone.")) {
                    remove(menuId);
                    setMenuId(null);
                  }
                }}
              />
            </div>
          </Sheet>
        )}
      </AnimatePresence>

      {/* Add goal sheet */}
      <AnimatePresence>
        {sheetOpen && (
          <Sheet onClose={() => setSheetOpen(false)} title="New goal">
            <AddGoalForm
              onSubmit={(g) => {
                add({
                  ...g,
                  // Convert user-entered target into the base currency (USD)
                  // so display can convert into any currency consistently.
                  target_amount: convertToBase(Number(g.target_amount), currency),
                });
                haptic("success");
                setSheetOpen(false);
              }}
            />
          </Sheet>
        )}
      </AnimatePresence>
    </main>
  );
}

function GoalCard({
  goal, currency, privacyMode, onAddFunds, onMenu,
}: {
  goal: Goal; currency: string; privacyMode: boolean;
  onAddFunds: (amt: number) => void; onMenu: () => void;
}) {
  const target = Number(goal.target_amount);
  const current = Number(goal.current_amount);
  const pct = Math.min(100, (current / target) * 100);
  const reached = milestonesReached(pct);
  const daysLeft = goal.deadline ? daysBetween(new Date(), goal.deadline) : null;
  const monthly = monthlyNeeded(target, current, goal.deadline);
  const monthsLeft = goal.deadline ? Math.max(0, Math.ceil((daysLeft ?? 0) / 30)) : null;
  const blur = (s: string) => (privacyMode ? "••••" : s);
  const [addOpen, setAddOpen] = useState(false);
  const [amt, setAmt] = useState("");

  let pressTimer: ReturnType<typeof setTimeout> | null = null;
  const startPress = () => { pressTimer = setTimeout(() => onMenu(), 500); };
  const endPress = () => { if (pressTimer) clearTimeout(pressTimer); };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      onMouseDown={startPress} onMouseUp={endPress} onMouseLeave={endPress}
      onTouchStart={startPress} onTouchEnd={endPress}
      className="rounded-2xl border border-border bg-surface p-5 shadow-card"
      style={{ borderColor: pct >= 100 ? "var(--positive)" : undefined }}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-2xl"
            style={{ background: `${goal.color}1F`, border: `1px solid ${goal.color}44` }}
          >
            {goal.emoji}
          </div>
          <div className="min-w-0">
            <div className="truncate font-bold text-text-primary">{goal.title}</div>
            <div className="text-xs text-text-second">
              Target <span className="tabular text-text-primary">{blur(formatCurrency(target, currency, { decimals: 0 }))}</span>
            </div>
          </div>
        </div>
        {daysLeft !== null && (
          <div className="text-right">
            <div className="tabular text-sm font-bold" style={{ color: progressColor(pct) }}>
              {Math.max(0, daysLeft)}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-text-second">days left</div>
          </div>
        )}
      </div>

      <div className="mb-2 flex items-baseline justify-between">
        <span className="tabular text-xs text-text-second">
          {blur(formatCurrency(current, currency))} <span className="text-text-dim">of</span> {blur(formatCurrency(target, currency))}
        </span>
        <span className="tabular text-sm font-black" style={{ color: progressColor(pct) }}>
          {pct.toFixed(0)}%
        </span>
      </div>
      <ProgressBar value={pct} color={progressColor(pct)} height={10} />

      {/* Milestone chips */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {GOAL_MILESTONES.map((m) => {
          const hit = reached.includes(m);
          return (
            <span
              key={m}
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-semibold tabular border",
                hit
                  ? "border-transparent bg-gradient-gold text-[#07070E]"
                  : "border-border-mid text-text-second"
              )}
            >
              {hit ? "✓ " : ""}{m}%
            </span>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <div className="text-[11px] text-text-second">
          {goal.deadline
            ? <>Need <span className="tabular text-text-primary">{formatCurrency(monthly, currency, { decimals: 0 })}</span>/mo · {monthsLeft} months left · by {formatShortDate(goal.deadline)}</>
            : <>No deadline set</>}
        </div>
        <button
          onClick={() => setAddOpen((v) => !v)}
          className="inline-flex items-center gap-1 rounded-full border border-[var(--gold-dim)] bg-[var(--gold-glow)] px-3 py-1 text-[11px] font-semibold text-gold"
        >
          <PiggyBank size={12} /> Add
        </button>
      </div>

      <AnimatePresence>
        {addOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 flex items-center gap-2">
              <input
                type="text" inputMode="decimal" autoFocus
                value={amt} onChange={(e) => setAmt(e.target.value)}
                placeholder="Amount"
                className="flex-1 rounded-lg border border-border-mid bg-surface-mid px-3 py-2 text-sm tabular outline-none focus:border-gold"
              />
              <Button
                size="sm"
                onClick={() => {
                  onAddFunds(parseCurrencyInput(amt));
                  setAmt("");
                  setAddOpen(false);
                }}
              >
                Save
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Sheet({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <motion.div className="fixed inset-0 z-50">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 280 }}
        className="absolute inset-x-0 bottom-0 mx-auto max-w-md rounded-t-3xl border-t border-border bg-surface p-5 pb-8 shadow-glow"
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-surface-mid" />
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="rounded-full p-1.5 text-text-second hover:bg-surface-mid">
            <X size={18} />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

function SheetButton({
  icon, label, tone = "default", onClick,
}: { icon: React.ReactNode; label: string; tone?: "default" | "danger"; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-colors",
        tone === "danger"
          ? "border-[#E0454533] bg-[#E045451A] text-[var(--negative)] hover:bg-[#E0454526]"
          : "border-border bg-surface-mid text-text-primary hover:bg-surface-high"
      )}
    >
      <span className="opacity-80">{icon}</span>
      {label}
    </button>
  );
}

function AddGoalForm({ onSubmit }: { onSubmit: (g: Omit<Goal, "id" | "milestones_hit" | "is_completed">) => void }) {
  const [emoji, setEmoji] = useState(EMOJI_OPTIONS[0]);
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    const t = parseCurrencyInput(target);
    if (!title.trim()) return setError("Give your goal a name.");
    if (t <= 0) return setError("Target amount must be greater than 0.");
    onSubmit({
      title: title.trim(),
      emoji,
      target_amount: t,
      current_amount: 0,
      color,
      deadline: deadline || null,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Emoji</Label>
        <div className="grid grid-cols-10 gap-1.5">
          {EMOJI_OPTIONS.map((e) => (
            <button
              key={e}
              onClick={() => setEmoji(e)}
              className={cn(
                "grid h-9 place-items-center rounded-lg text-lg transition-colors",
                emoji === e ? "bg-gradient-gold ring-2 ring-gold" : "bg-surface-mid hover:bg-surface-high"
              )}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>Goal name</Label>
        <input
          value={title} onChange={(e) => setTitle(e.target.value)}
          placeholder="Dream House"
          className="w-full rounded-lg border border-border-mid bg-surface-mid px-3 py-2.5 text-sm outline-none focus:border-gold"
        />
      </div>

      <div>
        <Label>Target amount</Label>
        <input
          inputMode="decimal" value={target} onChange={(e) => setTarget(e.target.value)}
          placeholder="80,000"
          className="w-full rounded-lg border border-border-mid bg-surface-mid px-3 py-2.5 text-sm tabular outline-none focus:border-gold"
        />
      </div>

      <div>
        <Label>Deadline (optional)</Label>
        <input
          type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)}
          className="w-full rounded-lg border border-border-mid bg-surface-mid px-3 py-2.5 text-sm outline-none focus:border-gold"
        />
      </div>

      <div>
        <Label>Accent color</Label>
        <div className="flex gap-2">
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className="h-9 w-9 rounded-full transition-transform"
              style={{
                background: c,
                outline: color === c ? "2px solid var(--gold)" : "none",
                outlineOffset: 2,
                transform: color === c ? "scale(1.1)" : undefined,
              }}
            />
          ))}
        </div>
      </div>

      {error && <p className="text-xs text-[var(--negative)]">{error}</p>}

      <Button full onClick={submit}>Create goal</Button>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-second">{children}</div>;
}
