'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ShieldCheck, AlertTriangle, TrendingUp, Info, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RiskMeterProps {
  score: number; // 0 to 100
  sentimentLabel: string;
  riskLevel: string;
  className?: string;
}

export const RiskMeter: React.FC<RiskMeterProps> = ({
  score,
  sentimentLabel,
  riskLevel,
  className,
}) => {
  // Clamped score between 0 and 100
  const clampedScore = Math.min(100, Math.max(0, score));

  // Determine dynamic color styling
  let meterColor = 'bg-profit';
  let textColor = 'text-profit';
  let badgeVariant: 'profit' | 'gold' | 'loss' = 'profit';

  if (clampedScore <= 35) {
    meterColor = 'bg-loss';
    textColor = 'text-loss';
    badgeVariant = 'loss';
  } else if (clampedScore <= 65) {
    meterColor = 'bg-gold';
    textColor = 'text-gold';
    badgeVariant = 'gold';
  }

  return (
    <Card className={cn("w-full space-y-6", className)}>
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="w-5 h-5 text-aiAccent" />
              AI Risk & Sentiment Meter
            </CardTitle>
            <CardDescription>
              VADER NLP News sentiment analysis & volatility scoring.
            </CardDescription>
          </div>

          <Badge variant={badgeVariant}>
            {sentimentLabel} ({clampedScore.toFixed(1)}/100)
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Dynamic Gauge Meter Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-400">Market Volatility Index</span>
            <span className={cn("font-extrabold text-sm", textColor)}>
              {riskLevel} ({clampedScore}%)
            </span>
          </div>

          {/* Progress Bar Container */}
          <div className="relative w-full h-3 bg-background rounded-full overflow-hidden border border-border">
            <div
              className={cn("h-full transition-all duration-700 rounded-full", meterColor)}
              style={{ width: `${clampedScore}%` }}
            />
          </div>

          {/* Scale Axis Labels */}
          <div className="flex justify-between text-[10px] font-mono text-slate-500 pt-1">
            <span className="text-loss">0 (High Volatility)</span>
            <span className="text-gold">50 (Neutral)</span>
            <span className="text-profit">100 (Bullish Momentum)</span>
          </div>
        </div>

        {/* Sentiment Summary Box */}
        <div className="p-4 rounded-xl bg-surface/80 border border-border flex items-center gap-3">
          <div className={cn("p-2 rounded-lg bg-background border border-border", textColor)}>
            {clampedScore >= 66 ? (
              <TrendingUp className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
          </div>
          <div className="text-xs space-y-0.5">
            <p className="font-semibold text-slate-200">
              Sentiment Classification: <span className={textColor}>{sentimentLabel}</span>
            </p>
            <p className="text-slate-400">
              News headlines reflect positive momentum with low downside tail-risk.
            </p>
          </div>
        </div>

        {/* Mandatory Regulatory Disclaimer Banner */}
        <div className="p-3 rounded-lg bg-background/80 border border-border/60 text-[11px] text-slate-400 flex items-start gap-2">
          <Info className="w-4 h-4 text-aiAccent shrink-0 mt-0.5" />
          <p>
            <strong className="text-slate-300">Disclaimer:</strong> Educational probabilistic projection only. AI risk scores & Prophet time-series forecasts are not guaranteed and do not constitute financial investment advice.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
