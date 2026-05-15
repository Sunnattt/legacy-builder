import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useTransactionStore } from "@/store/useTransactionStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import {
  totalIncome, totalExpenses, totalSavings, totalInvestments,
  netWorth, expensesByCategory, momChange, filterByMonth, savingsRate,
} from "@/lib/calculations";
import { buildMockSnapshots } from "@/lib/mockData";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/types/wealthflow";

export const Route = createFileRoute("/app/analytics")({
  head: () => ({ meta: [{ title: "Analytics — WealthFlow" }] }),
  component: AnalyticsPage,
});

type Range = "7D" | "30D" | "3M" | "1Y" | "ALL";
const RANGES: Range[] = ["7D", "30D", "3M", "1Y", "ALL"];
const RANGE_DAYS: Record<Range, number> = { "7D": 7, "30D": 30, "3M": 90, "1Y": 365, ALL: Infinity };

function AnalyticsPage() {
  const { transactions } = useTransactionStore();
  const { currency } = useSettingsStore();
  const [range, setRange] = useState<Range>("30D");

  const snapshots = useMemo(() => buildMockSnapshots(), []);
  const cutoff = Date.now() - RANGE_DAYS[range] * 86400000;

  const inRange = useMemo(
    () => transactions.filter((t) => new Date(t.date).getTime() >= cutoff),
    [transactions, cutoff]
  );

  const series = useMemo(() => {
    const sorted = [...snapshots].sort((a, b) => a.date.localeCompare(b.date));
    return sorted
      .filter((s) => new Date(s.date).getTime() >= cutoff)
      .map((s) => ({
        date: s.date,
        amount: Number(s.amount),
        label: new Date(s.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      }));
  }, [snapshots, cutoff]);

  const nw = netWorth(transactions);
  const totSav = totalSavings(transactions);
  const totInv = totalInvestments(transactions);
  const totExp = totalExpenses(transactions);
  const breakdownTotal = Math.max(1, totSav + totInv + totExp);
  const pieData = [
    { name: "Savings", value: totSav, color: "#C9A84C" },
    { name: "Investments", value: totInv, color: "#4A8FE8" },
    { name: "Expenses", value: totExp, color: "#E04545" },
  ];

  // Last 6 months savings vs expenses
  const monthlyBars = useMemo(() => {
    const now = new Date();
    const arr: { month: string; Savings: number; Expenses: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const m = filterByMonth(transactions, d.getFullYear(), d.getMonth());
      arr.push({
        month: d.toLocaleDateString("en-US", { month: "short" }),
        Savings: totalSavings(m),
        Expenses: totalExpenses(m),
      });
    }
    return arr;
  }, [transactions]);

  const expBreakdown = useMemo(() => expensesByCategory(inRange).slice(0, 6), [inRange]);
  const expMax = Math.max(1, ...expBreakdown.map((e) => e.amount));

  const trends = useMemo(() => buildTrends(transactions), [transactions]);

  return (
    <main className="px-5 pt-8">
      <header className="mb-5">
        <h1 className="text-3xl font-black tracking-tight">Analytics</h1>
        <p className="text-sm text-text-second">Where your money flows, in detail.</p>
      </header>

      {/* Range selector */}
      <div className="mb-6 flex w-fit items-center rounded-full border border-border bg-surface p-1">
        {RANGES.map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={cn(
              "relative z-10 px-3.5 py-1.5 text-[11px] font-semibold tracking-wide transition-colors",
              range === r ? "text-[#07070E]" : "text-text-second hover:text-text-primary"
            )}
          >
            {range === r && (
              <motion.span
                layoutId="analytics-pill"
                className="absolute inset-0 -z-10 rounded-full bg-gradient-gold"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            {r}
          </button>
        ))}
      </div>

      {/* Net Worth chart */}
      <Section title="Net worth" subtitle={formatCurrency(nw, currency, { decimals: 0 })}>
        <AnimatePresence mode="wait">
          <motion.div
            key={range}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="h-48 w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                <defs>
                  <linearGradient id="goldFill2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C9A84C" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#C9A84C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1E1E38" strokeDasharray="3 6" vertical={false} />
                <XAxis dataKey="label" stroke="#3A3A55" fontSize={10} tickLine={false} axisLine={false} minTickGap={28} />
                <YAxis stroke="#3A3A55" fontSize={10} tickLine={false} axisLine={false}
                  tickFormatter={(v) => formatCurrency(v, currency, { compact: true, decimals: 0 })}
                  width={48}
                />
                <Tooltip
                  contentStyle={{ background: "#161628", border: "1px solid #2A2A48", borderRadius: 10, fontSize: 12 }}
                  labelStyle={{ color: "#8A8A9A", fontSize: 10 }}
                  formatter={(v: number) => [formatCurrency(v, currency), "Net worth"]}
                />
                <Area type="monotone" dataKey="amount" stroke="#C9A84C" strokeWidth={2.5} fill="url(#goldFill2)"
                  dot={false} activeDot={{ r: 5, fill: "#E6C97A", stroke: "#07070E", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </AnimatePresence>
      </Section>

      {/* Wealth breakdown donut */}
      <Section title="Wealth breakdown">
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <div className="relative h-48 w-48">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData} dataKey="value" innerRadius={56} outerRadius={86}
                  paddingAngle={2} stroke="#07070E" strokeWidth={2}
                >
                  {pieData.map((p) => <Cell key={p.name} fill={p.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-[10px] uppercase tracking-widest text-text-second">Net worth</div>
              <div className="tabular text-lg font-black text-gradient-gold">
                {formatCurrency(nw, currency, { compact: true, decimals: 0 })}
              </div>
            </div>
          </div>
          <ul className="flex-1 space-y-2">
            {pieData.map((p) => {
              const pct = (p.value / breakdownTotal) * 100;
              return (
                <li key={p.name} className="flex items-center gap-2 text-sm">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: p.color }} />
                  <span className="flex-1 font-semibold text-text-primary">{p.name}</span>
                  <span className="tabular text-text-second">{formatCurrency(p.value, currency, { compact: true })}</span>
                  <span className="tabular w-10 text-right text-[11px] text-text-dim">{pct.toFixed(0)}%</span>
                </li>
              );
            })}
          </ul>
        </div>
      </Section>

      {/* Monthly bars */}
      <Section title="Savings vs expenses" subtitle="Last 6 months">
        <div className="h-52 w-full">
          <ResponsiveContainer>
            <BarChart data={monthlyBars} margin={{ top: 6, right: 4, bottom: 4, left: 4 }}>
              <CartesianGrid stroke="#1E1E38" strokeDasharray="3 6" vertical={false} />
              <XAxis dataKey="month" stroke="#3A3A55" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#3A3A55" fontSize={10} tickLine={false} axisLine={false}
                tickFormatter={(v) => formatCurrency(v, currency, { compact: true, decimals: 0 })} width={42}
              />
              <Tooltip
                cursor={{ fill: "#1C1C3266" }}
                contentStyle={{ background: "#161628", border: "1px solid #2A2A48", borderRadius: 10, fontSize: 12 }}
                formatter={(v: number, n) => [formatCurrency(v, currency), n as string]}
              />
              <Legend wrapperStyle={{ fontSize: 11, color: "#8A8A9A" }} iconType="circle" />
              <Bar dataKey="Savings" fill="#C9A84C" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Expenses" fill="#E04545" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Section>

      {/* Expense breakdown bars */}
      <Section title="Top expense categories">
        {expBreakdown.length === 0 ? (
          <p className="py-4 text-center text-sm text-text-second">No expenses in this range.</p>
        ) : (
          <ul className="space-y-3">
            {expBreakdown.map((row, i) => {
              const pct = (row.amount / expMax) * 100;
              const total = expBreakdown.reduce((s, r) => s + r.amount, 0);
              const share = (row.amount / total) * 100;
              return (
                <li key={row.category}>
                  <div className="mb-1 flex items-baseline justify-between text-xs">
                    <span className="font-semibold text-text-primary">{row.category}</span>
                    <span className="tabular text-text-second">
                      {formatCurrency(row.amount, currency, { decimals: 0 })} <span className="text-text-dim">({share.toFixed(0)}%)</span>
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-mid">
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: i * 0.05, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ background: i === 0 ? "var(--gradient-gold)" : "#E04545" }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      {/* Trend cards */}
      <Section title="Trends">
        <div className="grid grid-cols-1 gap-3">
          {trends.map((t, i) => {
            const Icon = t.direction === "up" ? TrendingUp : t.direction === "down" ? TrendingDown : Minus;
            const color =
              t.direction === "up" ? "var(--positive)" :
              t.direction === "down" ? "var(--negative)" : "var(--text-second)";
            return (
              <motion.div
                key={t.message}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-start gap-3 rounded-xl border border-border bg-surface p-3"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface-mid" style={{ color }}>
                  <Icon size={15} />
                </span>
                <div className="text-sm leading-snug text-text-primary">
                  <span className="text-base mr-1">{t.icon}</span>{t.message}
                </div>
              </motion.div>
            );
          })}
        </div>
      </Section>
    </main>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="mb-6 rounded-2xl border border-border bg-surface p-5 shadow-card">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-text-second">{title}</h2>
        {subtitle && <span className="tabular text-sm font-black text-gradient-gold">{subtitle}</span>}
      </div>
      {children}
    </section>
  );
}

function buildTrends(transactions: Transaction[]) {
  const now = new Date();
  const tm = filterByMonth(transactions, now.getFullYear(), now.getMonth());
  const lastDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lm = filterByMonth(transactions, lastDate.getFullYear(), lastDate.getMonth());

  const sav = totalSavings(tm), savP = totalSavings(lm);
  const exp = totalExpenses(tm), expP = totalExpenses(lm);
  const inc = totalIncome(tm), incP = totalIncome(lm);
  const inv = totalInvestments(tm), invP = totalInvestments(lm);
  const sRate = savingsRate(sav, inc);

  const dir = (curr: number, prev: number): "up" | "down" | "neutral" => {
    if (curr > prev * 1.02) return "up";
    if (curr < prev * 0.98) return "down";
    return "neutral";
  };

  const items: { icon: string; message: string; direction: "up" | "down" | "neutral" }[] = [];

  items.push({
    icon: "💰",
    direction: dir(sav, savP),
    message: savP === 0
      ? `You saved ${formatCurrency(sav, "USD", { decimals: 0 })} this month — first savings on record.`
      : `Savings ${sav >= savP ? "up" : "down"} ${Math.abs(momChange(sav, savP)).toFixed(0)}% vs last month.`,
  });
  items.push({
    icon: "🛒",
    direction: dir(expP, exp), // less spending = positive
    message: expP === 0
      ? `Expenses this month: ${formatCurrency(exp, "USD", { decimals: 0 })}.`
      : `Spending ${exp <= expP ? "down" : "up"} ${Math.abs(momChange(exp, expP)).toFixed(0)}% — ${exp <= expP ? "great control" : "watch the budget"}.`,
  });
  items.push({
    icon: "📈",
    direction: dir(inv, invP),
    message: inv > 0
      ? `You moved ${formatCurrency(inv, "USD", { decimals: 0 })} into investments this month.`
      : "No new investments this month — consider topping up your portfolio.",
  });
  items.push({
    icon: "💼",
    direction: dir(inc, incP),
    message: incP === 0
      ? `Income this month: ${formatCurrency(inc, "USD", { decimals: 0 })}.`
      : `Income ${inc >= incP ? "up" : "down"} ${Math.abs(momChange(inc, incP)).toFixed(0)}% vs last month.`,
  });
  items.push({
    icon: sRate >= 20 ? "🔥" : "⚠️",
    direction: sRate >= 20 ? "up" : sRate >= 10 ? "neutral" : "down",
    message: sRate >= 20
      ? `Savings rate at ${sRate.toFixed(0)}% — top-decile discipline.`
      : sRate >= 10
        ? `Savings rate ${sRate.toFixed(0)}%. Push past 20% to accelerate.`
        : `Savings rate only ${sRate.toFixed(0)}%. Trim one expense category to fix.`,
  });

  return items;
}
