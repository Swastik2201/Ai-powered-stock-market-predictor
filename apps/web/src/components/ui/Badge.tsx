import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "profit" | "loss" | "ai" | "gold" | "outline";
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "default",
  size = "md",
  children,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center font-medium rounded-full transition-colors border";

  const variantStyles: Record<NonNullable<BadgeProps["variant"]>, string> = {
    default: "bg-surface text-slate-300 border-border",
    profit: "bg-profit/15 text-profit border-profit/30",
    loss: "bg-loss/15 text-loss border-loss/30",
    ai: "bg-aiAccent/20 text-purple-300 border-aiAccent/40 glow-ai",
    gold: "bg-gold/15 text-gold border-gold/30",
    outline: "bg-transparent text-slate-400 border-border",
  };

  const sizeStyles: Record<NonNullable<BadgeProps["size"]>, string> = {
    sm: "px-2 py-0.5 text-[10px] gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
  };

  return (
    <div
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      {...props}
    >
      {children}
    </div>
  );
};
