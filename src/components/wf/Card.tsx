import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface Props extends HTMLMotionProps<"div"> {
  glow?: boolean;
  elevated?: boolean;
}

export function Card({ glow, elevated, className, children, ...rest }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "rounded-2xl border bg-surface p-5 shadow-card",
        elevated && "bg-surface-high",
        glow && "border-[var(--gold-dim)] shadow-glow",
        !glow && "border-border",
        className
      )}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
