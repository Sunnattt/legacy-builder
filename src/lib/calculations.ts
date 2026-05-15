// WealthFlow financial calculation engine. All monetary amounts in dollars (or user's currency).

import type { Transaction } from "@/types/wealthflow";

export const sumByType = (txs: Transaction[], type: Transaction["type"]) =>
  txs.filter((t) => t.type === type).reduce((s, t) => s + Number(t.amount), 0);

export const totalIncome = (txs: Transaction[]) => sumByType(txs, "income");
export const totalExpenses = (txs: Transaction[]) => sumByType(txs, "expense");
export const totalSavings = (txs: Transaction[]) => sumByType(txs, "saving");
export const totalInvestments = (txs: Transaction[]) => sumByType(txs, "investment");

/** Net worth = savings + investments + (income - expenses, lifetime). */
export const netWorth = (txs: Transaction[]) =>
  totalSavings(txs) + totalInvestments(txs) + totalIncome(txs) - totalExpenses(txs);

export const inMonth = (tx: Transaction, year: number, month: number) => {
  const d = new Date(tx.date);
  return d.getUTCFullYear() === year && d.getUTCMonth() === month;
};

export const filterByMonth = (txs: Transaction[], year: number, month: number) =>
  txs.filter((t) => inMonth(t, year, month));

/** Savings rate = monthlySavings / monthlyIncome. */
export const savingsRate = (monthlySavings: number, monthlyIncome: number) => {
  if (monthlyIncome <= 0) return 0;
  return Math.max(0, (monthlySavings / monthlyIncome) * 100);
};

/** Required monthly contribution to reach a goal. */
export const monthlyNeeded = (target: number, current: number, deadline: string | null) => {
  if (!deadline) return 0;
  const months = Math.max(
    1,
    Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30))
  );
  return Math.max(0, (target - current) / months);
};

/** Compound future value. */
export const futureValue = (present: number, annualRate: number, years: number) =>
  present * Math.pow(1 + annualRate, years);

/** Investment growth with monthly contributions. */
export const projectedValue = (
  principal: number,
  monthlyContribution: number,
  annualRate: number,
  years: number
) => {
  const r = annualRate / 12;
  const n = years * 12;
  const fvPrincipal = principal * Math.pow(1 + r, n);
  const fvContrib = monthlyContribution * ((Math.pow(1 + r, n) - 1) / (r || 1e-9));
  return fvPrincipal + fvContrib;
};

/** Emergency fund target = 6× monthly expenses. */
export const emergencyTarget = (monthlyExpenses: number) => monthlyExpenses * 6;

/** Financial Independence number (4% rule). */
export const fiNumber = (annualExpenses: number) => annualExpenses * 25;

/** Days until goal at current daily savings rate. */
export const daysToGoal = (target: number, current: number, dailySaving: number) => {
  if (dailySaving <= 0) return Infinity;
  return Math.max(0, Math.ceil((target - current) / dailySaving));
};

/** Month-over-month change %. */
export const momChange = (curr: number, prev: number) => {
  if (prev === 0) return curr > 0 ? 100 : 0;
  return ((curr - prev) / Math.abs(prev)) * 100;
};

/** Wealth velocity score 0–100. */
export const velocityScore = (
  netWorthGrowth: number,
  savingsRate: number,
  habitsCompletion: number,
  goalProgress: number
) => {
  const clamp = (x: number) => Math.max(0, Math.min(100, x));
  return Math.round(
    clamp(netWorthGrowth) * 0.4 +
      clamp(savingsRate) * 0.3 +
      clamp(habitsCompletion) * 0.2 +
      clamp(goalProgress) * 0.1
  );
};

/** Group expenses by category, returns sorted desc. */
export const expensesByCategory = (txs: Transaction[]) => {
  const map = new Map<string, number>();
  for (const t of txs) {
    if (t.type !== "expense") continue;
    map.set(t.category, (map.get(t.category) ?? 0) + Number(t.amount));
  }
  return [...map.entries()]
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
};
