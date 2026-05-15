// Comprehensive currency map. Symbol + name + decimal places.
export interface CurrencyMeta {
  code: string;
  symbol: string;
  name: string;
  decimals: number; // typical fraction digits
}

export const CURRENCIES: CurrencyMeta[] = [
  { code: "USD", symbol: "$",   name: "US Dollar",         decimals: 2 },
  { code: "EUR", symbol: "€",   name: "Euro",              decimals: 2 },
  { code: "GBP", symbol: "£",   name: "British Pound",     decimals: 2 },
  { code: "JPY", symbol: "¥",   name: "Japanese Yen",      decimals: 0 },
  { code: "CNY", symbol: "¥",   name: "Chinese Yuan",      decimals: 2 },
  { code: "CHF", symbol: "Fr",  name: "Swiss Franc",       decimals: 2 },
  { code: "CAD", symbol: "C$",  name: "Canadian Dollar",   decimals: 2 },
  { code: "AUD", symbol: "A$",  name: "Australian Dollar", decimals: 2 },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar",decimals: 2 },
  { code: "SGD", symbol: "S$",  name: "Singapore Dollar",  decimals: 2 },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar",  decimals: 2 },
  { code: "INR", symbol: "₹",   name: "Indian Rupee",      decimals: 2 },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham",        decimals: 2 },
  { code: "SAR", symbol: "﷼",   name: "Saudi Riyal",       decimals: 2 },
  { code: "QAR", symbol: "ر.ق", name: "Qatari Riyal",      decimals: 2 },
  { code: "KWD", symbol: "د.ك", name: "Kuwaiti Dinar",     decimals: 3 },
  { code: "TRY", symbol: "₺",   name: "Turkish Lira",      decimals: 2 },
  { code: "RUB", symbol: "₽",   name: "Russian Ruble",     decimals: 2 },
  { code: "UAH", symbol: "₴",   name: "Ukrainian Hryvnia", decimals: 2 },
  { code: "PLN", symbol: "zł",  name: "Polish Zloty",      decimals: 2 },
  { code: "CZK", symbol: "Kč",  name: "Czech Koruna",      decimals: 2 },
  { code: "SEK", symbol: "kr",  name: "Swedish Krona",     decimals: 2 },
  { code: "NOK", symbol: "kr",  name: "Norwegian Krone",   decimals: 2 },
  { code: "DKK", symbol: "kr",  name: "Danish Krone",      decimals: 2 },
  { code: "ILS", symbol: "₪",   name: "Israeli Shekel",    decimals: 2 },
  { code: "ZAR", symbol: "R",   name: "South African Rand",decimals: 2 },
  { code: "BRL", symbol: "R$",  name: "Brazilian Real",    decimals: 2 },
  { code: "MXN", symbol: "Mex$",name: "Mexican Peso",      decimals: 2 },
  { code: "ARS", symbol: "$",   name: "Argentine Peso",    decimals: 2 },
  { code: "CLP", symbol: "$",   name: "Chilean Peso",      decimals: 0 },
  { code: "KRW", symbol: "₩",   name: "South Korean Won",  decimals: 0 },
  { code: "THB", symbol: "฿",   name: "Thai Baht",         decimals: 2 },
  { code: "IDR", symbol: "Rp",  name: "Indonesian Rupiah", decimals: 0 },
  { code: "MYR", symbol: "RM",  name: "Malaysian Ringgit", decimals: 2 },
  { code: "PHP", symbol: "₱",   name: "Philippine Peso",   decimals: 2 },
  { code: "VND", symbol: "₫",   name: "Vietnamese Dong",   decimals: 0 },
  { code: "PKR", symbol: "₨",   name: "Pakistani Rupee",   decimals: 2 },
  { code: "BDT", symbol: "৳",   name: "Bangladeshi Taka",  decimals: 2 },
  { code: "EGP", symbol: "£",   name: "Egyptian Pound",    decimals: 2 },
  { code: "NGN", symbol: "₦",   name: "Nigerian Naira",    decimals: 2 },
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling",   decimals: 2 },
  { code: "UZS", symbol: "soʻm",name: "Uzbekistani Som",   decimals: 0 },
  { code: "KZT", symbol: "₸",   name: "Kazakhstani Tenge", decimals: 2 },
];

const META = new Map(CURRENCIES.map((c) => [c.code, c]));

export const currencyMeta = (code = "USD"): CurrencyMeta =>
  META.get(code) ?? META.get("USD")!;

export const currencySymbol = (code = "USD") => currencyMeta(code).symbol;

/**
 * Static FX rates relative to USD (1 USD = X units).
 * Approximate values — used for offline display conversion. All amounts are
 * stored in the app's base currency (USD); display converts on the fly.
 */
export const FX_RATES: Record<string, number> = {
  USD: 1, EUR: 0.92, GBP: 0.78, JPY: 156, CNY: 7.2, CHF: 0.88,
  CAD: 1.36, AUD: 1.51, NZD: 1.65, SGD: 1.34, HKD: 7.81,
  INR: 83.4, AED: 3.67, SAR: 3.75, QAR: 3.64, KWD: 0.31,
  TRY: 32.5, RUB: 92, UAH: 39.5, PLN: 3.95, CZK: 23.1,
  SEK: 10.6, NOK: 10.7, DKK: 6.86, ILS: 3.7, ZAR: 18.5,
  BRL: 5.1, MXN: 17, ARS: 880, CLP: 920, KRW: 1370,
  THB: 36.5, IDR: 16100, MYR: 4.7, PHP: 57.5, VND: 25400,
  PKR: 278, BDT: 117, EGP: 47.5, NGN: 1450, KES: 130,
  UZS: 12700, KZT: 445,
};

export const BASE_CURRENCY = "USD";

/** Convert an amount stored in BASE_CURRENCY (USD) into `toCurrency`. */
export const convertFromBase = (amount: number, toCurrency = "USD"): number => {
  const rate = FX_RATES[toCurrency] ?? 1;
  return amount * rate;
};

/** Convert a user-entered amount in `fromCurrency` back to BASE_CURRENCY (USD). */
export const convertToBase = (amount: number, fromCurrency = "USD"): number => {
  const rate = FX_RATES[fromCurrency] ?? 1;
  return amount / rate;
};

export const formatCurrency = (
  amount: number,
  currency = "USD",
  opts: { compact?: boolean; showSign?: boolean; decimals?: number; convert?: boolean } = {}
) => {
  const meta = currencyMeta(currency);
  const { compact = false, showSign = false, decimals, convert = true } = opts;
  // Stored values are USD-based; convert to target for display unless caller opts out.
  const value = convert ? convertFromBase(amount, currency) : amount;
  const sign = showSign && value > 0 ? "+" : "";
  const abs = Math.abs(value);
  const sym = meta.symbol;
  if (compact) {
    if (abs >= 1_000_000) return `${sign}${value < 0 ? "-" : ""}${sym}${(abs / 1_000_000).toFixed(2)}M`;
    if (abs >= 1_000) return `${sign}${value < 0 ? "-" : ""}${sym}${(abs / 1_000).toFixed(1)}K`;
  }
  const fd = decimals ?? (abs % 1 === 0 ? 0 : meta.decimals);
  const opt: Intl.NumberFormatOptions = {
    minimumFractionDigits: fd,
    maximumFractionDigits: decimals ?? meta.decimals,
  };
  return `${sign}${value < 0 ? "-" : ""}${sym}${abs.toLocaleString("en-US", opt)}`;
};

export const parseCurrencyInput = (raw: string): number => {
  const cleaned = raw.replace(/[^0-9.]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};
