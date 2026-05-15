import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { motion } from "framer-motion";
import { Button } from "@/components/wf/Button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — WealthFlow" }] }),
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
    navigate({ to: "/app" });
  };


  return (
    <main className="mx-auto min-h-screen max-w-md px-6 pt-16">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-black tracking-tight">Welcome back</h1>
        <p className="mt-1 text-sm text-text-second">Sign in to your empire.</p>
      </motion.div>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-second">Email</label>
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-surface-mid px-4 py-3 text-base text-text-primary outline-none focus:border-gold"
            placeholder="you@empire.com"
          />
          {errors.email && <p className="mt-1 text-xs text-[var(--negative)]">{errors.email}</p>}
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-second">Password</label>
          <input
            type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-surface-mid px-4 py-3 text-base text-text-primary outline-none focus:border-gold"
            placeholder="••••••••"
          />
          {errors.password && <p className="mt-1 text-xs text-[var(--negative)]">{errors.password}</p>}
        </div>
        <Button type="submit" variant="gold" size="lg" full disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
      </div>

      </Button>

      <p className="mt-8 text-center text-sm text-text-second">
        New here? <Link to="/signup" className="text-gold">Create an account</Link>
      </p>
    </main>
  );
}
