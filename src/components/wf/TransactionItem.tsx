import type { Transaction } from "@/types/wealthflow";
import { formatCurrency } from "@/lib/currency";
import { findCategory } from "@/lib/categories";
import { formatRelativeDate } from "@/lib/dates";
import { cn } from "@/lib/utils";

interface Props {
  tx: Transaction;
  currency?: string;
  onClick?: () => void;
}

export function TransactionItem({ tx, currency = "USD", onClick }: Props) {
  const cat = findCategory(tx.type, tx.category);
  const isOut = tx.type === "expense";
  const sign = isOut ? "-" : tx.type === "income" ? "+" : "";
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-surface-mid"
    >
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base"
        style={{ background: `${cat.color}1A`, color: cat.color }}
      >
        {cat.icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-text-primary">{tx.category}</div>
        <div className="truncate text-[11px] text-text-second">
          {tx.note ? tx.note : tx.type} · {formatRelativeDate(tx.date)}
        </div>
      </div>
      <div className={cn(
        "tabular text-sm font-bold",
        isOut ? "text-[var(--negative)]" : tx.type === "income" ? "text-[var(--positive)]" : "text-text-primary"
      )}>
        {sign}{formatCurrency(Number(tx.amount), currency)}
      </div>
    </button>
  );
}
