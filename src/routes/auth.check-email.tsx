import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, Crown } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/wf/Button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const search = z.object({ email: z.string().email().optional() });

export const Route = createFileRoute("/auth/check-email")({
  head: () => ({ meta: [{ title: "Check your email — WealthFlow" }] }),
  validateSearch: (s) => search.parse(s),
  component: CheckEmailPage,
});

function CheckEmailPage() {
  const { email } = Route.useSearch();
  const navigate = useNavigate();
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  // Auto-redirect once the user verifies and a session arrives.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate({ to: "/app" });
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  // Cooldown ticker.
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const resend = async () => {
    if (!email || cooldown > 0) return;
    setResending(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: window.location.origin + "/app" },
    });
    setResending(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Confirmation email sent");
    setCooldown(45);
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6">
      <div
        className="pointer-events-none absolute -top-32 right-1/2 h-96 w-96 -z-10 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, #C9A84C 0%, transparent 70%)" }}
      />
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md text-center"
      >
        <Link to="/" className="mb-10 inline-flex items-center gap-2">
          <Crown className="h-5 w-5 text-gold" />
          <span className="text-sm font-bold tracking-[0.24em] text-gold">WEALTHFLOW</span>
        </Link>

        <div
          className="rounded-2xl border border-[var(--gold-dim)] p-8 shadow-card backdrop-blur-xl"
          style={{ background: "color-mix(in oklab, var(--surface) 80%, transparent)" }}
        >
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-gold text-[#07070E] shadow-glow"
          >
            <Mail className="h-9 w-9" />
          </motion.div>

          <h1 className="mt-6 font-display text-3xl italic text-text-primary">Check your email</h1>
          <p className="mt-3 text-sm text-text-second">
            We sent a confirmation link to{" "}
            <span className="font-semibold text-text-primary">{email ?? "your inbox"}</span>.
            Click it to enter your empire.
          </p>

          <div className="mt-8 space-y-3">
            <Button onClick={resend} variant="outline" size="lg" full disabled={!email || cooldown > 0 || resending}>
              {resending
                ? "Sending…"
                : cooldown > 0
                  ? `Resend in ${cooldown}s`
                  : "Resend confirmation email"}
            </Button>
            <Link to="/login" className="block text-sm text-text-second hover:text-gold">
              Back to sign in
            </Link>
          </div>
        </div>

        <p className="mt-6 text-xs text-text-second">
          Didn't get it? Check spam, or try a different email.
        </p>
      </motion.div>
    </main>
  );
}
