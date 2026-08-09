import React from "react";
import { cn, formatCurrency } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { TrendingUp, TrendingDown } from "lucide-react";

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: number | string;
  changePct?: number;
  currency?: "INR" | "USD";
  icon?: React.ReactNode;
  variant?: "default" | "ai" | "profit" | "loss";
  subtitle?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  className,
  label,
  value,
  changePct,
  currency,
  icon,
  variant = "default",
  subtitle,
  ...props
}) => {
  const isPositive = (changePct ?? 0) > 0;
  const isNegative = (changePct ?? 0) < 0;

  const displayValue =
    typeof value === "number" && currency
      ? formatCurrency(value, currency)
      : value;

  return (
    <Card variant={variant} className={cn("space-y-3", className)} {...props}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {label}
        </span>
        {icon && (
          <div className="p-2 rounded-lg bg-surface border border-border text-slate-300">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <div className="text-2xl md:text-3xl font-extrabold text-slate-100 font-mono tracking-tight">
          {displayValue}
        </div>

        {changePct !== undefined && (
          <div
            className={cn(
              "inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full border",
              isPositive
                ? "text-profit bg-profit/10 border-profit/20"
                : isNegative
                ? "text-loss bg-loss/10 border-loss/20"
                : "text-slate-400 bg-surface border-border"
            )}
          >
            {isPositive && <TrendingUp className="w-3 h-3 mr-1" />}
            {isNegative && <TrendingDown className="w-3 h-3 mr-1" />}
            {isPositive ? "+" : ""}
            {changePct.toFixed(2)}%
          </div>
        )}
      </div>

      {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
    </Card>
  );
};
