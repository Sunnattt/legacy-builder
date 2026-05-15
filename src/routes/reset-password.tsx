import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Crown, Lock } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/wf/Button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Set a new password — WealthFlow" }] }),
  component: ResetPasswordPage,
});

const schema = z.object({ password: z.string().min(8, "At least 8 characters") });

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [recoveryReady, setRecoveryReady] = useState(false);

  // Supabase fires PASSWORD_RECOVERY when the magic link is opened.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setRecoveryReady(true);
    });
    supabase.auth.getSession().then(({ data }) => { if (data.session) setRecoveryReady(true); });
    return () => subscription.unsubscribe();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ password });
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Invalid password"); return; }
    setError(null);
    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) { toast.error(err.message); return; }
    toast.success("Password updated 👑");
    navigate({ to: "/app" });
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6">
      <div
        className="pointer-events-none absolute -top-32 right-1/2 -z-10 h-96 w-96 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, #C9A84C 0%, transparent 70%)" }}
      />
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <Link to="/" className="mb-10 flex items-center justify-center gap-2">
          <Crown className="h-5 w-5 text-gold" />
          <span className="text-sm font-bold tracking-[0.24em] text-gold">WEALTHFLOW</span>
        </Link>
        <div
          className="rounded-2xl border border-[var(--gold-dim)] p-6 shadow-card backdrop-blur-xl"
          style={{ background: "color-mix(in oklab, var(--surface) 80%, transparent)" }}
        >
          <h1 className="font-display text-3xl italic">Set a new password</h1>
          <p className="mt-2 text-sm text-text-second">
            {recoveryReady ? "Choose a strong password to secure your empire." : "Verifying your reset link…"}
          </p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-second">New password</label>
              <div className="relative mt-1">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-second">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  disabled={!recoveryReady}
                  className={`h-12 w-full rounded-lg border bg-surface-mid pl-10 pr-4 text-base outline-none transition-colors focus:border-gold focus:shadow-[0_0_0_3px_var(--gold-glow)] ${error ? "border-[var(--negative)]" : "border-border"}`}
                  placeholder="••••••••"
                />
              </div>
              {error && <p className="mt-1 text-xs text-[var(--negative)]">{error}</p>}
            </div>
            <Button type="submit" variant="gold" size="lg" full disabled={loading || !recoveryReady}>
              {loading ? "Updating…" : "Update password"}
            </Button>
          </form>
        </div>
      </motion.div>
    </main>
  );
}
