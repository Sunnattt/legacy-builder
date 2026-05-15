import { motion } from "framer-motion";
import { progressColor } from "@/lib/milestones";

interface Props {
  value: number; // 0-100
  size?: number;
  thickness?: number;
  label?: React.ReactNode;
  trackColor?: string;
}

export function ProgressRing({
  value,
  size = 140,
  thickness = 10,
  label,
  trackColor = "var(--surface-mid)",
}: Props) {
  const v = Math.max(0, Math.min(100, value));
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (v / 100) * c;
  const stroke = progressColor(v);
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={r}
          strokeWidth={thickness} stroke={trackColor} fill="none"
        />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          strokeWidth={thickness} stroke={stroke} fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ filter: `drop-shadow(0 0 6px ${stroke}66)` }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {label}
      </div>
    </div>
  );
}
