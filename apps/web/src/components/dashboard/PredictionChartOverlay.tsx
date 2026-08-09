'use client';

import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { formatINR } from '@/lib/utils';

export interface ForecastCorridorPoint {
  date: string;
  yhat_lower: number;
  yhat: number;
  yhat_upper: number;
}

interface PredictionChartOverlayProps {
  symbol: string;
  forecastData: ForecastCorridorPoint[];
  currentPrice: number;
  height?: number;
}

export const PredictionChartOverlay: React.FC<PredictionChartOverlayProps> = ({
  symbol,
  forecastData,
  currentPrice,
  height = 360,
}) => {
  // Format chart data combining upper/lower bounds for area corridor
  const chartPoints = forecastData.map((pt) => ({
    date: pt.date.slice(5), // "MM-DD"
    fullDate: pt.date,
    forecast: pt.yhat,
    corridorRange: [pt.yhat_lower, pt.yhat_upper], // Area range [lower, upper]
    yhat_lower: pt.yhat_lower,
    yhat_upper: pt.yhat_upper,
  }));

  return (
    <div className="w-full h-full p-4 rounded-xl bg-surface/80 border border-border shadow-lg space-y-4">
      <div className="flex justify-between items-center text-xs border-b border-border/50 pb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-slate-100 text-sm">{symbol}</span>
          <span className="px-2 py-0.5 rounded bg-aiAccent/15 border border-aiAccent/30 text-aiAccent font-semibold">
            30-Day Prophet Forecast
          </span>
        </div>
        <span className="font-mono text-slate-400">
          Base Price: <strong className="text-slate-100">₹{currentPrice.toFixed(2)}</strong>
        </span>
      </div>

      <div className="w-full" style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartPoints} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="corridorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8A2BE2" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8A2BE2" stopOpacity={0.05} />
              </linearGradient>
            </defs>

            <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
            <YAxis
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              domain={['auto', 'auto']}
              tickFormatter={(val) => `₹${val}`}
            />
            <Tooltip content={<CustomForecastTooltip />} />
            <Legend
              verticalAlign="top"
              height={36}
              formatter={(value) => (
                <span className="text-xs font-semibold text-slate-300">{value}</span>
              )}
            />

            {/* Shaded Confidence Interval Corridor (#8A2BE2 opacity 15%) */}
            <Area
              type="monotone"
              dataKey="corridorRange"
              name="90% Prediction Corridor"
              stroke="#8A2BE2"
              strokeDasharray="2 2"
              fill="url(#corridorGradient)"
            />

            {/* Dashed Midpoint Forecast Line (yhat) */}
            <Line
              type="monotone"
              dataKey="forecast"
              name="Prophet Midpoint (yhat)"
              stroke="#00E676"
              strokeWidth={2.5}
              strokeDasharray="5 5"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const CustomForecastTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-3 bg-surface/95 border border-border rounded-lg shadow-2xl backdrop-blur-md text-xs space-y-1.5 font-mono">
        <p className="font-bold text-slate-200 font-sans border-b border-border/60 pb-1">{data.fullDate}</p>
        <div className="flex justify-between items-center gap-4 text-profit">
          <span>Expected (yhat):</span>
          <span className="font-bold">₹{data.forecast.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center gap-4 text-purple-400">
          <span>Upper Bound (90%):</span>
          <span className="font-bold">₹{data.yhat_upper.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center gap-4 text-sky-400">
          <span>Lower Bound (10%):</span>
          <span className="font-bold">₹{data.yhat_lower.toFixed(2)}</span>
        </div>
      </div>
    );
  }
  return null;
};
