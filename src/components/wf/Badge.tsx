import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
  tone?: "gold" | "positive" | "negative" | "info" | "muted" | "purple";
  className?: string;
}

const tones: Record<NonNullable<Props["tone"]>, string> = {
  gold: "bg-[var(--gold-glow)] text-gold border-[var(--gold-dim)]",
  positive: "bg-[#28C78A1A] text-[var(--positive)] border-[#28C78A33]",
  negative: "bg-[#E045451A] text-[var(--negative)] border-[#E0454533]",
  info: "bg-[#4A8FE81A] text-[var(--info)] border-[#4A8FE833]",
  purple: "bg-[#7C5CBF1A] text-[var(--purple)] border-[#7C5CBF33]",
  muted: "bg-surface-mid text-text-second border-border",
};

export function Badge({ children, tone = "muted", className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide tabular",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
