import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatMoney({ amount, currencyCode } = {}) {
  if (!amount) return "";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currencyCode || "USD" }).format(Number(amount));
}
