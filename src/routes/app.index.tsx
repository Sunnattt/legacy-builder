import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { MoreHorizontal, Sparkles, Wallet, TrendingUp, ArrowDownRight, ArrowUpRight, Flame } from "lucide-react";
import { useTransactionStore } from "@/store/useTransactionStore";
import { useGoalStore } from "@/store/useGoalStore";
import { useHabitStore } from "@/store/useHabitStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { netWorth, totalIncome, totalExpenses, totalSavings, totalInvestments, filterByMonth, savingsRate, momChange } from "@/lib/calculations";
import { buildMockSnapshots } from "@/lib/mockData";
import { formatCurrency } from "@/lib/currency";
import { todayISO } from "@/lib/dates";
import { AnimatedNumber } from "@/components/wf/AnimatedNumber";
import { ProgressRing } from "@/components/wf/ProgressRing";
import { ProgressBar } from "@/components/wf/ProgressBar";
import { NetWorthChart } from "@/components/wf/NetWorthChart";
import { StatGrid } from "@/components/wf/StatGrid";
import { TransactionItem } from "@/components/wf/TransactionItem";
import { GoldDivider } from "@/components/wf/GoldDivider";
import { Badge } from "@/components/wf/Badge";

export const Route = createFileRoute("/app/")({
  head: () => ({ meta: [{ title: "Dashboard — WealthFlow" }] }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const { transactions } = useTransactionStore();
  const { goals } = useGoalStore();
  const { habits } = useHabitStore();
  const { currency, privacyMode } = useSettingsStore();

  const snapshots = useMemo(() => buildMockSnapshots(), []);
  const nw = useMemo(() => netWorth(transactions), [transactions]);

  const now = new Date();
  const cm = now.getUTCMonth();
  const cy = now.getUTCFullYear();
  const prev = new Date(cy, cm - 1, 1);
  const thisMonth = useMemo(() => filterByMonth(transactions, cy, cm), [transactions, cy, cm]);
  const lastMonth = useMemo(() => filterByMonth(transactions, prev.getUTCFullYear(), prev.getUTCMonth()), [transactions, prev]);

  const incomeM = totalIncome(thisMonth);
  const expensesM = totalExpenses(thisMonth);
  const savingsM = totalSavings(thisMonth);
  const investM = totalInvestments(thisMonth);
  const sRate = savingsRate(savingsM, incomeM);

  const monthDelta = nw - (snapshots[snapshots.length - 30]?.amount ?? nw);

  const primaryGoal = goals.find((g) => !g.is_completed) ?? goals[0];
  const goalPct = primaryGoal ? Math.min(100, (Number(primaryGoal.current_amount) / Number(primaryGoal.target_amount)) * 100) : 0;

  const todayKey = todayISO();
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
  const streakDays = last7.map((d) => habits.some((h) => h.completed_dates.includes(d)));
  const totalStreak = Math.max(0, ...habits.map((h) => h.streak));

  const blur = (s: string) => (privacyMode ? "••••••" : s);

  const sRateLabel =
    sRate >= 30 ? "Elite saver — keep going" :
    sRate >= 20 ? "Strong discipline" :
    sRate >= 10 ? "Building momentum" : "Time to tighten up";

  return (
    <main className="px-5 pt-8">
      {/* Hero */}
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-text-second">Net worth</p>
            <h1 className="mt-1 text-5xl font-black tracking-tight tabular text-text-primary">
              {privacyMode ? "••••••" : (
                <AnimatedNumber value={nw} format={(n) => formatCurrency(n, currency, { decimals: 0 })} />
              )}
            </h1>
            <p className="text-display mt-1 text-base text-gold">Your financial empire</p>
          </div>
          <button className="rounded-full p-2 text-text-second hover:bg-surface-mid">
            <MoreHorizontal size={20} />
          </button>
        </div>
        {monthDelta !== 0 && (
          <div className="mt-3">
            <Badge tone={monthDelta >= 0 ? "positive" : "negative"}>
              {monthDelta >= 0 ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
              {formatCurrency(Math.abs(monthDelta), currency, { compact: true })} this month
            </Badge>
          </div>
        )}
      </motion.section>

      {/* Goal ring + chart */}
      {primaryGoal && (
        <section className="mb-6 rounded-2xl border border-border bg-surface p-5 shadow-card">
          <div className="flex items-center gap-5">
            <ProgressRing
              value={goalPct} size={108} thickness={9}
              label={
                <div className="text-center">
                  <div className="text-2xl font-black tabular text-text-primary">{Math.round(goalPct)}%</div>
                  <div className="text-[9px] uppercase tracking-widest text-text-second">to goal</div>
                </div>
              }
            />
            <div className="min-w-0 flex-1">
              <div className="text-xs uppercase tracking-widest text-text-second">Primary goal</div>
              <div className="mt-1 truncate text-lg font-bold text-text-primary">
                {primaryGoal.emoji} {primaryGoal.title}
              </div>
              <div className="mt-1 text-sm tabular text-text-second">
                {blur(formatCurrency(Number(primaryGoal.current_amount), currency))} <span className="text-text-dim">/</span> {blur(formatCurrency(Number(primaryGoal.target_amount), currency))}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="mb-6 rounded-2xl border border-border bg-surface p-5 shadow-card">
        <NetWorthChart snapshots={snapshots} currency={currency} />
      </section>

      {/* Stats grid */}
      <section className="mb-6">
        <StatGrid
          currency={currency}
          items={[
            { label: "Saved", amount: savingsM, icon: Wallet, tone: "gold", delta: momChange(savingsM, totalSavings(lastMonth)) },
            { label: "Invested", amount: investM, icon: TrendingUp, tone: "info", delta: momChange(investM, totalInvestments(lastMonth)) },
            { label: "Income", amount: incomeM, icon: ArrowUpRight, tone: "positive", delta: momChange(incomeM, totalIncome(lastMonth)) },
            { label: "Expenses", amount: expensesM, icon: ArrowDownRight, tone: "negative", delta: momChange(expensesM, totalExpenses(lastMonth)) },
          ]}
        />
      </section>

      {/* Savings rate */}
      <section className="mb-6 rounded-2xl border border-border bg-surface p-5 shadow-card">
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-[11px] uppercase tracking-[0.18em] text-text-second">Savings rate</span>
          <span className="text-2xl font-black tabular text-gradient-gold">{sRate.toFixed(0)}%</span>
        </div>
        <ProgressBar value={sRate} />
        <p className="mt-2 text-xs text-text-second">{sRateLabel}</p>
      </section>

      {/* Insight banner */}
      <motion.button
        type="button"
        onClick={() => navigate({ to: sRate >= 20 ? "/app/goals" : "/app/analytics" })}
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        whileTap={{ scale: 0.98 }}
        className="mb-6 flex w-full items-start gap-3 rounded-2xl border border-[var(--gold-dim)] bg-[var(--gold-glow)] p-4 text-left transition-colors hover:bg-[var(--gold-glow)]/80 focus:outline-none focus:ring-2 focus:ring-gold/40"
      >
        <Sparkles size={18} className="mt-0.5 shrink-0 text-gold" />
        <div className="text-sm leading-relaxed text-text-primary">
          {sRate >= 20
            ? <>You're saving <b>{sRate.toFixed(0)}%</b> of income — top decile territory. At this pace, your goal hits early. <span className="text-gold underline-offset-2 hover:underline">See goals →</span></>
            : <>Lifting your savings rate by just 5% would cut years off your timeline. <span className="text-gold underline-offset-2 hover:underline">See how →</span></>}
        </div>
      </motion.button>


      {/* Recent transactions */}
      <section className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-base font-bold text-text-primary">Recent</h2>
          <span className="text-[11px] uppercase tracking-widest text-text-second">Last 5</span>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-2 shadow-card">
          {transactions.slice(0, 5).map((tx) => (
            <TransactionItem key={tx.id} tx={tx} currency={currency} />
          ))}
        </div>
      </section>

      <GoldDivider className="my-8" />

      {/* Streak */}
      <section className="mb-10 flex items-center justify-between rounded-2xl border border-border bg-surface p-5 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <Flame size={18} className="text-gold" />
            <span className="text-lg font-black tabular text-text-primary">{totalStreak}-day streak</span>
          </div>
          <p className="mt-1 text-xs text-text-second">Keep the chain alive.</p>
        </div>
        <div className="flex gap-1">
          {streakDays.map((on, i) => (
            <span key={i} className="h-2.5 w-2.5 rounded-full" style={{ background: on ? "var(--gold)" : "var(--surface-mid)" }} />
          ))}
        </div>
      </section>
      {/* todayKey reserved for future haptic-tied interaction */}
      <span className="hidden">{todayKey}</span>
    </main>
  );
}
