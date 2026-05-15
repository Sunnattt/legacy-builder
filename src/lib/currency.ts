const SYMBOLS: Record<string, string> = {
  USD: "$", EUR: "€", GBP: "£", CAD: "C$", JPY: "¥", AED: "AED", INR: "₹",
};

export const currencySymbol = (code = "USD") => SYMBOLS[code] ?? "$";

export const formatCurrency = (
  amount: number,
  currency = "USD",
  opts: { compact?: boolean; showSign?: boolean; decimals?: number } = {}
) => {
  const { compact = false, showSign = false, decimals } = opts;
  const sign = showSign && amount > 0 ? "+" : "";
  const abs = Math.abs(amount);
  const sym = currencySymbol(currency);
  if (compact) {
    if (abs >= 1_000_000) return `${sign}${amount < 0 ? "-" : ""}${sym}${(abs / 1_000_000).toFixed(2)}M`;
    if (abs >= 1_000) return `${sign}${amount < 0 ? "-" : ""}${sym}${(abs / 1_000).toFixed(1)}K`;
  }
  const opt: Intl.NumberFormatOptions = {
    minimumFractionDigits: decimals ?? (abs % 1 === 0 ? 0 : 2),
    maximumFractionDigits: decimals ?? 2,
  };
  return `${sign}${amount < 0 ? "-" : ""}${sym}${abs.toLocaleString("en-US", opt)}`;
};

export const parseCurrencyInput = (raw: string): number => {
  const cleaned = raw.replace(/[^0-9.]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};
