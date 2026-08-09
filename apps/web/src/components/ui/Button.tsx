import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "profit" | "loss" | "ai" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed rounded-lg active:scale-[0.98]";

    const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
      primary:
        "bg-slate-100 text-slate-900 hover:bg-white focus:ring-slate-400 shadow-sm",
      secondary:
        "bg-surface border border-border text-slate-100 hover:bg-slate-800 focus:ring-border",
      profit:
        "bg-profit text-slate-950 font-bold hover:bg-[#00c865] focus:ring-profit shadow-sm shadow-profit/20",
      loss:
        "bg-loss text-white font-bold hover:bg-[#e04343] focus:ring-loss shadow-sm shadow-loss/20",
      ai:
        "bg-gradient-to-r from-aiAccent to-purple-600 text-white hover:opacity-90 focus:ring-aiAccent glow-ai",
      outline:
        "border border-border bg-transparent text-slate-200 hover:bg-surface focus:ring-border",
      ghost:
        "bg-transparent text-slate-400 hover:text-slate-100 hover:bg-surface focus:ring-border",
    };

    const sizeStyles: Record<NonNullable<ButtonProps["size"]>, string> = {
      sm: "px-3 py-1.5 text-xs gap-1.5",
      md: "px-4 py-2 text-sm gap-2",
      lg: "px-6 py-3 text-base gap-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
        {!isLoading && leftIcon && <span className="inline-flex">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="inline-flex">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
