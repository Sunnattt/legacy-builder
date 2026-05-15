import { useMemo, useState } from "react";
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import type { NetWorthSnapshot } from "@/types/wealthflow";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

type Range = "1M" | "3M" | "1Y" | "ALL";
const RANGES: Range[] = ["1M", "3M", "1Y", "ALL"];
const DAYS: Record<Range, number> = { "1M": 30, "3M": 90, "1Y": 365, ALL: Infinity };

interface Props {
  snapshots: NetWorthSnapshot[];
  currency?: string;
}

export function NetWorthChart({ snapshots, currency = "USD" }: Props) {
  const [range, setRange] = useState<Range>("3M");

  const data = useMemo(() => {
    const cutoff = Date.now() - DAYS[range] * 24 * 60 * 60 * 1000;
    const sorted = [...snapshots].sort((a, b) => a.date.localeCompare(b.date));
    return sorted
      .filter((s) => new Date(s.date).getTime() >= cutoff)
      .map((s) => ({
        date: s.date,
        amount: Number(s.amount),
        label: new Date(s.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      }));
  }, [snapshots, range]);

  const min = data.length ? Math.min(...data.map((d) => d.amount)) : 0;
  const max = data.length ? Math.max(...data.map((d) => d.amount)) : 0;
  const padding = (max - min) * 0.15 || 1000;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-[0.18em] text-text-second">Net worth trend</span>
        <div className="relative flex items-center rounded-full bg-surface-mid p-1">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "relative z-10 px-3 py-1 text-[11px] font-semibold tracking-wide transition-colors",
                range === r ? "text-[#07070E]" : "text-text-second hover:text-text-primary"
              )}
            >
              {range === r && (
                <motion.span
                  layoutId="range-pill"
                  className="absolute inset-0 -z-10 rounded-full bg-gradient-gold"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              {r}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={range}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="h-44 w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
              <defs>
                <linearGradient id="goldFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C9A84C" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#C9A84C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1E1E38" strokeDasharray="3 6" vertical={false} />
              <XAxis dataKey="label" hide />
              <YAxis hide domain={[min - padding, max + padding]} />
              <Tooltip
                contentStyle={{
                  background: "#161628",
                  border: "1px solid #2A2A48",
                  borderRadius: 10,
                  fontSize: 12,
                  color: "#EEE9DC",
                }}
                labelStyle={{ color: "#8A8A9A", fontSize: 10 }}
                formatter={(v: number) => [formatCurrency(v, currency), "Net worth"]}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#C9A84C"
                strokeWidth={2.5}
                fill="url(#goldFill)"
                dot={false}
                activeDot={{ r: 5, fill: "#E6C97A", stroke: "#07070E", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
