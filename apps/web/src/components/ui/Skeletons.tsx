import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, style }) => (
  <div style={style} className={cn("animate-pulse rounded-xl bg-slate-800/60 border border-border/40", className)} />
);

export const StockCardSkeleton: React.FC = () => (
  <div className="p-5 rounded-2xl bg-surface border border-border space-y-4 animate-pulse">
    <div className="flex justify-between items-start">
      <div className="space-y-2">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-3 w-36" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>

    <div className="flex justify-between items-end pt-2">
      <Skeleton className="h-8 w-28" />
      <Skeleton className="h-6 w-16" />
    </div>
  </div>
);

export const ChartSkeleton: React.FC<{ height?: number }> = ({ height = 400 }) => (
  <div
    style={{ height }}
    className="w-full p-6 rounded-2xl bg-surface border border-border space-y-4 animate-pulse flex flex-col justify-between"
  >
    <div className="flex justify-between items-center">
      <Skeleton className="h-6 w-48" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-12 rounded-lg" />
        <Skeleton className="h-8 w-12 rounded-lg" />
        <Skeleton className="h-8 w-12 rounded-lg" />
      </div>
    </div>

    <div className="w-full flex-1 bg-background/40 rounded-xl border border-border/40 relative overflow-hidden flex items-end p-4 gap-2">
      {Array.from({ length: 24 }).map((_, i) => (
        <Skeleton
          key={i}
          className="flex-1 rounded-t-sm"
          style={{ height: `${20 + ((i * 37) % 70)}%` }}
        />
      ))}
    </div>
  </div>
);

export const LeaderboardSkeleton: React.FC = () => (
  <div className="p-6 rounded-2xl bg-surface border border-border space-y-4 animate-pulse">
    <div className="flex justify-between items-center border-b border-border/50 pb-4">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-6 w-24 rounded-full" />
    </div>

    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex justify-between items-center py-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  </div>
);

export const RiskRadarSkeleton: React.FC = () => (
  <div className="p-6 rounded-2xl bg-surface border border-border space-y-6 animate-pulse">
    <div className="flex justify-between items-center">
      <Skeleton className="h-6 w-56" />
      <Skeleton className="h-6 w-32 rounded-full" />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
      <div className="h-64 rounded-full border border-border/40 flex items-center justify-center">
        <Skeleton className="h-48 w-48 rounded-full" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-xl" />
        ))}
      </div>
    </div>
  </div>
);
