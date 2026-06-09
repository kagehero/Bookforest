import type { Money } from "@/types/book";

/** Formats Money for display. JPY has no minor unit; others get 2 decimals. */
export function formatPrice(money: Money): string {
  const zeroDecimal = money.currencyCode === "JPY" || money.currencyCode === "KRW";
  try {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: money.currencyCode,
      minimumFractionDigits: zeroDecimal ? 0 : 2,
    }).format(money.amount);
  } catch {
    return `¥${money.amount.toLocaleString("ja-JP")}`;
  }
}

/** "188mm × 128mm" style trim-size string for the detail panel. */
export function formatDimensions(d: {
  heightMm: number;
  widthMm: number;
}): string {
  return `四六判相当 ・ ${d.heightMm} × ${d.widthMm} mm`;
}
