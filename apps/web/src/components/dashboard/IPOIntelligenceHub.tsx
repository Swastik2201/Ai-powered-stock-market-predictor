'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Rocket, TrendingUp, Calendar, Layers, DollarSign, Award, Loader2 } from 'lucide-react';
import { cn, formatINR } from '@/lib/utils';

export type IPOStatusFilter = 'ongoing' | 'upcoming' | 'listed';

export interface IPOItem {
  id: string;
  company_name: string;
  symbol: string;
  issue_start_date: string;
  issue_end_date: string;
  listing_date?: string;
  price_band_min: number;
  price_band_max: number;
  issue_size_cr: number;
  lot_size: number;
  status: IPOStatusFilter;
  gmp_amount: number;
  gmp_percent: number;
  qib_subscription: number;
  nii_subscription: number;
  retail_subscription: number;
  total_subscription: number;
  demand_score: number;
  demand_classification: string;
  demand_color_tag: string;
}

export const IPOIntelligenceHub: React.FC = () => {
  const [activeStatus, setActiveStatus] = useState<IPOStatusFilter>('ongoing');
  const [ipos, setIpos] = useState<IPOItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchIPOs = async () => {
      setIsLoading(true);
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
      try {
        const response = await fetch(`${apiBaseUrl}/screeners/ipos?status=${activeStatus}`);
        if (response.ok) {
          const data = await response.json();
          setIpos(data);
        } else {
          setIpos(getMockIPOs(activeStatus));
        }
      } catch (err) {
        setIpos(getMockIPOs(activeStatus));
      } finally {
        setIsLoading(false);
      }
    };

    fetchIPOs();
  }, [activeStatus]);

  const tabs: { id: IPOStatusFilter; label: string }[] = [
    { id: 'ongoing', label: 'Ongoing IPOs' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'listed', label: 'Recently Listed' },
  ];

  return (
    <Card className="w-full space-y-6">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Rocket className="w-5 h-5 text-profit" />
              IPO Intelligence Hub
            </CardTitle>
            <CardDescription>
              Grey Market Premium (GMP), Demand Analysis, and QIB / NII / Retail Subscription Tracking.
            </CardDescription>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center p-1 bg-background/80 border border-border rounded-xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveStatus(tab.id)}
                className={cn(
                  "px-4 py-1.5 text-xs font-semibold rounded-lg transition-all",
                  activeStatus === tab.id
                    ? "bg-surface border border-profit text-profit shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-profit" />
            <span className="text-xs font-mono">Fetching Live IPO Subscriptions...</span>
          </div>
        ) : ipos.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {ipos.map((ipo) => (
              <div
                key={ipo.id}
                className="p-5 rounded-xl bg-surface/80 border border-border hover:border-slate-700 transition-all space-y-4 shadow-lg"
              >
                {/* Header Row */}
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg text-slate-100">{ipo.company_name}</h3>
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-background border border-border text-slate-400">
                        {ipo.symbol}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      Closes: {ipo.issue_end_date} | Lot Size: {ipo.lot_size} shares
                    </p>
                  </div>

                  {/* Demand Pill */}
                  <Badge variant={ipo.demand_score >= 70 ? "profit" : ipo.demand_score >= 40 ? "gold" : "loss"}>
                    <Award className="w-3 h-3" />
                    {ipo.demand_classification} ({ipo.demand_score}/100)
                  </Badge>
                </div>

                {/* Price Band & Issue Size */}
                <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-background/60 border border-border/50 text-xs">
                  <div>
                    <span className="text-slate-500 block">Price Band</span>
                    <span className="font-mono font-bold text-slate-200">
                      ₹{ipo.price_band_min} - ₹{ipo.price_band_max}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Issue Size</span>
                    <span className="font-mono font-bold text-slate-200">
                      ₹{ipo.issue_size_cr.toLocaleString('en-IN')} Cr
                    </span>
                  </div>
                </div>

                {/* GMP Badge Callout */}
                <div className="p-3 rounded-lg bg-profit/10 border border-profit/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-profit" />
                    <span className="text-xs font-semibold text-profit">Grey Market Premium (GMP)</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-extrabold text-profit text-sm block">
                      +₹{ipo.gmp_amount} ({ipo.gmp_percent.toFixed(1)}%)
                    </span>
                    <span className="text-[10px] text-slate-400">Expected Listing Gain</span>
                  </div>
                </div>

                {/* Subscription Progress Bars */}
                <div className="space-y-2 pt-1 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-400">Total Subscription</span>
                    <span className="font-mono text-profit font-bold">{ipo.total_subscription.toFixed(1)}x</span>
                  </div>
                  <div className="w-full bg-background h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-profit h-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (ipo.total_subscription / 20) * 100)}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] text-slate-400">
                    <div>
                      <span className="block text-slate-500">QIB</span>
                      <span className="font-mono font-bold text-slate-200">{ipo.qib_subscription.toFixed(1)}x</span>
                    </div>
                    <div>
                      <span className="block text-slate-500">NII</span>
                      <span className="font-mono font-bold text-slate-200">{ipo.nii_subscription.toFixed(1)}x</span>
                    </div>
                    <div>
                      <span className="block text-slate-500">Retail</span>
                      <span className="font-mono font-bold text-slate-200">{ipo.retail_subscription.toFixed(1)}x</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500">
            No active IPOs found under "{activeStatus}" filter.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

function getMockIPOs(status: IPOStatusFilter): IPOItem[] {
  return [
    {
      id: "ipo-mock-1",
      company_name: "Swiggy Limited IPO",
      symbol: "SWIGGY",
      issue_start_date: "2026-08-08",
      issue_end_date: "2026-08-12",
      price_band_min: 371,
      price_band_max: 390,
      issue_size_cr: 11370,
      lot_size: 38,
      status: "ongoing",
      gmp_amount: 125,
      gmp_percent: 32.05,
      qib_subscription: 14.5,
      nii_subscription: 8.2,
      retail_subscription: 4.1,
      total_subscription: 9.8,
      demand_score: 87.7,
      demand_classification: "High Demand",
      demand_color_tag: "profit",
    },
    {
      id: "ipo-mock-2",
      company_name: "Hyundai Motor India",
      symbol: "HYUNDAI",
      issue_start_date: "2026-08-10",
      issue_end_date: "2026-08-14",
      price_band_min: 1860,
      price_band_max: 1960,
      issue_size_cr: 27870,
      lot_size: 7,
      status: "ongoing",
      gmp_amount: 310,
      gmp_percent: 15.81,
      qib_subscription: 6.8,
      nii_subscription: 4.5,
      retail_subscription: 2.2,
      total_subscription: 4.5,
      demand_score: 62.7,
      demand_classification: "Moderate",
      demand_color_tag: "gold",
    },
  ];
}
