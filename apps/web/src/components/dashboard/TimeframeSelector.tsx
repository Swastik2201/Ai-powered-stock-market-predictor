import React from 'react';
import { TimeframeOption } from '@/hooks/useChartData';
import { cn } from '@/lib/utils';

interface TimeframeSelectorProps {
  activeTimeframe: TimeframeOption;
  onSelectTimeframe: (tf: TimeframeOption) => void;
  className?: string;
}

const TIMEFRAMES: TimeframeOption[] = ['1D', '1W', '1M', '3M', '6M', '1Y', '5Y'];

export const TimeframeSelector: React.FC<TimeframeSelectorProps> = ({
  activeTimeframe,
  onSelectTimeframe,
  className,
}) => {
  return (
    <div className={cn("inline-flex items-center gap-1.5 p-1 bg-background/80 border border-border rounded-xl shadow-inner", className)}>
      {TIMEFRAMES.map((tf) => {
        const isActive = activeTimeframe === tf;
        return (
          <button
            key={tf}
            onClick={() => onSelectTimeframe(tf)}
            className={cn(
              "px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all duration-200 focus:outline-none",
              isActive
                ? "bg-surface border border-profit text-profit shadow-sm shadow-profit/20 scale-[1.02]"
                : "bg-transparent border border-transparent text-slate-400 hover:text-slate-200 hover:bg-surface/50"
            )}
          >
            {tf}
          </button>
        );
      })}
    </div>
  );
};
