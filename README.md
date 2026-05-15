# 🏛️ WealthFlow

> **Build Your Legacy. Track Your Empire.**

A premium, dark-luxury personal finance & net-worth dashboard. Track wealth,
goals, milestones, habits, and long-term legacy — all wrapped in a
gold-on-black design system inspired by the world's best fintech products.

---

## ✨ Features

- 👑 **Net Worth Dashboard** — animated total, hero chart, milestone progress
- 🎯 **Goals & Milestones** — confetti at 10 / 25 / 50 / 75 / 100 %
- 💎 **Transactions** — income, expense, saving, investment with categories
- 📈 **Analytics** — area, donut, and bar charts powered by Recharts
- 🔥 **Habits** — streak tracking with longest-streak memory
- 🌍 **Multi-currency** support (USD, EUR, GBP, AED, SAR, RUB, UZS, KZT, TRY, INR, CNY, JPY)
- 🔐 **Auth** — email + password, Google sign-in, email confirmation, password reset
- 📱 **Mobile-first PWA-style** — installable, offline-friendly, gorgeous on every device

---

## 🛠️ Tech Stack

- **TanStack Start v1** (SSR + file-based routing) on **Cloudflare Workers**
- **React 19** + **TanStack Query**
- **Tailwind CSS v4** + Radix / shadcn-style components
- **Supabase** (Postgres, Auth, Storage) — managed via Lovable Cloud
- **Framer Motion** + **Recharts**
- **TypeScript** strict, **Bun** package manager

---

## 🚀 Getting Started

```bash
bun install
cp .env.example .env   # fill in your Supabase keys
bun dev
```

Open <http://localhost:3000>.

### Required env vars

See `.env.example`. The `VITE_*` keys are public; `SUPABASE_SERVICE_ROLE_KEY`
must remain server-only.

---

## 🗄️ Backend (Lovable Cloud / Supabase)

Tables live in `supabase/migrations/`:

| Table | Purpose |
| --- | --- |
| `profiles` | display name, currency, privacy mode |
| `transactions` | income / expense / saving / investment ledger |
| `goals` | targets with milestone tracking |
| `habits` | streaks and completed dates |
| `net_worth_snapshots` | historical net-worth chart data |

All tables enforce **Row Level Security** scoped to `auth.uid()`.

### Auth providers

- Email + password (default)
- Google OAuth (managed via Lovable Cloud — no client ID required)

---

## ☁️ Deploy (Cloudflare)

```bash
bun run build
bunx wrangler deploy
```

The Cloudflare config lives in `wrangler.jsonc`. The app name is `wealthflow`.

---

## 📁 Structure

```
src/
  routes/          file-based routing (TanStack)
  components/wf/   premium WealthFlow components (gold theme)
  components/ui/   shadcn-style primitives
  store/           zustand stores
  lib/             pure helpers (currency, dates, calculations)
  integrations/    Supabase + Lovable auth (auto-generated, do not edit)
```

---

## 🔒 Security Notes

- **Never commit `.env`.** Only `.env.example` is tracked.
- All Supabase clients exposed to the browser use the publishable key + RLS.
- The service-role client (`client.server.ts`) is reserved for trusted
  server-side operations only.

---

*WealthFlow — Build your empire. Track your legacy.* 👑
