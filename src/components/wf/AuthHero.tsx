import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Crown, Sparkles } from "lucide-react";

export function HeroPanel() {
  return (
    <aside className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#0a0a14] via-[#11110a] to-[#1a1306]" />
      <div
        className="absolute -left-32 -top-32 h-96 w-96 rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, #C9A84C 0%, transparent 70%)" }}
      />
      <div
        className="absolute -bottom-40 -right-20 h-[28rem] w-[28rem] rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, #F0D78C 0%, transparent 70%)" }}
      />

      <Link to="/" className="relative flex items-center gap-2">
        <Crown className="h-6 w-6 text-gold" />
        <span className="text-sm font-bold tracking-[0.24em] text-gold">WEALTHFLOW</span>
      </Link>

      <div className="relative">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="font-display text-5xl italic leading-tight text-text-primary"
        >
          Build your <span className="text-gradient-gold">legacy</span>.
          <br /> Track your <span className="text-gradient-gold">empire</span>.
        </motion.h2>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-text-second">
          The premium dashboard for sovereigns of capital. Net worth, goals,
          milestones, and habits — all wrapped in gold.
        </p>

        <div className="mt-10 grid grid-cols-3 gap-3">
          {[
            { icon: "👑", label: "Net Worth" },
            { icon: "🎯", label: "Goals" },
            { icon: "📈", label: "Analytics" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-[var(--gold-dim)] p-4 text-center backdrop-blur-md"
              style={{ background: "color-mix(in oklab, var(--surface) 60%, transparent)" }}
            >
              <div className="text-2xl">{s.icon}</div>
              <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-text-second">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative flex items-center gap-2 text-xs text-text-second">
        <Sparkles className="h-3.5 w-3.5 text-gold" />
        Trusted by builders growing toward their first million.
      </div>
    </aside>
  );
}

export function BackgroundOrbs() {
  return (
    <>
      <div
        className="pointer-events-none absolute -top-32 right-0 -z-10 h-72 w-72 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, #C9A84C 0%, transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-1/4 -z-10 h-72 w-72 rounded-full opacity-10 blur-3xl"
        style={{ background: "radial-gradient(circle, #F0D78C 0%, transparent 70%)" }}
      />
    </>
  );
}

export function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.4 14.6 2.4 12 2.4 6.7 2.4 2.4 6.7 2.4 12s4.3 9.6 9.6 9.6c5.5 0 9.2-3.9 9.2-9.4 0-.6-.1-1.1-.2-1.6H12z" />
    </svg>
  );
}
