import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import { Crown, Mail } from "lucide-react";
import { Button } from "@/components/wf/Button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Reset password — WealthFlow" }] }),
  component: ForgotPasswordPage,
});

const schema = z.object({ email: z.string().email("Enter a valid email") });

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email });
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Invalid email"); return; }
    setError(null);
    setLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset-password",
    });
    setLoading(false);
    if (err) { toast.error(err.message); return; }
    setSent(true);
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6">
      <div
        className="pointer-events-none absolute -top-32 right-1/2 -z-10 h-96 w-96 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, #C9A84C 0%, transparent 70%)" }}
      />
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <Link to="/" className="mb-10 flex items-center justify-center gap-2">
          <Crown className="h-5 w-5 text-gold" />
          <span className="text-sm font-bold tracking-[0.24em] text-gold">WEALTHFLOW</span>
        </Link>

        <div
          className="rounded-2xl border border-[var(--gold-dim)] p-6 shadow-card backdrop-blur-xl"
          style={{ background: "color-mix(in oklab, var(--surface) 80%, transparent)" }}
        >
          {sent ? (
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-gold text-[#07070E] shadow-glow">
                <Mail className="h-7 w-7" />
              </div>
              <h1 className="mt-5 font-display text-2xl italic">Check your email</h1>
              <p className="mt-2 text-sm text-text-second">
                A password-reset link is on its way to{" "}
                <span className="font-semibold text-text-primary">{email}</span>.
              </p>
              <Link to="/login" className="mt-6 inline-block text-sm font-semibold text-gold">
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <h1 className="font-display text-3xl italic">Forgot password?</h1>
              <p className="mt-2 text-sm text-text-second">We'll email you a reset link.</p>
              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-second">Email</label>
                  <div className="relative mt-1">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-second">
                      <Mail className="h-4 w-4" />
                    </span>
                    <input
                      type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      className={`h-12 w-full rounded-lg border bg-surface-mid pl-10 pr-4 text-base outline-none transition-colors focus:border-gold focus:shadow-[0_0_0_3px_var(--gold-glow)] ${error ? "border-[var(--negative)]" : "border-border"}`}
                      placeholder="you@empire.com"
                    />
                  </div>
                  {error && <p className="mt-1 text-xs text-[var(--negative)]">{error}</p>}
                </div>
                <Button type="submit" variant="gold" size="lg" full disabled={loading}>
                  {loading ? "Sending…" : "Send reset link"}
                </Button>
              </form>
              <Link to="/login" className="mt-6 block text-center text-sm text-text-second hover:text-gold">
                Back to sign in
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </main>
  );
}
