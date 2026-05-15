export const daysBetween = (a: Date | string, b: Date | string) => {
  const d1 = typeof a === "string" ? new Date(a) : a;
  const d2 = typeof b === "string" ? new Date(b) : b;
  return Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
};

export const formatRelativeDate = (d: Date | string) => {
  const date = typeof d === "string" ? new Date(d) : d;
  const today = new Date();
  const diff = daysBetween(date, today);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export const formatShortDate = (d: Date | string) => {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const monthKey = (d: Date) =>
  `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
