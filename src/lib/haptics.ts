// Lightweight haptic helper. Vibrate on supporting browsers (mostly mobile).
type Pattern = "tap" | "success" | "warn" | "error";

const PATTERNS: Record<Pattern, number | number[]> = {
  tap: 10,
  success: [10, 40, 10],
  warn: [20, 30, 20],
  error: [40, 60, 40],
};

export const haptic = (p: Pattern = "tap") => {
  if (typeof window === "undefined") return;
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(PATTERNS[p]);
    } catch {
      // ignore
    }
  }
};
