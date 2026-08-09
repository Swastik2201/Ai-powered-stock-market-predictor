'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Cpu, ShieldCheck, Zap, DollarSign, CheckCircle2, ArrowRight, Wallet, PieChart } from 'lucide-react';
import { formatINR } from '@/lib/utils';

export type RiskAppetite = 'conservative' | 'moderate' | 'aggressive';

export interface AllocatedAssetItem {
  category: string;
  symbol: string;
  asset_name: string;
  weight_pct: number;
  target_amount: number;
  unit_price: number;
  units_to_buy: number;
  actual_amount: number;
}

export interface AllocationResponse {
  monthly_budget: number;
  risk_appetite: RiskAppetite;
  allocations: AllocatedAssetItem[];
  total_allocated: number;
  unallocated_cash: number;
  summary_notes: string;
}

export const BudgetAllocator: React.FC = () => {
  const [budget, setBudget] = useState<number>(1000);
  const [risk, setRisk] = useState<RiskAppetite>('moderate');
  const [allocationData, setAllocationData] = useState<AllocationResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExecuted, setIsExecuted] = useState<boolean>(false);

  const fetchAllocation = async (budgetVal: number, riskVal: RiskAppetite) => {
    setIsLoading(true);
    setIsExecuted(false);
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

    try {
      const response = await fetch(`${apiBaseUrl}/allocation/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monthly_budget: budgetVal, risk_appetite: riskVal }),
      });

      if (response.ok) {
        const data = await response.json();
        setAllocationData(data);
      } else {
        setAllocationData(getFallbackAllocation(budgetVal, riskVal));
      }
    } catch (err) {
      setAllocationData(getFallbackAllocation(budgetVal, riskVal));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllocation(budget, risk);
  }, [budget, risk]);

  const handleExecuteOrder = () => {
    setIsExecuted(true);
    setTimeout(() => setIsExecuted(false), 4000);
  };

  const riskOptions: { id: RiskAppetite; label: string; tagColor: string; description: string }[] = [
    { id: 'conservative', label: 'Conservative', tagColor: 'text-sky-400 border-sky-500/30 bg-sky-500/10', description: '60% Index, 30% Gold/Debt, 10% Flexi' },
    { id: 'moderate', label: 'Moderate', tagColor: 'text-profit border-profit/30 bg-profit/10', description: '40% Index, 30% Flexi, 20% Mid-Cap, 10% Gold' },
    { id: 'aggressive', label: 'Aggressive', tagColor: 'text-purple-400 border-purple-500/30 bg-purple-500/10', description: '40% Small-Cap, 30% Mid-Cap, 20% Flexi, 10% Growth' },
  ];

  return (
    <Card className="w-full space-y-6">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-xl text-aiAccent">
              <Cpu className="w-5 h-5 text-aiAccent animate-pulse" />
              AI Budget Asset Allocation & Fractional Engine
            </CardTitle>
            <CardDescription>
              Input your monthly budget and risk appetite to generate fractional unit orders.
            </CardDescription>
          </div>
          <Badge variant="ai">
            <PieChart className="w-3.5 h-3.5" />
            Fractional Purchasing Engine
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Controls Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 rounded-xl bg-surface/80 border border-border shadow-md">
          {/* Budget Slider */}
          <div className="space-y-3 lg:col-span-1">
            <div className="flex justify-between items-center text-sm font-semibold">
              <label className="text-slate-300">Monthly Budget (B)</label>
              <span className="font-mono text-profit font-extrabold text-base">{formatINR(budget)}</span>
            </div>
            <input
              type="range"
              min={500}
              max={100000}
              step={500}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full h-2 bg-background rounded-lg appearance-none cursor-pointer accent-profit"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>₹500</span>
              <span>₹50,000</span>
              <span>₹1,00,000</span>
            </div>
          </div>

          {/* Risk Profile Segmented Buttons */}
          <div className="space-y-3 lg:col-span-2">
            <label className="text-sm font-semibold text-slate-300 block">Risk Appetite Profile</label>
            <div className="grid grid-cols-3 gap-3">
              {riskOptions.map((opt) => {
                const isSelected = risk === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setRisk(opt.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? `${opt.tagColor} border-current shadow-sm scale-[1.02]`
                        : 'bg-background/40 border-border text-slate-400 hover:bg-background/80'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center justify-between">
                      <span>{opt.label}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{opt.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Allocation Visualizer & Results */}
        {allocationData && (
          <div className="space-y-6">
            {/* Visual Allocation Split Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-400">
                <span>Portfolio Weighting Breakdown</span>
                <span className="font-mono text-slate-200">Total Allocated: {formatINR(allocationData.total_allocated)}</span>
              </div>
              <div className="w-full h-3 bg-background rounded-full overflow-hidden flex gap-0.5 p-0.5 border border-border">
                {allocationData.allocations.map((item, idx) => (
                  <div
                    key={item.symbol}
                    style={{ width: `${item.weight_pct}%` }}
                    className={`h-full rounded-sm transition-all duration-500 ${
                      idx === 0 ? 'bg-profit' : idx === 1 ? 'bg-aiAccent' : idx === 2 ? 'bg-gold' : 'bg-sky-400'
                    }`}
                    title={`${item.category}: ${item.weight_pct}%`}
                  />
                ))}
              </div>
            </div>

            {/* Asset Allocation Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {allocationData.allocations.map((item, idx) => (
                <div
                  key={item.symbol}
                  className="p-4 rounded-xl bg-surface border border-border hover:border-slate-700 transition-all space-y-3 shadow-md"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-background border border-border text-slate-400 uppercase font-mono">
                        {item.category}
                      </span>
                      <h4 className="font-mono font-bold text-slate-100 mt-1 text-sm">{item.symbol}</h4>
                    </div>
                    <span className="font-mono text-xs font-extrabold text-profit bg-profit/10 px-2 py-0.5 rounded">
                      {item.weight_pct}%
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="text-slate-400 line-clamp-1">{item.asset_name}</p>
                    <div className="flex justify-between pt-2 border-t border-border/50 font-mono">
                      <span className="text-slate-500">Unit Price</span>
                      <span className="text-slate-200">₹{item.unit_price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-500">Target Cash</span>
                      <span className="text-slate-200">₹{item.target_amount.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Fractional Units Callout */}
                  <div className="p-2.5 rounded-lg bg-background border border-border flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Units to Buy</span>
                    <span className="font-extrabold text-profit text-sm">
                      {item.units_to_buy.toFixed(4)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Footer Bar */}
            <div className="p-4 rounded-xl bg-surface border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-400 space-y-0.5">
                <p className="font-semibold text-slate-200">{allocationData.summary_notes}</p>
                <p>Unallocated Residual Cash: <span className="font-mono text-gold">₹{allocationData.unallocated_cash.toFixed(2)}</span></p>
              </div>

              <Button
                variant="primary"
                leftIcon={<Wallet className="w-4 h-4" />}
                onClick={handleExecuteOrder}
                className={isExecuted ? "bg-emerald-600 hover:bg-emerald-700" : ""}
              >
                {isExecuted ? "Orders Executed in Paper Wallet!" : "Execute SIP in Paper Wallet"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

function getFallbackAllocation(budget: number, risk: RiskAppetite): AllocationResponse {
  const isCons = risk === 'conservative';
  const isMod = risk === 'moderate';

  const allocations: AllocatedAssetItem[] = isCons
    ? [
        { category: "Benchmark Index ETF", symbol: "NIFTYBEES", asset_name: "Nippon India ETF Nifty BeES", weight_pct: 60, target_amount: budget * 0.6, unit_price: 265.40, units_to_buy: Number(((budget * 0.6) / 265.40).toFixed(4)), actual_amount: budget * 0.6 },
        { category: "Digital Gold / Debt", symbol: "GOLDBEES", asset_name: "Nippon India ETF Gold BeES", weight_pct: 30, target_amount: budget * 0.3, unit_price: 64.20, units_to_buy: Number(((budget * 0.3) / 64.20).toFixed(4)), actual_amount: budget * 0.3 },
        { category: "Flexi-Cap Equity", symbol: "PPFCF", asset_name: "Parag Parikh Flexi Cap Fund", weight_pct: 10, target_amount: budget * 0.1, unit_price: 72.40, units_to_buy: Number(((budget * 0.1) / 72.40).toFixed(4)), actual_amount: budget * 0.1 },
      ]
    : isMod
    ? [
        { category: "Benchmark Index ETF", symbol: "NIFTYBEES", asset_name: "Nippon India ETF Nifty BeES", weight_pct: 40, target_amount: budget * 0.4, unit_price: 265.40, units_to_buy: Number(((budget * 0.4) / 265.40).toFixed(4)), actual_amount: budget * 0.4 },
        { category: "Flexi-Cap Equity", symbol: "PPFCF", asset_name: "Parag Parikh Flexi Cap Fund", weight_pct: 30, target_amount: budget * 0.3, unit_price: 72.40, units_to_buy: Number(((budget * 0.3) / 72.40).toFixed(4)), actual_amount: budget * 0.3 },
        { category: "Mid-Cap ETF", symbol: "MID150BEES", asset_name: "Nippon India ETF Nifty Midcap 150", weight_pct: 20, target_amount: budget * 0.2, unit_price: 188.50, units_to_buy: Number(((budget * 0.2) / 188.50).toFixed(4)), actual_amount: budget * 0.2 },
        { category: "Digital Gold", symbol: "GOLDBEES", asset_name: "Nippon India ETF Gold BeES", weight_pct: 10, target_amount: budget * 0.1, unit_price: 64.20, units_to_buy: Number(((budget * 0.1) / 64.20).toFixed(4)), actual_amount: budget * 0.1 },
      ]
    : [
        { category: "Small-Cap Equity", symbol: "QSMALL", asset_name: "Quant Small Cap Direct Fund", weight_pct: 40, target_amount: budget * 0.4, unit_price: 260.15, units_to_buy: Number(((budget * 0.4) / 260.15).toFixed(4)), actual_amount: budget * 0.4 },
        { category: "Mid-Cap Equity", symbol: "HDFCMID", asset_name: "HDFC Mid-Cap Opportunities Fund", weight_pct: 30, target_amount: budget * 0.3, unit_price: 145.80, units_to_buy: Number(((budget * 0.3) / 145.80).toFixed(4)), actual_amount: budget * 0.3 },
        { category: "Flexi-Cap Equity", symbol: "PPFCF", asset_name: "Parag Parikh Flexi Cap Fund", weight_pct: 20, target_amount: budget * 0.2, unit_price: 72.40, units_to_buy: Number(((budget * 0.2) / 72.40).toFixed(4)), actual_amount: budget * 0.2 },
        { category: "Growth Equity Stock", symbol: "RELIANCE", asset_name: "Reliance Industries Ltd", weight_pct: 10, target_amount: budget * 0.1, unit_price: 2980.00, units_to_buy: Number(((budget * 0.1) / 2980.00).toFixed(4)), actual_amount: budget * 0.1 },
      ];

  const totalAllocated = allocations.reduce((acc, curr) => acc + curr.actual_amount, 0);

  return {
    monthly_budget: budget,
    risk_appetite: risk,
    allocations,
    total_allocated: roundTo2(totalAllocated),
    unallocated_cash: roundTo2(Math.max(0, budget - totalAllocated)),
    summary_notes: `Successfully generated ${risk} allocation matrix. Fractional units rounded to 4 decimals.`,
  };
}

function roundTo2(num: number): number {
  return Math.round(num * 100) / 100;
}
