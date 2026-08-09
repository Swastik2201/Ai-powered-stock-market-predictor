'use client';

import React, { useState } from "react";
import Link from "next/link";
import { formatINR, formatUSD } from "@/lib/utils";
import { TrendingUp, ArrowUpRight, ShieldCheck, Cpu, MessageSquare, Bot, Sparkles, Trophy, Users } from "lucide-react";
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
import { Button } from "@/components/ui/Button";
import { AssetItem } from "@/types/market";

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
    <div className="relative min-h-screen bg-background text-slate-100 p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Financial Intelligence Dashboard</h1>
          <p className="text-sm text-slate-400">MarketGenius RAG Copilot, Daily Quiz, Badges, Clan Leagues & 5-Axis Risk Radar</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/clans">
            <Button variant="outline" className="border-gold/40 text-gold hover:bg-gold/10 font-semibold flex items-center gap-2">
              <Trophy className="w-4 h-4 text-gold" />
              Clan Leagues
            </Button>
          </Link>

          <Button
            onClick={() => setIsDrawerOpen(true)}
            className="bg-aiAccent hover:bg-aiAccent/80 text-white font-semibold flex items-center gap-2 shadow-lg shadow-aiAccent/20"
          >
            <Bot className="w-4 h-4" />
            Ask MarketGenius AI
            <Sparkles className="w-3.5 h-3.5" />
          </Button>

          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-profit/10 text-profit border border-profit/20 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-profit animate-pulse" />
            Live Market Feed
          </span>
        </div>
      </header>

      {/* Universal Fuzzy Search Bar (Cmd+K) */}
      <UniversalSearch initialAssets={mockMarketAssets} />

      {/* Portfolio Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl bg-surface border border-border space-y-2">
          <span className="text-sm font-medium text-slate-400">Total Portfolio Value (USD)</span>
          <div className="text-3xl font-extrabold text-white">
            {formatUSD(mockPortfolioValueUSD)}
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-profit">
            <ArrowUpRight className="w-4 h-4" />
            +4.25% today
          </div>
        </div>

        <div className="p-6 rounded-xl bg-surface border border-border space-y-2">
          <span className="text-sm font-medium text-slate-400">Total Portfolio Value (INR)</span>
          <div className="text-3xl font-extrabold text-white">
            {formatINR(mockPortfolioValueINR)}
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-profit">
            <ArrowUpRight className="w-4 h-4" />
            +₹42,350 estimated gain
          </div>
        </div>

        <div className="p-6 rounded-xl bg-surface border border-border space-y-2">
          <span className="text-sm font-medium text-slate-400">AI Risk Score</span>
          <div className="text-3xl font-extrabold text-gold">Low / Moderate</div>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-gold" />
            Optimal diversification model
          </div>
        </div>
      </div>

      {/* Gamification Engine: Daily Financial Quiz & Badges Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        <DailyQuizCard />
        <BadgeGallery />
      </div>

      {/* Multiplayer Clan ROI Leaderboard Section */}
      <section className="pt-2">
        <ClanLeaderboard clanId="clan-1" />
      </section>

      {/* 5-Axis Quantitative Risk Radar Chart Section */}
      <section className="pt-2">
        <RiskRadarChart symbol="RELIANCE" />
      </section>

      {/* Main ML Forecast Corridor & Risk Meter Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {/* Prophet Prediction Corridor Overlay Chart */}
        <div className="lg:col-span-2">
          <PredictionChartOverlay
            symbol="RELIANCE"
            forecastData={mockForecastCorridor}
            currentPrice={2980.00}
            height={360}
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
      <section className="pt-4">
        <BudgetAllocator />
      </section>

      {/* Asset Discovery & Categorization Hub */}
      <section className="space-y-4 pt-4">
        <h2 className="text-xl font-bold tracking-tight border-b border-border/40 pb-2">
          Multi-Asset Market Discovery
        </h2>
        <AssetCategoryTabs assets={mockMarketAssets} />
      </section>

      {/* IPO Intelligence Hub Section */}
      <section className="pt-4">
        <IPOIntelligenceHub />
      </section>

      {/* Intraday Breakouts & Momentum Screener Section */}
      <section className="pt-4">
        <IntradayScreener />
      </section>

      {/* Floating Copilot Button (Bottom Right) */}
      <button
        onClick={() => setIsDrawerOpen(true)}
        className="fixed bottom-6 right-6 p-4 rounded-full bg-aiAccent hover:bg-aiAccent/90 text-white shadow-2xl z-40 flex items-center gap-2 group transition-transform hover:scale-105"
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
    </div>
  );
}
