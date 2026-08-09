'use client';

import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { calculateSIP, BANK_FD_EXPECTED_RATE } from '@/lib/calculators/sipCalculator';
import { formatINR } from '@/lib/utils';
import { Calculator, TrendingUp, Sparkles, ShieldCheck, DollarSign, Layers } from 'lucide-react';

interface AssetPreset {
  id: string;
  name: string;
  rate: number;
  description: string;
}

const PRESETS: AssetPreset[] = [
  { id: 'nifty', name: 'Nifty 50 Index ETF', rate: 12.5, description: '12.5% p.a. benchmark index growth' },
  { id: 'flexi', name: 'Flexi-Cap Mutual Fund', rate: 15.0, description: '15.0% p.a. active equity compounding' },
  { id: 'gold', name: 'Digital Gold / Commodity', rate: 9.5, description: '9.5% p.a. precious metal inflation hedge' },
  { id: 'custom', name: 'Custom Rate', rate: 14.0, description: 'User-defined expected return percentage' },
];

export const HistoricalSimulator: React.FC = () => {
  const [monthlyBudget, setMonthlyBudget] = useState<number>(1000);
  const [years, setYears] = useState<number>(3);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('nifty');
  const [customRate, setCustomRate] = useState<number>(14.0);

  // Active expected annual return rate %
  const activeRate = useMemo(() => {
    if (selectedPresetId === 'custom') return customRate;
    const preset = PRESETS.find((p) => p.id === selectedPresetId);
    return preset ? preset.rate : 12.5;
  }, [selectedPresetId, customRate]);

  // Execute mathematical SIP calculation
  const calcResult = useMemo(() => {
    return calculateSIP(monthlyBudget, years, activeRate);
  }, [monthlyBudget, years, activeRate]);

  return (
    <Card className="w-full space-y-6">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-xl text-slate-100">
              <Calculator className="w-5 h-5 text-profit" />
              "What-If" Historical Compounding Visualizer
            </CardTitle>
            <CardDescription>
              Simulate Systematic Investment Plan (SIP) returns vs Standard Bank Fixed Deposit (FD) yield.
            </CardDescription>
          </div>
          <Badge variant="ai">
            <Sparkles className="w-3.5 h-3.5" />
            Compound Interest Engine
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Main Grid: Control Panel & Stacked Area Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Control Panel (Left Column) */}
          <div className="space-y-6 bg-surface/80 p-6 rounded-xl border border-border shadow-md">
            {/* 1. Monthly Budget Input */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm font-semibold">
                <label className="text-slate-300">Monthly Budget (P)</label>
                <span className="font-mono text-profit font-bold text-base">{formatINR(monthlyBudget)}</span>
              </div>
              <input
                type="range"
                min={500}
                max={100000}
                step={500}
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(Number(e.target.value))}
                className="w-full h-2 bg-background rounded-lg appearance-none cursor-pointer accent-profit"
              />
              <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                <span>₹500</span>
                <span>₹50,000</span>
                <span>₹1,00,000</span>
              </div>
            </div>

            {/* 2. Horizon Duration Toggles */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm font-semibold">
                <label className="text-slate-300">Investment Horizon (n)</label>
                <span className="font-mono text-slate-200 font-bold">{years} {years === 1 ? 'Year' : 'Years'}</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[1, 3, 5, 10].map((y) => (
                  <button
                    key={y}
                    onClick={() => setYears(y)}
                    className={`py-2 text-xs font-mono font-bold rounded-lg border transition-all ${
                      years === y
                        ? 'bg-surface border-profit text-profit shadow-sm'
                        : 'bg-background/60 border-border text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {y} {y === 1 ? 'Yr' : 'Yrs'}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Target Asset Presets */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-300 block">Target Asset Class</label>
              <div className="space-y-2">
                {PRESETS.map((p) => {
                  const isSelected = selectedPresetId === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPresetId(p.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-profit/10 border-profit text-slate-100'
                          : 'bg-background/40 border-border/70 text-slate-400 hover:bg-background/80'
                      }`}
                    >
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span>{p.name}</span>
                        <span className="font-mono text-profit">{p.rate}% p.a.</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{p.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. Custom Return Slider (Visible when custom selected) */}
            {selectedPresetId === 'custom' && (
              <div className="space-y-2 pt-2 border-t border-border/60">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">Expected Annual Rate</span>
                  <span className="font-mono text-profit font-bold">{customRate.toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min={4.0}
                  max={30.0}
                  step={0.5}
                  value={customRate}
                  onChange={(e) => setCustomRate(Number(e.target.value))}
                  className="w-full h-2 bg-background rounded-lg appearance-none cursor-pointer accent-profit"
                />
              </div>
            )}
          </div>

          {/* Stacked Area Chart (Right 2 Columns) */}
          <div className="lg:col-span-2 space-y-6">
            {/* KPI Summary Banner Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-surface border border-border space-y-1">
                <span className="text-xs text-slate-400 block">Total Capital Invested</span>
                <span className="font-mono text-xl font-extrabold text-slate-200">
                  {formatINR(calcResult.totalInvested)}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-surface border border-border space-y-1">
                <span className="text-xs text-slate-400 block">Expected Portfolio Value</span>
                <span className="font-mono text-2xl font-extrabold text-profit">
                  {formatINR(calcResult.finalSipValue)}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-surface border border-border space-y-1">
                <span className="text-xs text-slate-400 block">Total Wealth Generated</span>
                <span className="font-mono text-xl font-extrabold text-emerald-400">
                  +{formatINR(calcResult.totalWealthGained)}
                </span>
              </div>
            </div>

            {/* Bank FD Outperformance Callout */}
            <div className="p-4 rounded-xl bg-profit/10 border border-profit/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-profit/20 text-profit">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-100">Bank FD Outperformance Advantage</h4>
                  <p className="text-xs text-slate-400">
                    Calculated against standard Bank FD yield ({BANK_FD_EXPECTED_RATE}% p.a.)
                  </p>
                </div>
              </div>
              <div className="text-right font-mono">
                <span className="font-extrabold text-profit text-base block">
                  +{formatINR(calcResult.fdGainDifference)}
                </span>
                <span className="text-xs text-profit font-semibold">
                  (+{calcResult.fdGainDifferencePct}% vs Bank FD)
                </span>
              </div>
            </div>

            {/* Recharts Stacked Area Visualization Container */}
            <div className="p-4 rounded-xl bg-surface border border-border h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={calcResult.timeline}
                  margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#334155" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#334155" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="colorFD" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00F2FE" stopOpacity={0.7} />
                      <stop offset="95%" stopColor="#00F2FE" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="colorSIP" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00E676" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#00E676" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>

                  <XAxis
                    dataKey="yearLabel"
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    formatter={(value) => (
                      <span className="text-xs font-semibold text-slate-300">{value}</span>
                    )}
                  />

                  <Area
                    type="monotone"
                    dataKey="amountInvested"
                    name="Invested Capital"
                    stroke="#334155"
                    fillOpacity={1}
                    fill="url(#colorInvested)"
                  />
                  <Area
                    type="monotone"
                    dataKey="fdValue"
                    name="Bank FD Yield (6.8%)"
                    stroke="#00F2FE"
                    fillOpacity={1}
                    fill="url(#colorFD)"
                  />
                  <Area
                    type="monotone"
                    dataKey="sipValue"
                    name="SIP Asset Growth"
                    stroke="#00E676"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorSIP)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Custom Tooltip component formatting values in INR format
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-surface/95 border border-border rounded-lg shadow-2xl backdrop-blur-md text-xs space-y-1.5 font-mono">
        <p className="font-bold text-slate-200 font-sans border-b border-border/60 pb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex justify-between items-center gap-4">
            <span style={{ color: entry.color }}>{entry.name}:</span>
            <span className="font-bold text-slate-100">{formatINR(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};
