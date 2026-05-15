import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Check, Landmark, TrendingUp } from "lucide-react";
import { useTransactionStore } from "@/store/useTransactionStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { CATEGORIES } from "@/lib/categories";
import { currencySymbol, parseCurrencyInput, convertToBase } from "@/lib/currency";
import { todayISO } from "@/lib/dates";
import { haptic } from "@/lib/haptics";
import { Button } from "@/components/wf/Button";
import { cn } from "@/lib/utils";
import type { TransactionType } from "@/types/wealthflow";

export const Route = createFileRoute("/app/add")({
  head: () => ({ meta: [{ title: "Add transaction — WealthFlow" }] }),
  component: AddTxPage,
});

const TYPES: { value: TransactionType; label: string; icon: typeof ArrowUpRight; tone: string; bg: string; ring: string }[] = [
  { value: "income",     label: "Income",     icon: ArrowUpRight,   tone: "var(--positive)", bg: "#28C78A1A", ring: "#28C78A" },
  { value: "expense",    label: "Expense",    icon: ArrowDownRight, tone: "var(--negative)", bg: "#E045451A", ring: "#E04545" },
  { value: "saving",     label: "Saving",     icon: Landmark,       tone: "var(--gold)",     bg: "var(--gold-glow)", ring: "var(--gold)" },
  { value: "investment", label: "Investment", icon: TrendingUp,     tone: "var(--info)",     bg: "#4A8FE81A", ring: "#4A8FE8" },
];

function AddTxPage() {
  const navigate = useNavigate();
  const { add } = useTransactionStore();
  const { currency } = useSettingsStore();
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES.expense[0].name);
  const [note, setNote] = useState("");
  const [date, setDate] = useState(todayISO());
  const [recurring, setRecurring] = useState(false);
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly">("monthly");
  const [shake, setShake] = useState(0);
  const [success, setSuccess] = useState(false);

  const sym = currencySymbol(currency);
  const cats = useMemo(() => CATEGORIES[type], [type]);

  const formattedAmount = useMemo(() => {
    const n = parseCurrencyInput(amount);
    if (!amount) return "";
    return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  }, [amount]);

  const handleType = (t: TransactionType) => {
    setType(t);
    setCategory(CATEGORIES[t][0].name);
    haptic("tap");
  };

  const submit = () => {
    const n = parseCurrencyInput(amount);
    if (n <= 0) {
      setShake((s) => s + 1);
      haptic("error");
      return;
    }
    add({
      type,
      amount: n,
      category,
      note: note.trim() ? `${recurring ? `[${frequency}] ` : ""}${note.trim()}` : recurring ? `[${frequency}]` : null,
      date,
    });
    haptic("success");
    setSuccess(true);
    setTimeout(() => navigate({ to: "/app" }), 800);
  };

  return (
    <main className="px-5 pt-8 pb-8">
      <header className="mb-6">
        <h1 className="text-3xl font-black tracking-tight">Add</h1>
        <p className="text-sm text-text-second">Log a new movement of money.</p>
      </header>

      {/* Type selector */}
      <section className="mb-6 grid grid-cols-2 gap-3">
        {TYPES.map((t) => {
          const Icon = t.icon;
          const active = t.value === type;
          return (
            <motion.button
              key={t.value}
              whileTap={{ scale: 0.97 }}
              animate={{ scale: active ? 1.02 : 1 }}
              onClick={() => handleType(t.value)}
              className={cn(
                "flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-colors",
                active ? "shadow-card" : "border-border bg-surface"
              )}
              style={{
                background: active ? t.bg : undefined,
                borderColor: active ? t.ring : undefined,
              }}
            >
              <span
                className="grid h-9 w-9 place-items-center rounded-full"
                style={{ background: t.bg, color: t.tone }}
              >
                <Icon size={18} />
              </span>
              <span className="text-sm font-bold" style={{ color: active ? t.tone : "var(--text-primary)" }}>
                {t.label}
              </span>
            </motion.button>
          );
        })}
      </section>

      {/* Amount */}
      <motion.section
        key={shake}
        animate={shake > 0 ? { x: [-8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6 rounded-2xl border border-border bg-surface p-6 shadow-card"
      >
        <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-second">Amount</div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-bold text-text-second">{sym}</span>
          <input
            type="text"
            inputMode="decimal"
            value={formattedAmount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
            placeholder="0"
            className="w-full bg-transparent text-5xl font-black tabular outline-none placeholder:text-text-dim"
          />
        </div>
      </motion.section>

      {/* Category chips */}
      <section className="mb-6">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-text-second">Category</div>
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 no-scrollbar">
          {cats.map((c) => {
            const active = c.name === category;
            return (
              <button
                key={c.name}
                onClick={() => { setCategory(c.name); haptic("tap"); }}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors",
                  active
                    ? "border-transparent bg-gradient-gold text-[#07070E]"
                    : "border-border bg-surface text-text-primary hover:border-border-mid"
                )}
              >
                <span>{c.icon}</span>{c.name}
              </button>
            );
          })}
        </div>
      </section>

      {/* Note + date */}
      <section className="mb-6 grid grid-cols-1 gap-3">
        <div>
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-text-second">Note (optional)</div>
          <textarea
            value={note} onChange={(e) => setNote(e.target.value.slice(0, 120))}
            placeholder="What was this for?"
            rows={2}
            className="w-full resize-none rounded-xl border border-border-mid bg-surface px-3 py-2.5 text-sm outline-none focus:border-gold"
          />
          <div className="mt-1 text-right text-[10px] text-text-dim tabular">{note.length}/120</div>
        </div>
        <div>
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-text-second">Date</div>
          <input
            type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border border-border-mid bg-surface px-3 py-2.5 text-sm outline-none focus:border-gold"
          />
        </div>
      </section>

      {/* Recurring */}
      <section className="mb-8 rounded-2xl border border-border bg-surface p-4 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Recurring</div>
            <div className="text-xs text-text-second">Tag this as a repeating transaction.</div>
          </div>
          <button
            onClick={() => { setRecurring((v) => !v); haptic("tap"); }}
            className="relative h-7 w-12 rounded-full transition-colors"
            style={{ background: recurring ? "var(--gold)" : "var(--surface-mid)" }}
            aria-label="Toggle recurring"
          >
            <span
              className="absolute top-0.5 h-6 w-6 rounded-full bg-[#07070E] transition-all"
              style={{ left: recurring ? "calc(100% - 26px)" : 2 }}
            />
          </button>
        </div>

        <AnimatePresence>
          {recurring && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3 flex gap-2">
                {(["daily", "weekly", "monthly"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFrequency(f)}
                    className={cn(
                      "flex-1 rounded-lg border px-2 py-1.5 text-xs font-semibold capitalize",
                      frequency === f
                        ? "border-gold bg-[var(--gold-glow)] text-gold"
                        : "border-border bg-surface-mid text-text-second"
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <Button full size="lg" onClick={submit} disabled={success}>
        {success ? (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2">
            <Check size={18} /> Saved
          </motion.span>
        ) : (
          "Save transaction"
        )}
      </Button>
    </main>
  );
}
