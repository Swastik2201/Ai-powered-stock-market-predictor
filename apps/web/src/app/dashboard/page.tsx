'use client';

import React, { useState } from "react";
import Link from "next/link";
import { formatINR, formatUSD } from "@/lib/utils";
import { TrendingUp, ArrowUpRight, ShieldCheck, Cpu, MessageSquare, Bot, Sparkles, Trophy, Users, BarChart3, Activity, Zap, RefreshCw } from "lucide-react";
import { UniversalSearch } from "@/components/dashboard/UniversalSearch";
import { AssetCategoryTabs } from "@/components/dashboard/AssetCategoryTabs";
import { IPOIntelligenceHub } from "@/components/dashboard/IPOIntelligenceHub";
import { IntradayScreener } from "@/components/dashboard/IntradayScreener";
import { BudgetAllocator } from "@/components/dashboard/BudgetAllocator";
import { PredictionChartOverlay, ForecastCorridorPoint } from "@/components/dashboard/PredictionChartOverlay";
import { RiskMeter } from "@/components/dashboard/RiskMeter";
import { RiskRadarChart } from "@/components/dashboard/RiskRadarChart";
import { ClanLeaderboard } from "@/components/dashboard/ClanLeaderboard";
import { DailyQuizCard } from "@/components/dashboard/DailyQuizCard";
import { BadgeGallery } from "@/components/dashboard/BadgeGallery";
import { MarketGeniusDrawer } from "@/components/dashboard/MarketGeniusDrawer";
import { FinancialDisclaimer } from "@/components/common/FinancialDisclaimer";
import { Button } from "@/components/ui/Button";
import { AssetItem } from "@/types/market";
import { triggerQuizConfetti } from "@/lib/confetti";

const mockMarketAssets: AssetItem[] = [
  { symbol: "NIFTY50", name: "Nifty 50 Index", asset_type: "index", category: "Benchmark", current_price: 24320.50, day_change_pct: 0.85 },
  { symbol: "SENSEX", name: "BSE Sensex", asset_type: "index", category: "Benchmark", current_price: 79850.10, day_change_pct: 0.72 },
  { symbol: "BANKNIFTY", name: "Nifty Bank", asset_type: "index", category: "Sectoral", current_price: 52100.00, day_change_pct: -0.35 },
  { symbol: "RELIANCE", name: "Reliance Industries Ltd", asset_type: "stock", category: "Large Cap", current_price: 2980.00, day_change_pct: 1.45 },
  { symbol: "TCS", name: "Tata Consultancy Services", asset_type: "stock", category: "Large Cap", current_price: 4210.00, day_change_pct: 0.95 },
  { symbol: "INFY", name: "Infosys Limited", asset_type: "stock", category: "Large Cap", current_price: 1820.00, day_change_pct: -0.40 },
  { symbol: "PARAG_FLEXI", name: "Parag Parikh Flexi Cap Fund", asset_type: "mutual_fund", category: "Flexi Cap", current_price: 72.40, day_change_pct: 0.60 },
  { symbol: "QUANT_SMALL", name: "Quant Small Cap Fund", asset_type: "mutual_fund", category: "Small Cap", current_price: 260.15, day_change_pct: 2.10 },
  { symbol: "HDFC_MID", name: "HDFC Mid-Cap Opportunities", asset_type: "mutual_fund", category: "Mid Cap", current_price: 145.80, day_change_pct: 1.15 },
  { symbol: "GOLDBEES", name: "Nippon India ETF Gold BeES", asset_type: "commodity", category: "Precious Metal", current_price: 64.20, day_change_pct: 0.15 },
  { symbol: "SILVERBEES", name: "Nippon India ETF Silver BeES", asset_type: "commodity", category: "Precious Metal", current_price: 88.50, day_change_pct: -0.80 },
  { symbol: "SWIGGY", name: "Swiggy Limited IPO", asset_type: "ipo", category: "Upcoming", current_price: 390.00, day_change_pct: 4.50 },
];

