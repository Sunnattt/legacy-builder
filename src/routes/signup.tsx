import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { motion } from "framer-motion";
import { Crown, Mail, Lock, User } from "lucide-react";
import { Button } from "@/components/wf/Button";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import { HeroPanel, BackgroundOrbs, GoogleIcon } from "@/components/wf/AuthHero";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create your empire — WealthFlow" },
      { name: "description", content: "Start your legacy with WealthFlow. Free forever, no card required." },
    ],
  }),
  component: SignupPage,
});

const schema = z.object({
  displayName: z.string().min(2, "Tell us your name"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
});

function passwordStrength(pw: string): { level: 0 | 1 | 2 | 3 | 4; label: string; color: string } {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const map = [
    { label: "Too weak", color: "#E04545" },
    { label: "Weak", color: "#E04545" },
    { label: "Okay", color: "#C9A84C" },
    { label: "Strong", color: "#28C78A" },
    { label: "Excellent", color: "#28C78A" },
  ] as const;
  return { level: s as 0 | 1 | 2 | 3 | 4, ...map[s] };
}

function SignupPage() {
  const navigate = useNavigate();
  const [displayName, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const strength = useMemo(() => passwordStrength(password), [password]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ displayName, email, password });
    if (!parsed.success) {
      const fe = parsed.error.flatten().fieldErrors;
      setErrors({
        displayName: fe.displayName?.[0] ?? "",
        email: fe.email?.[0] ?? "",
        password: fe.password?.[0] ?? "",
      });
      return;
    }
    setErrors({});
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: window.location.origin + "/app",
      },
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }

    // If email confirmation is required, no session yet.
    if (!data.session) {
      navigate({ to: "/auth/check-email", search: { email } });
      return;
    }
    toast.success("Welcome to your empire 👑");
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
            <h1 className="font-display text-4xl italic text-text-primary">Start your empire</h1>
            <p className="mt-2 text-sm text-text-second">Free forever. No card required.</p>

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
                <GoogleIcon />
                {googleLoading ? "Redirecting…" : "Continue with Google"}
              </button>

              <div className="my-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-second">or email</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <form onSubmit={onSubmit} className="space-y-4">
                <Field icon={<User className="h-4 w-4" />} label="Name" value={displayName} onChange={setName} error={errors.displayName} placeholder="Alex" />
                <Field icon={<Mail className="h-4 w-4" />} label="Email" type="email" value={email} onChange={setEmail} error={errors.email} placeholder="you@empire.com" />
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-second">Password</label>
                  <div className="relative mt-1">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-second">
                      <Lock className="h-4 w-4" />
                    </span>
                    <input
                      type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                      className="h-12 w-full rounded-lg border border-border bg-surface-mid pl-10 pr-4 text-base outline-none transition-colors focus:border-gold focus:shadow-[0_0_0_3px_var(--gold-glow)]"
                      placeholder="••••••••"
                    />
                  </div>
                  {password && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex flex-1 gap-1">
                        {[0, 1, 2, 3].map((i) => (
                          <div key={i} className="h-1 flex-1 rounded-full transition-colors"
                            style={{ background: i < strength.level ? strength.color : "var(--surface-mid)" }} />
                        ))}
                      </div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: strength.color }}>
                        {strength.label}
                      </span>
                    </div>
                  )}
                  {errors.password && <p className="mt-1 text-xs text-[var(--negative)]">{errors.password}</p>}
                </div>
                <Button type="submit" variant="gold" size="lg" full disabled={loading}>
                  {loading ? "Forging your throne…" : "Claim your throne"}
                </Button>
              </form>
            </div>

            <p className="mt-6 text-center text-sm text-text-second">
              Have an account?{" "}
              <Link to="/login" className="font-semibold text-gold hover:underline">Sign in</Link>
            </p>
          </motion.div>
        </section>
      </div>
    </main>
  );
}

function Field({
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
