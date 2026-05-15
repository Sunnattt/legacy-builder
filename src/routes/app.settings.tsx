import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft, User, DollarSign, EyeOff, Bell, Database,
  LogOut, Crown, Trash2, Sparkles, ChevronRight, Search, Check,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/wf/Button";
import { Card } from "@/components/wf/Card";
import { supabase } from "@/integrations/supabase/client";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useTransactionStore } from "@/store/useTransactionStore";
import { useGoalStore } from "@/store/useGoalStore";

export const Route = createFileRoute("/app/settings")({
  head: () => ({ meta: [{ title: "Settings — WealthFlow" }] }),
  component: Settings,
});

const CURRENCIES = [
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "INR", name: "Indian Rupee" },
  { code: "AED", name: "UAE Dirham" },
];

function Settings() {
  const navigate = useNavigate();
  const { currency, setCurrency, privacyMode, togglePrivacy, reminderHour, setReminder } =
    useSettingsStore();
  const resetTx = useTransactionStore((s) => s.reset);
  const resetGoals = useGoalStore((s) => s.reset);

  const [email, setEmail] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
      setName(
        (data.user?.user_metadata?.display_name as string) ??
          data.user?.email?.split("@")[0] ??
          ""
      );
    });
  }, []);

  const saveName = async () => {
    setSavingName(true);
    const { error: authErr } = await supabase.auth.updateUser({ data: { display_name: name } });
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      await supabase.from("profiles").update({ display_name: name }).eq("id", data.user.id);
    }
    setSavingName(false);
    if (authErr) toast.error(authErr.message);
    else toast.success("Name updated");
  };

  const handleReset = () => {
    resetTx();
    resetGoals();
    setConfirmReset(false);
    toast.success("Data reset to defaults");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <main className="px-5 pt-6 pb-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Link
          to="/app/profile"
          className="rounded-full p-2 text-text-second hover:bg-surface-mid"
          aria-label="Back"
        >
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-3xl font-black tracking-tight">Settings</h1>
      </div>

      {/* Account */}
      <SectionTitle icon={User} label="Account" />
      <Card>
        <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-second">
          Display name
        </label>
        <div className="mt-1 flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-11 w-full rounded-lg border border-border bg-surface-mid px-3 text-sm text-text-primary outline-none focus:border-gold"
            placeholder="Your name"
          />
          <Button onClick={saveName} disabled={savingName || !name.trim()} variant="gold">
            {savingName ? "…" : "Save"}
          </Button>
        </div>
        <div className="mt-4 text-[11px] uppercase tracking-[0.16em] text-text-second">Email</div>
        <div className="mt-1 truncate text-sm text-text-primary">{email ?? "—"}</div>
      </Card>

      {/* Currency */}
      <SectionTitle icon={DollarSign} label="Currency" />
      <Card>
        <p className="text-xs text-text-second">
          Switches every amount across the app instantly.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {CURRENCIES.map((c) => {
            const active = currency === c.code;
            return (
              <button
                key={c.code}
                onClick={() => {
                  setCurrency(c.code);
                  toast.success(`Currency set to ${c.code}`);
                }}
                className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-all ${
                  active
                    ? "border-transparent bg-gradient-gold text-[#07070E]"
                    : "border-border bg-surface-mid text-text-primary hover:border-[var(--gold-dim)]"
                }`}
              >
                <span className="text-sm font-bold">{c.code}</span>
                <span className={`text-[10px] ${active ? "text-[#07070E]/70" : "text-text-second"}`}>
                  {c.name}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Privacy */}
      <SectionTitle icon={EyeOff} label="Privacy" />
      <Card>
        <Row
          title="Privacy mode"
          subtitle="Blur all amounts on every screen."
          right={
            <Toggle on={privacyMode} onClick={togglePrivacy} />
          }
        />
      </Card>

      {/* Reminders */}
      <SectionTitle icon={Bell} label="Reminders" />
      <Card>
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-sm font-semibold text-text-primary">Daily check-in</div>
            <div className="text-xs text-text-second">A nudge to log your day.</div>
          </div>
          <div className="text-2xl font-black tabular text-gradient-gold">
            {String(reminderHour).padStart(2, "0")}:00
          </div>
        </div>
        <input
          type="range"
          min={0}
          max={23}
          value={reminderHour}
          onChange={(e) => setReminder(Number(e.target.value))}
          className="mt-3 w-full accent-[var(--gold)]"
        />
        <div className="mt-1 flex justify-between text-[10px] text-text-second">
          <span>00:00</span><span>12:00</span><span>23:00</span>
        </div>
      </Card>

      {/* Data */}
      <SectionTitle icon={Database} label="Data" />
      <Card>
        {!confirmReset ? (
          <Row
            title="Reset to demo data"
            subtitle="Replace transactions and goals with sample data."
            right={
              <button
                onClick={() => setConfirmReset(true)}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text-primary hover:border-[var(--gold-dim)]"
              >
                Reset
              </button>
            }
          />
        ) : (
          <div>
            <div className="text-sm font-semibold text-text-primary">
              Reset all local data?
            </div>
            <div className="mt-1 text-xs text-text-second">
              This clears your transactions and goals on this device.
            </div>
            <div className="mt-3 flex gap-2">
              <Button onClick={handleReset} variant="gold" full>
                <Trash2 size={14} /> Yes, reset
              </Button>
              <Button onClick={() => setConfirmReset(false)} variant="outline" full>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* About */}
      <SectionTitle icon={Sparkles} label="About" />
      <Card>
        <Row
          title="WealthFlow"
          subtitle="Premium personal finance OS — v1.0"
          right={<Crown className="h-5 w-5 text-gold" />}
        />
        <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
          <a className="rounded-full border border-border px-3 py-1 text-text-second hover:text-text-primary" href="#">
            Terms
          </a>
          <a className="rounded-full border border-border px-3 py-1 text-text-second hover:text-text-primary" href="#">
            Privacy
          </a>
          <a className="rounded-full border border-border px-3 py-1 text-text-second hover:text-text-primary" href="#">
            Support
          </a>
        </div>
      </Card>

      {/* Sign out */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8">
        <Button variant="outline" full onClick={handleSignOut}>
          <LogOut size={16} /> Sign out
        </Button>
      </motion.div>
    </main>
  );
}

function SectionTitle({ icon: Icon, label }: { icon: typeof User; label: string }) {
  return (
    <div className="mb-2 mt-6 flex items-center gap-2 px-1">
      <Icon className="h-3.5 w-3.5 text-gold" />
      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-text-second">
        {label}
      </span>
    </div>
  );
}

function Row({
  title, subtitle, right,
}: { title: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold text-text-primary">{title}</div>
        {subtitle && <div className="truncate text-xs text-text-second">{subtitle}</div>}
      </div>
      {right}
    </div>
  );
}

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="relative h-7 w-12 shrink-0 rounded-full transition-colors"
      style={{ background: on ? "var(--gold)" : "var(--surface-mid)" }}
      aria-pressed={on}
    >
      <span
        className="absolute top-0.5 h-6 w-6 rounded-full bg-[#07070E] transition-all"
        style={{ left: on ? "calc(100% - 26px)" : 2 }}
      />
    </button>
  );
}

void ChevronRight;