const mockForecastCorridor: ForecastCorridorPoint[] = Array.from({ length: 30 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() + i + 1);
  const base = 2980.00 + i * 2.5;
  const spread = 25.0 + i * 1.8;
  return {
    date: d.toISOString().split("T")[0],
    yhat: Number(base.toFixed(2)),
    yhat_lower: Number((base - spread).toFixed(2)),
    yhat_upper: Number((base + spread).toFixed(2)),
  };
});

export default function DashboardPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const mockPortfolioValueUSD = 124500.50;
  const mockPortfolioValueINR = 10398750.00;

  return (
    <div className="min-h-screen bg-background text-slate-100 p-6 lg:p-8 space-y-10 max-w-7xl mx-auto pb-20">
      {/* Modern Hero Welcome Banner */}
      <section className="p-8 rounded-3xl bg-gradient-to-r from-surface via-surface/90 to-aiAccent/10 border border-border/80 shadow-2xl relative overflow-hidden space-y-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-aiAccent/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-profit/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-aiAccent/15 text-aiAccent border border-aiAccent/30 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-aiAccent" />
                Live Predictive Terminal
              </span>
              <span className="text-xs text-slate-400 font-mono">Market Session Open</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              Financial Intelligence Hub
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl">
              Prophet time-series forecasting, 5-axis risk radar analytics, multiplayer leagues, and RAG copilot.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/dashboard/clans">
              <Button variant="outline" className="border-gold/40 text-gold hover:bg-gold/10 font-semibold flex items-center gap-2 py-2.5 px-4 shadow-lg shadow-gold/5">
                <Trophy className="w-4 h-4 text-gold" />
                Clan Leagues
              </Button>
            </Link>

            <Button
              onClick={() => setIsDrawerOpen(true)}
              className="bg-aiAccent hover:bg-aiAccent/90 text-white font-semibold flex items-center gap-2 py-2.5 px-5 shadow-xl shadow-aiAccent/25"
            >
              <Bot className="w-4 h-4" />
              Ask MarketGenius AI
              <Sparkles className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Live Market Insights Ticker Strip */}
        <div className="p-3.5 rounded-xl bg-background/60 border border-border/60 flex items-center justify-between text-xs font-mono text-slate-300 gap-4 overflow-x-auto touch-scroll">
          <span className="flex items-center gap-2 shrink-0">
            <Activity className="w-4 h-4 text-profit" />
            <strong className="text-slate-200">NIFTY50:</strong> 24,320.50 (+0.85%)
          </span>
          <span className="shrink-0 text-slate-500">•</span>
          <span className="flex items-center gap-2 shrink-0">
            <strong className="text-slate-200">RELIANCE Prophet 30D:</strong> ₹3,105.00 (+4.2%)
          </span>
          <span className="shrink-0 text-slate-500">•</span>
          <span className="flex items-center gap-2 shrink-0">
            <strong className="text-slate-200">FII Net Inflow:</strong> +₹2,450 Cr
          </span>
          <span className="shrink-0 text-slate-500">•</span>
          <span className="flex items-center gap-2 shrink-0">
            <strong className="text-slate-200">India VIX:</strong> 13.20 (-2.1%)
          </span>
        </div>
      </section>

      {/* Universal Fuzzy Search Bar (Cmd+K) */}
      <UniversalSearch initialAssets={mockMarketAssets} />

      {/* Glassmorphic Portfolio Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-surface border border-border/80 shadow-xl glass-card-hover space-y-3 relative overflow-hidden">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
            Total Portfolio Value (USD)
          </span>
          <div className="text-3xl font-extrabold text-white tracking-tight">
            {formatUSD(mockPortfolioValueUSD)}
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="flex items-center gap-1 text-xs font-bold text-profit bg-profit/10 px-2.5 py-1 rounded-full border border-profit/20">
              <ArrowUpRight className="w-3.5 h-3.5" />
              +4.25% today
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Live NAV Valuation</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-surface border border-border/80 shadow-xl glass-card-hover space-y-3 relative overflow-hidden">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
            Total Portfolio Value (INR)
          </span>
          <div className="text-3xl font-extrabold text-white tracking-tight">
            {formatINR(mockPortfolioValueINR)}
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="flex items-center gap-1 text-xs font-bold text-profit bg-profit/10 px-2.5 py-1 rounded-full border border-profit/20">
              <ArrowUpRight className="w-3.5 h-3.5" />
              +₹42,350 gain
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Paper Ledger</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-surface border border-border/80 shadow-xl glass-card-hover space-y-3 relative overflow-hidden">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
            AI Risk Meter Score
          </span>
          <div className="text-3xl font-extrabold text-gold tracking-tight">
            72.5 / 100
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="flex items-center gap-1.5 text-xs text-gold font-bold bg-gold/10 px-2.5 py-1 rounded-full border border-gold/20">
              <ShieldCheck className="w-3.5 h-3.5 text-gold" />
              Low Volatility Risk
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Optimized</span>
          </div>
        </div>
      </div>

      {/* Gamification Engine: Daily Financial Quiz & Badges Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DailyQuizCard onRewardClaimed={() => triggerQuizConfetti()} />
        <BadgeGallery />
      </div>

      {/* Multiplayer Clan ROI Leaderboard Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-gold" />
            Social League Standings
          </h2>
          <Link href="/dashboard/clans" className="text-xs text-gold hover:underline font-semibold font-mono">
            View All Clans →
          </Link>
        </div>
        <ClanLeaderboard clanId="clan-1" />
      </section>

      {/* 5-Axis Quantitative Risk Radar Chart Section */}
      <section className="space-y-4">
        <RiskRadarChart symbol="RELIANCE" />
      </section>

      {/* Main ML Forecast Corridor & Risk Meter Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Prophet Prediction Corridor Overlay Chart */}
        <div className="lg:col-span-2">
          <PredictionChartOverlay
            symbol="RELIANCE"
            forecastData={mockForecastCorridor}
            currentPrice={2980.00}
            height={380}
          />
        </div>

        {/* Visual Risk & News Sentiment Meter */}
        <div>
          <RiskMeter
            score={72.5}
            sentimentLabel="Bullish"
            riskLevel="Low Volatility Risk"
          />
        </div>
      </div>

      {/* AI Budget Asset Allocation Engine */}
      <section>
        <BudgetAllocator />
      </section>

      {/* Asset Discovery & Categorization Hub */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight border-b border-border/60 pb-3 text-white">
          Multi-Asset Discovery Hub
        </h2>
        <AssetCategoryTabs assets={mockMarketAssets} />
      </section>

      {/* IPO Intelligence Hub Section */}
      <section>
        <IPOIntelligenceHub />
      </section>

      {/* Intraday Breakouts & Momentum Screener Section */}
      <section>
        <IntradayScreener />
      </section>

      {/* Floating Copilot Button (Bottom Right) */}
      <button
        onClick={() => setIsDrawerOpen(true)}
        className="fixed bottom-16 right-6 p-4 rounded-full bg-aiAccent hover:bg-aiAccent/90 text-white shadow-2xl z-40 flex items-center gap-2 group transition-all hover:scale-105 border border-aiAccent/40"
        title="Open MarketGenius AI Chat"
      >
        <Bot className="w-6 h-6 animate-pulse" />
        <span className="font-semibold text-xs pr-1">Ask MarketGenius</span>
      </button>

      {/* MarketGenius RAG Copilot Side Drawer */}
      <MarketGeniusDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />

      {/* Sticky Regulatory Disclaimer Banner */}
      <FinancialDisclaimer />
    </div>
  );
}
