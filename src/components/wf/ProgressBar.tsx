import { motion } from "framer-motion";

interface Props {
  value: number; // 0-100
  height?: number;
  color?: string;
  glow?: boolean;
}

export function ProgressBar({ value, height = 12, color = "var(--gold)", glow = true }: Props) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div
      className="relative w-full overflow-hidden rounded-full bg-surface-mid"
      style={{ height }}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${v}%` }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="h-full rounded-full"
        style={{
          background: `linear-gradient(90deg, ${color}, ${color}cc)`,
          boxShadow: glow ? `0 0 12px ${color}66` : undefined,
        }}
      />
    </div>
  );
}
