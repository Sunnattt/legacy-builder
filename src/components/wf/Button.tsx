import { motion } from "framer-motion";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptics";

type Variant = "gold" | "outline" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  full?: boolean;
}

const variants: Record<Variant, string> = {
  gold: "bg-gradient-gold text-[#07070E] font-bold shadow-card hover:shadow-glow",
  outline: "bg-transparent text-gold border border-[var(--gold-dim)] hover:border-gold hover:bg-[var(--gold-glow)]",
  ghost: "bg-transparent text-text-primary hover:bg-surface-mid",
  destructive: "bg-[var(--negative)] text-white",
};
const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm rounded-md",
  md: "h-12 px-6 text-base rounded-lg",
  lg: "h-14 px-8 text-base rounded-xl",
};

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ variant = "gold", size = "md", full, className, onClick, children, ...rest }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.96 }}
        whileHover={{ y: -1 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        onClick={(e) => {
          haptic("tap");
          onClick?.(e);
        }}
        className={cn(
          "inline-flex items-center justify-center gap-2 select-none transition-colors",
          "disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          full && "w-full",
          className
        )}
        {...(rest as object)}
      >
        {children}
      </motion.button>
    );
  }
);
Button.displayName = "Button";
