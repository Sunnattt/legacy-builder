import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, Target, Sparkles, Shield } from "lucide-react";
import { Button } from "@/components/wf/Button";
import { GoldDivider } from "@/components/wf/GoldDivider";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WealthFlow — Build your empire. Track your legacy." },
      { name: "description", content: "A luxury personal finance OS for serious wealth builders. Real-time net worth, goals, AI insights, and projections toward $1M+." },
      { property: "og:title", content: "WealthFlow — Personal Finance OS" },
      { property: "og:description", content: "Real-time net worth, goals, AI insights, and projections toward $1M+." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <main className="mx-auto min-h-screen max-w-md px-6 pb-20 pt-16">
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--gold-dim)] bg-[var(--gold-glow)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
          <Sparkles size={12} /> Private beta
        </div>
        <h1 className="text-5xl font-black leading-[1.05] tracking-tight">
          Build your <span className="text-gradient-gold">empire.</span>
        </h1>
        <p className="text-display mt-3 text-2xl text-gold">Track your legacy.</p>
        <p className="mx-auto mt-5 max-w-sm text-sm leading-relaxed text-text-second">
          A luxury personal finance OS for serious wealth builders. Net worth,
          goals, AI insights, and projections toward your first million.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Link to="/signup">
            <Button variant="gold" size="lg" full>
              Start free <ArrowRight size={18} />
            </Button>
          </Link>
          <Link to="/login" className="text-sm text-text-second hover:text-text-primary">
            Already have an account? <span className="text-gold">Sign in</span>
          </Link>
        </div>
      </motion.header>

      <GoldDivider className="my-12" />

      <section className="space-y-4">
        {[
          { icon: TrendingUp, title: "Real-time net worth", body: "Animated charts of every dollar you save, spend, and invest." },
          { icon: Target, title: "Goals with milestones", body: "Confetti at 1, 5, 10, 25, 50, 75, 100% — feel the wins." },
          { icon: Sparkles, title: "AI insights", body: "Discipline score, spending anomalies, projection slider." },
          { icon: Shield, title: "Private by design", body: "Privacy mode blurs amounts. Your data, your control." },
        ].map((f, i) => {
          const Icon = f.icon;
          return (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.4 }}
              className="flex gap-4 rounded-2xl border border-border bg-surface p-4 shadow-card"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--gold-glow)] text-gold">
                <Icon size={20} />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-text-primary">{f.title}</h3>
                <p className="mt-0.5 text-xs leading-relaxed text-text-second">{f.body}</p>
              </div>
            </motion.div>
          );
        })}
      </section>

      <p className="mt-12 text-center text-[11px] uppercase tracking-[0.2em] text-text-dim">
        WealthFlow · 2026
      </p>
    </main>
  );
}
