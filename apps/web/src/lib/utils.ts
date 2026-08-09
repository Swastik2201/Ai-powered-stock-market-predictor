import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines conditional class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats a numeric value into INR currency string (₹)
 */
export function formatINR(
  amount: number,
  options: Partial<Intl.NumberFormatOptions> = {}
): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
    ...options,
  }).format(amount);
}

/**
 * Formats a numeric value into USD currency string ($)
 */
export function formatUSD(
  amount: number,
  options: Partial<Intl.NumberFormatOptions> = {}
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
    ...options,
  }).format(amount);
}

/**
 * Flexible currency formatter supporting INR and USD
 */
export function formatCurrency(
  amount: number,
  currency: "INR" | "USD" = "USD",
  options: Partial<Intl.NumberFormatOptions> = {}
): string {
  if (currency === "INR") {
    return formatINR(amount, options);
  }
  return formatUSD(amount, options);
}
