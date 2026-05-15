import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { motion } from "framer-motion";
import { Crown, Mail, Lock } from "lucide-react";
import { Button } from "@/components/wf/Button";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import { HeroPanel, BackgroundOrbs } from "@/components/wf/AuthHero";

function GoogleMark() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.4 14.6 2.4 12 2.4 6.7 2.4 2.4 6.7 2.4 12s4.3 9.6 9.6 9.6c5.5 0 9.2-3.9 9.2-9.4 0-.6-.1-1.1-.2-1.6H12z" />
    </svg>
  );
}

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — WealthFlow" },
      { name: "description", content: "Sign in to WealthFlow to track your net worth, goals, and legacy." },
    ],
  }),
  component: LoginPage,
});

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      const fe = parsed.error.flatten().fieldErrors;
      setErrors({ email: fe.email?.[0], password: fe.password?.[0] });
      return;
    }
    setErrors({});
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back, sovereign 👑");
    navigate({ to: "/app" });
  };

  const onGoogle = async () => {
    setGoogleLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/app",
    });
    if (result.error) {
      setGoogleLoading(false);
      toast.error(result.error.message ?? "Google sign-in failed");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/app" });
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <BackgroundOrbs />
      <div className="relative mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 lg:grid-cols-2">
        <HeroPanel />
        <section className="flex items-center justify-center px-6 py-16 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-sm"
          >
            <div className="mb-8 flex items-center gap-2 lg:hidden">
              <Crown className="h-5 w-5 text-gold" />
              <span className="text-sm font-bold tracking-[0.2em] text-gold">WEALTHFLOW</span>
            </div>
            <h1 className="font-display text-4xl italic text-text-primary">Welcome back</h1>
            <p className="mt-2 text-sm text-text-second">Sign in to your empire.</p>

            <div
              className="mt-8 rounded-2xl border border-[var(--gold-dim)] p-6 shadow-card backdrop-blur-xl"
              style={{ background: "color-mix(in oklab, var(--surface) 75%, transparent)" }}
            >
              <button
                type="button"
                onClick={onGoogle}
                disabled={googleLoading}
                className="flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-border bg-surface-mid font-semibold text-text-primary transition-colors hover:bg-surface-high disabled:opacity-60"
              >
                <GoogleMark />
                {googleLoading ? "Redirecting…" : "Continue with Google"}
              </button>

              <div className="my-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-second">or email</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <form onSubmit={onSubmit} className="space-y-4">
                <FieldGroup
                  label="Email" icon={<Mail className="h-4 w-4" />}
                  type="email" value={email} onChange={setEmail} error={errors.email}
                  placeholder="you@empire.com"
                />
                <FieldGroup
                  label="Password" icon={<Lock className="h-4 w-4" />}
                  type="password" value={password} onChange={setPassword} error={errors.password}
                  placeholder="••••••••"
                />
                <div className="flex justify-end">
                  <Link to="/forgot-password" className="text-xs font-semibold text-gold hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Button type="submit" variant="gold" size="lg" full disabled={loading}>
                  {loading ? "Signing in…" : "Enter your empire"}
                </Button>
              </form>
            </div>

            <p className="mt-6 text-center text-sm text-text-second">
              New here?{" "}
              <Link to="/signup" className="font-semibold text-gold hover:underline">
                Start your legacy
              </Link>
            </p>
          </motion.div>
        </section>
      </div>
    </main>
  );
}

function FieldGroup({
  label, icon, value, onChange, error, type = "text", placeholder,
}: {
  label: string; icon?: React.ReactNode; value: string;
  onChange: (v: string) => void; error?: string; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-second">{label}</label>
      <div className="relative mt-1">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-second">{icon}</span>
        )}
        <input
          type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className={`h-12 w-full rounded-lg border bg-surface-mid text-base text-text-primary outline-none transition-colors focus:border-gold focus:shadow-[0_0_0_3px_var(--gold-glow)] ${icon ? "pl-10 pr-4" : "px-4"} ${error ? "border-[var(--negative)]" : "border-border"}`}
        />
      </div>
      {error && <p className="mt-1 text-xs text-[var(--negative)]">{error}</p>}
    </div>
  );
}
