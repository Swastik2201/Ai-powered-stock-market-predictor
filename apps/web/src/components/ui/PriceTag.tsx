import React from "react";
import { cn, formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export interface PriceTagProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  change?: number;
  changePct?: number;
  currency?: "INR" | "USD";
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
}

export const PriceTag: React.FC<PriceTagProps> = ({
  className,
  value,
  change,
  changePct,
  currency = "USD",
  showIcon = true,
  size = "md",
  ...props
}) => {
  const isPositive = (change ?? changePct ?? 0) > 0;
  const isNegative = (change ?? changePct ?? 0) < 0;

  const colorClass = isPositive
    ? "text-profit"
    : isNegative
    ? "text-loss"
    : "text-slate-300";

  const sizeClasses = {
    sm: "text-xs font-semibold gap-1",
    md: "text-base font-bold gap-1.5",
    lg: "text-2xl font-extrabold gap-2",
  };

  const formattedPrice = formatCurrency(value, currency);

  return (
    <div
      className={cn("inline-flex items-center font-mono tracking-tight", sizeClasses[size], className)}
      {...props}
    >
      <span className="text-slate-100">{formattedPrice}</span>

      {(change !== undefined || changePct !== undefined) && (
        <span className={cn("inline-flex items-center font-sans font-medium text-xs ml-1.5", colorClass)}>
          {showIcon && (
            <>
              {isPositive && <TrendingUp className="w-3.5 h-3.5 mr-0.5" />}
              {isNegative && <TrendingDown className="w-3.5 h-3.5 mr-0.5" />}
              {!isPositive && !isNegative && <Minus className="w-3.5 h-3.5 mr-0.5" />}
            </>
          )}
          {isPositive ? "+" : ""}
          {changePct !== undefined ? `${changePct.toFixed(2)}%` : change?.toFixed(2)}
        </span>
      )}
    </div>
  );
};
