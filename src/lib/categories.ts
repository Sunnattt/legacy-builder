export type CategoryDef = { name: string; icon: string; color: string };

export const CATEGORIES: Record<string, CategoryDef[]> = {
  income: [
    { name: "Salary", icon: "💼", color: "#28C78A" },
    { name: "Freelance", icon: "🛠️", color: "#28C78A" },
    { name: "Dividends", icon: "📈", color: "#28C78A" },
    { name: "Bonus", icon: "🎁", color: "#28C78A" },
    { name: "Other", icon: "💰", color: "#28C78A" },
  ],
  expense: [
    { name: "Food", icon: "🍱", color: "#E04545" },
    { name: "Rent", icon: "🏠", color: "#E04545" },
    { name: "Transport", icon: "🚗", color: "#E04545" },
    { name: "Shopping", icon: "🛍️", color: "#E04545" },
    { name: "Subscriptions", icon: "🔁", color: "#E04545" },
    { name: "Health", icon: "🩺", color: "#E04545" },
    { name: "Travel", icon: "✈️", color: "#E04545" },
    { name: "Entertainment", icon: "🎬", color: "#E04545" },
    { name: "Other", icon: "📦", color: "#E04545" },
  ],
  saving: [
    { name: "Emergency Fund", icon: "🛡️", color: "#C9A84C" },
    { name: "Goal Bucket", icon: "🎯", color: "#C9A84C" },
    { name: "Cash", icon: "💵", color: "#C9A84C" },
    { name: "Other", icon: "🏦", color: "#C9A84C" },
  ],
  investment: [
    { name: "Stocks", icon: "📊", color: "#4A8FE8" },
    { name: "ETF", icon: "🧺", color: "#4A8FE8" },
    { name: "Crypto", icon: "🪙", color: "#4A8FE8" },
    { name: "Real Estate", icon: "🏘️", color: "#4A8FE8" },
    { name: "Bonds", icon: "📜", color: "#4A8FE8" },
    { name: "Other", icon: "💎", color: "#4A8FE8" },
  ],
};

export const findCategory = (type: string, name: string): CategoryDef => {
  const list = CATEGORIES[type as keyof typeof CATEGORIES] ?? [];
  return (
    list.find((c) => c.name.toLowerCase() === name.toLowerCase()) ?? {
      name,
      icon: "•",
      color: "#8A8A9A",
    }
  );
};
