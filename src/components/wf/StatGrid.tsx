import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

export interface StatItem {
  label: string;
  amount: number;
  delta?: number; // percentage vs prior period
  icon: LucideIcon | string;
  tone: "gold" | "info" | "positive" | "negative";
}

const toneClass: Record<StatItem["tone"], string> = {
  gold: "text-gold",
  info: "text-[var(--info)]",
  positive: "text-[var(--positive)]",
  negative: "text-[var(--negative)]",
};

export function StatGrid({ items, currency = "USD" }: { items: StatItem[]; currency?: string }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((it, i) => {
        const IconComp = typeof it.icon === "string" ? null : it.icon;
        const isUp = (it.delta ?? 0) >= 0;
        const Trend = isUp ? TrendingUp : TrendingDown;
        return (
          <motion.div
            key={it.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i, duration: 0.4, ease: "easeOut" }}
            className="rounded-2xl border border-border bg-surface p-4 shadow-card"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-[0.16em] text-text-second">
                {it.label}
              </span>
              <span className={cn("flex h-7 w-7 items-center justify-center rounded-full bg-surface-mid", toneClass[it.tone])}>
                {IconComp ? <IconComp size={14} /> : <span className="text-sm">{it.icon as string}</span>}
              </span>
            </div>
            <div className="mt-2 text-xl font-bold tracking-tight tabular text-text-primary">
              {formatCurrency(it.amount, currency, { compact: it.amount >= 10000 })}
            </div>
            {typeof it.delta === "number" && (
              <div
                className={cn(
                  "mt-1 inline-flex items-center gap-1 text-[11px] font-medium",
                  isUp ? "text-[var(--positive)]" : "text-[var(--negative)]"
                )}
              >
                {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                <Trend size={10} />
                {Math.abs(it.delta).toFixed(1)}% vs last
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
