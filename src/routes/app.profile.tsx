import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Settings as SettingsIcon, ChevronRight } from "lucide-react";
import { Button } from "@/components/wf/Button";
import { Card } from "@/components/wf/Card";
import { supabase } from "@/integrations/supabase/client";
import { useSettingsStore } from "@/store/useSettingsStore";

export const Route = createFileRoute("/app/profile")({
  head: () => ({ meta: [{ title: "Profile — WealthFlow" }] }),
  component: Profile,
});

function Profile() {
  const navigate = useNavigate();
  const { privacyMode, togglePrivacy, currency } = useSettingsStore();
  const [email, setEmail] = useState<string | null>(null);
  const [name, setName] = useState<string>("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
      setName((data.user?.user_metadata?.display_name as string) ?? data.user?.email?.split("@")[0] ?? "Member");
    });
  }, []);

  const initials = name.slice(0, 2).toUpperCase();

  return (
    <main className="px-5 pt-10">
      <h1 className="mb-6 text-3xl font-black tracking-tight">Profile</h1>
      <Card className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-gold text-lg font-black text-[#07070E]">
          {initials}
        </div>
        <div className="min-w-0">
          <div className="truncate font-bold text-text-primary">{name}</div>
          <div className="truncate text-xs text-text-second">{email ?? "Guest mode"}</div>
        </div>
      </Card>

      <Card className="mt-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Privacy mode</div>
            <div className="text-xs text-text-second">Blur all amounts on screen.</div>
          </div>
          <button
            onClick={togglePrivacy}
            className="relative h-7 w-12 rounded-full transition-colors"
            style={{ background: privacyMode ? "var(--gold)" : "var(--surface-mid)" }}
          >
            <span
              className="absolute top-0.5 h-6 w-6 rounded-full bg-[#07070E] transition-all"
              style={{ left: privacyMode ? "calc(100% - 26px)" : 2 }}
            />
          </button>
        </div>
      </Card>

      <Card className="mt-4">
        <div className="text-sm font-semibold">Currency</div>
          <div className="mt-1 text-xs text-text-second">Currently {currency}. Tap to switch.</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {["USD","EUR","GBP","CAD","JPY","INR","AED"].map((c) => (
              <button
                key={c}
                onClick={() => useSettingsStore.getState().setCurrency(c)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                  currency === c
                    ? "border-transparent bg-gradient-gold text-[#07070E]"
                    : "border-border bg-surface-mid text-text-second hover:text-text-primary"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
      </Card>

      <div className="mt-8">
        <Button
          variant="outline" full
          onClick={async () => {
            await supabase.auth.signOut();
            navigate({ to: "/" });
          }}
        >
          Sign out
        </Button>
      </div>
    </main>
  );
}
