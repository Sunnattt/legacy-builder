import { Link, useLocation } from "@tanstack/react-router";
import { Home, Target, Plus, BarChart3, User } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptics";

type TabItem = {
  to: "/app" | "/app/goals" | "/app/add" | "/app/analytics" | "/app/profile";
  label: string;
  icon: typeof Home;
  exact?: boolean;
  primary?: boolean;
};
const items: TabItem[] = [
  { to: "/app", label: "Home", icon: Home, exact: true },
  { to: "/app/goals", label: "Goals", icon: Target },
  { to: "/app/add", label: "Add", icon: Plus, primary: true },
  { to: "/app/analytics", label: "Stats", icon: BarChart3 },
  { to: "/app/profile", label: "Profile", icon: User },
];

export function TabBar() {
  const loc = useLocation();
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-border bg-bg/85 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="flex h-16 items-stretch justify-between px-3">
        {items.map((it) => {
          const active = it.exact
            ? loc.pathname === it.to
            : loc.pathname === it.to || loc.pathname.startsWith(it.to + "/");
          const Icon = it.icon;
          if (it.primary) {
            return (
              <li key={it.to} className="relative -mt-6 flex flex-1 justify-center">
                <Link to={it.to} onClick={() => haptic("tap")} aria-label={it.label}>
                  <motion.div
                    whileTap={{ scale: 0.92 }}
                    whileHover={{ y: -2 }}
                    className="grid h-14 w-14 place-items-center rounded-full bg-gradient-gold text-[#07070E] shadow-glow"
                  >
                    <Icon size={26} strokeWidth={2.5} />
                  </motion.div>
                </Link>
              </li>
            );
          }
          return (
            <li key={it.to} className="flex flex-1">
              <Link
                to={it.to}
                onClick={() => haptic("tap")}
                aria-label={it.label}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-1 text-[11px] tracking-wide transition-colors",
                  active ? "text-gold" : "text-text-second hover:text-text-primary"
                )}
              >
                <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
                <span>{it.label}</span>
                {active && (
                  <motion.span
                    layoutId="tab-dot"
                    className="absolute -bottom-px h-[3px] w-8 rounded-full bg-gold"
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
