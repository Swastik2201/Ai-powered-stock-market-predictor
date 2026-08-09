'use client';

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ShieldCheck, Activity, Award, BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RiskMetricDetail {
  score: number;
  raw_value: string;
  benchmark: string;
}

export interface RiskRadarData {
  symbol: string;
  overall_score: number;
  risk_classification: string;
  metrics: {
    valuation: RiskMetricDetail;
    growth: RiskMetricDetail;
    financial_health: RiskMetricDetail;
    momentum: RiskMetricDetail;
    volatility: RiskMetricDetail;
  };
}

interface RiskRadarChartProps {
  symbol: string;
  className?: string;
}

export const RiskRadarChart: React.FC<RiskRadarChartProps> = ({ symbol, className }) => {
  const [data, setData] = useState<RiskRadarData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRadar = async () => {
      setIsLoading(true);
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
      try {
        const response = await fetch(`${apiBaseUrl}/market/risk-radar/${encodeURIComponent(symbol)}`);
        if (response.ok) {
          const json = await response.json();
          setData(json);
        } else {
          setData(getMockRadar(symbol));
        }
      } catch (err) {
        setData(getMockRadar(symbol));
      } finally {
        setIsLoading(false);
      }
    };

    fetchRadar();
  }, [symbol]);

  // Construct Recharts Radar dataset
  const chartData = data
    ? [
        { axis: 'Valuation', score: data.metrics.valuation.score, fullMark: 100, raw: data.metrics.valuation.raw_value },
        { axis: 'Growth', score: data.metrics.growth.score, fullMark: 100, raw: data.metrics.growth.raw_value },
        { axis: 'Fin. Health', score: data.metrics.financial_health.score, fullMark: 100, raw: data.metrics.financial_health.raw_value },
        { axis: 'Momentum', score: data.metrics.momentum.score, fullMark: 100, raw: data.metrics.momentum.raw_value },
        { axis: 'Volatility', score: data.metrics.volatility.score, fullMark: 100, raw: data.metrics.volatility.raw_value },
      ]
    : [];

  return (
    <Card className={cn("w-full space-y-6 bg-surface border border-border shadow-xl", className)}>
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg text-slate-100">
              <BarChart2 className="w-5 h-5 text-profit" />
              5-Axis Quantitative Risk Radar
            </CardTitle>
            <CardDescription>
              Normalized 0–100 scale evaluating Valuation, Growth, Health, Momentum & Volatility.
            </CardDescription>
          </div>

          {data && (
            <Badge variant={data.overall_score >= 70 ? "profit" : data.overall_score >= 50 ? "gold" : "loss"}>
              <Award className="w-3.5 h-3.5" />
              {data.risk_classification} ({data.overall_score}/100)
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Recharts SVG Radar Chart Container */}
          <div className="lg:col-span-2 h-72 w-full p-2 bg-background/50 rounded-xl border border-border/50">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                <PolarGrid stroke="#21262D" strokeDasharray="3 3" />
                <PolarAngleAxis dataKey="axis" stroke="#94A3B8" fontSize={11} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={9} />

                <Radar
                  name={symbol}
                  dataKey="score"
                  stroke="#00E676"
                  strokeWidth={2}
                  fill="#00E676"
                  fillOpacity={0.3}
                />
                <Tooltip content={<CustomRadarTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Raw Metrics Parameter Pills */}
          {data && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-border/50 pb-1.5 font-mono">
                Raw Metrics Breakdown
              </h4>

              <div className="p-2.5 rounded-lg bg-background/60 border border-border/60 flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Valuation P/E</span>
                <span className="font-bold text-profit">{data.metrics.valuation.raw_value}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-background/60 border border-border/60 flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">3Y CAGR</span>
                <span className="font-bold text-profit">{data.metrics.growth.raw_value}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-background/60 border border-border/60 flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Debt-to-Equity</span>
                <span className="font-bold text-profit">{data.metrics.financial_health.raw_value}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-background/60 border border-border/60 flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">14-Period RSI</span>
                <span className="font-bold text-profit">{data.metrics.momentum.raw_value}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-background/60 border border-border/60 flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Beta Coeff</span>
                <span className="font-bold text-profit">{data.metrics.volatility.raw_value}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const CustomRadarTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="p-3 bg-surface/95 border border-border rounded-lg shadow-2xl backdrop-blur-md text-xs space-y-1 font-mono">
        <p className="font-bold text-slate-200 font-sans border-b border-border/60 pb-1">{item.axis}</p>
        <p className="text-profit">Normalized Score: <strong>{item.score}/100</strong></p>
        <p className="text-slate-400">Raw Metric: {item.raw}</p>
      </div>
    );
  }
  return null;
};

function getMockRadar(symbol: string): RiskRadarData {
  return {
    symbol: symbol.toUpperCase(),
    overall_score: 78.4,
    risk_classification: "Low-to-Moderate Risk",
    metrics: {
      valuation: { score: 65.0, raw_value: "24.2 P/E", benchmark: "28.5 Ind P/E" },
      growth: { score: 82.0, raw_value: "18.5% CAGR", benchmark: "12.0% Avg" },
      financial_health: { score: 88.0, raw_value: "0.35 D/E", benchmark: "< 1.0 Safe" },
      momentum: { score: 72.0, raw_value: "58.4 RSI", benchmark: "Neutral" },
      volatility: { score: 85.0, raw_value: "0.88 Beta", benchmark: "Low Volatility" },
    },
  };
}
