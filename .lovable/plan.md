
# WealthFlow — Web App Build Plan

## Reality check on stack

The original spec targets React Native + Expo. This Lovable project is a TanStack Start web app (React 19 + Vite + Cloudflare Workers), so I'll faithfully port the spec to the web equivalents while preserving every screen, calculation, and design decision:

| Spec (React Native) | Web equivalent we'll use |
|---|---|
| Expo Router | TanStack Router (file-based, already set up) |
| Zustand + AsyncStorage | Zustand + `localStorage` persist middleware |
| Supabase | Lovable Cloud (Supabase under the hood) |
| Victory Native XL + Skia | Recharts (composable, performant SVG) |
| Reanimated + Moti | Framer Motion |
| React Hook Form + Zod | Same — both work on web |
| Expo Haptics | `navigator.vibrate()` (mobile browsers) |
| Expo Notifications | Web Push API + in-app toasts |
| Biometric unlock | WebAuthn (passkeys) — phase 2 |
| FlashList | `react-window` for long lists |
| StyleSheet | Tailwind v4 + design tokens in `src/styles.css` |

The app will be a mobile-first installable PWA (manifest only, no service worker — per Lovable PWA guidance) with a max-width container that looks great on desktop too. Includes the marketing landing page (option 3) and the full finance app (option 1) under one project.

## Phased delivery

The full spec is ~25 screens with deep functionality. Building it in one shot would be unreliable. I'll deliver in 6 phases, each independently usable. **Phase 1 ships in this turn**; subsequent phases proceed automatically unless you stop me.

### Phase 1 — Foundation + Landing + Auth + Dashboard (THIS TURN)
- Enable Lovable Cloud and run the full SQL schema (profiles, transactions, goals, habits, net_worth_snapshots) with RLS
- Design system in `src/styles.css`: gold/black palette, typography scale, spacing, radii, shadows — all as tokens
- Reusable UI primitives: `Button`, `Card`, `Badge`, `ProgressRing`, `ProgressBar`, `AnimatedNumber`, `GoldDivider`, `EmptyState`
- Public landing page at `/` (luxury marketing site — gold-on-black, hero, features, CTA)
- Auth at `/login` and `/signup` (email/password + Google via Lovable broker, Zod validation, password strength)
- App shell at `/app/*` with custom bottom tab bar (Dashboard / Goals / Add / Analytics / Profile)
- **Dashboard** fully built: animated net worth hero, goal ring, net worth area chart with 1M/3M/1Y/ALL switcher, 2×2 stats grid, savings rate bar, insight banner, recent transactions, streak dots
- Zustand stores for auth/transactions/goals/habits/settings with `localStorage` persist
- Financial calculation engine (`src/lib/calculations.ts`) — every formula from the spec
- Mock data seed so the dashboard is alive on first visit before any data is entered

### Phase 2 — Add Transaction + Goals
- `/app/add` full transaction form: 4-type selector, giant amount input with formatting, category chips, date picker, recurring toggle
- `/app/goals`: header stats, goal cards with milestone chips, progress animations, confetti on milestone cross, add-goal bottom sheet with emoji/color/date pickers
- Optimistic mutations + cache invalidation

### Phase 3 — Analytics
- Time range tabs (7D/30D/3M/1Y/ALL)
- Net worth line chart, wealth breakdown donut, monthly grouped bar chart, expense horizontal bars, investment growth tracker, trend cards

### Phase 4 — AI Insights + Projections
- `/app/insights`: discipline score ring with sub-metrics
- Insight engine generating all 8 insight types from real user data
- Future projection card with growth-rate slider (4–15%, real-time recalc)
- Smart budget advisor (50/30/20 rule against actual income)

### Phase 5 — Habits + Badges
- `/app/habits`: daily score ring, 30-day heatmap, habit list with 7-day dot calendars, tap-to-complete with haptic
- Streak tracking + breakage logic
- Badges gallery (8 badges, locked/earned states)

### Phase 6 — Settings + Polish
- `/app/profile` and `/app/settings`: profile card, currency/locale prefs, privacy mode (blur amounts), notification toggles, CSV export, CSV import with column mapping, danger zone
- PWA manifest + icons (installable to home screen, no service worker)
- Web push notifications for daily reminders / streak warnings / milestones
- Final pass: empty states, loading skeletons, error boundaries, keyboard nav, a11y audit

## Technical details (for reference)

**Routes layout**
```
src/routes/
  __root.tsx              (existing, will extend with QueryClientProvider + auth listener)
  index.tsx               (landing page — replaces placeholder)
  login.tsx, signup.tsx
  _authenticated.tsx      (layout with auth gate, custom tab bar, max-w container)
  _authenticated/
    app.index.tsx         (Dashboard)
    app.goals.tsx
    app.add.tsx
    app.analytics.tsx
    app.profile.tsx
    app.insights.tsx
    app.habits.tsx
    app.transactions.tsx
    app.settings.tsx
```

**Server functions** (`src/lib/*.functions.ts`) for all DB reads/writes — `requireSupabaseAuth` middleware, RLS-scoped. Browser-side Supabase client only for auth flows + realtime subscription on transactions/goals.

**Charts** use Recharts wrapped in motion containers for entrance animation. Skia-style hardware acceleration isn't possible on web; Recharts at this data scale will hit 60fps comfortably.

**Offline**: mutations queue in Zustand-persisted store and flush on `online` event. Read cache via TanStack Query with `staleTime: 60s`.

**Mock data**: 60 transactions over 90 days, 4 goals at varied progress, 5 habits with realistic streaks, 12 months of net worth snapshots — seeded into Cloud on first signup via a server function.

## What this plan does NOT include

- Native iOS/Android app (requires Expo, not supported here — would need a separate React Native project)
- Biometric login via Expo (web equivalent = WebAuthn passkeys, deferred to a future phase if you want it)
- True OS-level background notifications (web push works only when the browser is running)

## Confirmation needed

Phase 1 alone is a substantial build (foundation + landing + auth + full dashboard + mock data). Reply **"go"** to start Phase 1, or tell me to reorder phases / drop scope.
