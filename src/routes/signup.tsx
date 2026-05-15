import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { motion } from "framer-motion";
import { Button } from "@/components/wf/Button";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create account — WealthFlow" }] }),
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
    const { error } = await supabase.auth.signUp({
      email, password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: window.location.origin + "/app",
      },
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Welcome to WealthFlow");
    navigate({ to: "/app" });
  };

  const onGoogle = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/app" });
    if (r.error) toast.error(r.error.message ?? "Google sign-in failed");
  };

  return (
    <main className="mx-auto min-h-screen max-w-md px-6 pt-16">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-black tracking-tight">Start your empire</h1>
        <p className="mt-1 text-sm text-text-second">Free forever. No card required.</p>
      </motion.div>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <Field label="Name" value={displayName} onChange={setName} error={errors.displayName} placeholder="Alex" />
        <Field label="Email" type="email" value={email} onChange={setEmail} error={errors.email} placeholder="you@empire.com" />
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-second">Password</label>
          <input
            type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-surface-mid px-4 py-3 text-base outline-none focus:border-gold"
            placeholder="••••••••"
          />
          {password && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex flex-1 gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-1 flex-1 rounded-full" style={{ background: i < strength.level ? strength.color : "var(--surface-mid)" }} />
                ))}
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: strength.color }}>{strength.label}</span>
            </div>
          )}
          {errors.password && <p className="mt-1 text-xs text-[var(--negative)]">{errors.password}</p>}
        </div>
        <Button type="submit" variant="gold" size="lg" full disabled={loading}>
          {loading ? "Creating…" : "Create account"}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[10px] uppercase tracking-widest text-text-dim">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>
      <Button variant="outline" size="lg" full onClick={onGoogle} type="button">Continue with Google</Button>

      <p className="mt-8 text-center text-sm text-text-second">
        Have an account? <Link to="/login" className="text-gold">Sign in</Link>
      </p>
    </main>
  );
}

function Field({ label, value, onChange, error, type = "text", placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  error?: string; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-second">{label}</label>
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-border bg-surface-mid px-4 py-3 text-base text-text-primary outline-none focus:border-gold"
      />
      {error && <p className="mt-1 text-xs text-[var(--negative)]">{error}</p>}
    </div>
  );
}
