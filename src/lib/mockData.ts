import type { Goal, Habit, NetWorthSnapshot, Transaction } from "@/types/wealthflow";
import { CATEGORIES } from "./categories";

const today = () => new Date();
const isoOffset = (days: number) => {
  const d = today();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
};

const rid = () => Math.random().toString(36).slice(2, 11);
const rand = (min: number, max: number) => min + Math.random() * (max - min);
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const buildMockTransactions = (count = 60): Transaction[] => {
  const txs: Transaction[] = [];
  // monthly salary anchor
  for (let m = 0; m < 3; m++) {
    txs.push({
      id: rid(),
      type: "income",
      amount: 7800 + Math.round(rand(-200, 400)),
      category: "Salary",
      note: "Monthly salary",
      date: isoOffset(m * 30 + 2),
    });
  }
  for (let i = 0; i < count - 3; i++) {
    const type: Transaction["type"] = pick([
      "expense", "expense", "expense", "expense",
      "saving", "saving",
      "investment", "investment",
      "income",
    ]);
    const cats = CATEGORIES[type];
    const cat = pick(cats);
    const amount =
      type === "expense" ? Math.round(rand(8, 320))
      : type === "saving" ? Math.round(rand(100, 1200))
      : type === "investment" ? Math.round(rand(150, 2000))
      : Math.round(rand(80, 900));
    txs.push({
      id: rid(),
      type,
      amount,
      category: cat.name,
      note: null,
      date: isoOffset(Math.floor(rand(0, 90))),
    });
  }
  return txs.sort((a, b) => b.date.localeCompare(a.date));
};

export const buildMockGoals = (): Goal[] => [
  {
    id: rid(), title: "Dream House", emoji: "🏡",
    target_amount: 80000, current_amount: 22500, color: "#C9A84C",
    deadline: isoOffset(-365 * 2), is_completed: false, milestones_hit: [1, 5, 10, 25],
  },
  {
    id: rid(), title: "Emergency Fund", emoji: "🛡️",
    target_amount: 24000, current_amount: 18900, color: "#28C78A",
    deadline: isoOffset(-180), is_completed: false, milestones_hit: [1, 5, 10, 25, 50, 75],
  },
  {
    id: rid(), title: "Tesla Model 3", emoji: "🚗",
    target_amount: 45000, current_amount: 6300, color: "#4A8FE8",
    deadline: isoOffset(-365), is_completed: false, milestones_hit: [1, 5, 10],
  },
  {
    id: rid(), title: "Japan Trip", emoji: "🗾",
    target_amount: 5500, current_amount: 5500, color: "#7C5CBF",
    deadline: isoOffset(-30), is_completed: true, milestones_hit: [1, 5, 10, 25, 50, 75, 100],
  },
];

export const buildMockHabits = (): Habit[] => {
  const dates = (n: number) => Array.from({ length: n }, (_, i) => isoOffset(i));
  return [
    { id: rid(), name: "Log expenses", icon: "📝", streak: 12, longest_streak: 24, completed_dates: dates(12) },
    { id: rid(), name: "Review budget", icon: "📊", streak: 7, longest_streak: 14, completed_dates: dates(7) },
    { id: rid(), name: "Save $20 daily", icon: "💰", streak: 21, longest_streak: 21, completed_dates: dates(21) },
    { id: rid(), name: "No impulse buy", icon: "🛑", streak: 4, longest_streak: 11, completed_dates: dates(4) },
    { id: rid(), name: "Read finance article", icon: "📚", streak: 9, longest_streak: 9, completed_dates: dates(9) },
  ];
};

export const buildMockSnapshots = (): NetWorthSnapshot[] => {
  const snaps: NetWorthSnapshot[] = [];
  let value = 28000;
  for (let i = 365; i >= 0; i -= 7) {
    value += rand(80, 1100);
    if (Math.random() < 0.1) value -= rand(200, 800);
    snaps.push({ amount: Math.round(value), date: isoOffset(i) });
  }
  return snaps;
};
