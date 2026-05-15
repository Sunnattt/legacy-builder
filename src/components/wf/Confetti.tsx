import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const COLORS = ["#C9A84C", "#E6C97A", "#28C78A", "#4A8FE8", "#7C5CBF", "#E04545"];

export function Confetti({ trigger, onDone }: { trigger: number; onDone?: () => void }) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!trigger) return;
    setActive(true);
    const t = setTimeout(() => {
      setActive(false);
      onDone?.();
    }, 1800);
    return () => clearTimeout(t);
  }, [trigger, onDone]);

  if (!active) return null;
  const pieces = Array.from({ length: 36 });

  return (
    <AnimatePresence>
      <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
        {pieces.map((_, i) => {
          const angle = (Math.PI * 2 * i) / pieces.length + Math.random() * 0.6;
          const dist = 180 + Math.random() * 220;
          const dx = Math.cos(angle) * dist;
          const dy = Math.sin(angle) * dist + 200; // gravity bias down
          const color = COLORS[i % COLORS.length];
          return (
            <motion.span
              key={i}
              initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
              animate={{ x: dx, y: dy, opacity: 0, rotate: 540, scale: 0.6 }}
              transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
              className="absolute left-1/2 top-1/3 h-2 w-2 rounded-sm"
              style={{ background: color, boxShadow: `0 0 6px ${color}` }}
            />
          );
        })}
      </div>
    </AnimatePresence>
  );
}
