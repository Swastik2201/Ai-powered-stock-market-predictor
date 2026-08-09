import { formatINR, formatUSD } from "@/lib/utils";
import { TrendingUp, ArrowUpRight, ShieldCheck, Cpu } from "lucide-react";

export default function DashboardPage() {
  const mockPortfolioValueUSD = 124500.5;
  const mockPortfolioValueINR = 10398750.0;

  return (
    <div className="min-h-screen bg-background text-slate-100 p-6 space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Financial Intelligence Dashboard</h1>
          <p className="text-sm text-slate-400">Real-time forecasts, portfolio allocation, and AI copilot insights</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-profit/10 text-profit border border-profit/20 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-profit animate-pulse" />
            Live Market Feed
          </span>
        </div>
      </header>

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

      {/* Main Grid: Forecasts & AI Genius */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Forecast chart area placeholder */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-surface border border-border space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-profit" />
              Stock Market Forecast Engine (Prophet)
            </h2>
          </div>
          <div className="h-64 rounded-lg bg-background/50 border border-border/50 flex items-center justify-center text-slate-500 text-sm">
            [ Interactive Prophet Time-Series Forecast Chart Placeholder ]
          </div>
        </div>

        {/* AI Genius Panel placeholder */}
        <div className="p-6 rounded-xl bg-surface border border-border space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2 text-aiAccent">
              <Cpu className="w-5 h-5 text-aiAccent" />
              AI Genius Copilot
            </h2>
          </div>
          <div className="space-y-3 text-sm text-slate-300">
            <div className="p-3 rounded-lg bg-background border border-border">
              "Market sentiment on tech sector remains bullish due to strong quarterly earnings."
            </div>
            <div className="p-3 rounded-lg bg-background border border-border">
              "Recommended rebalancing: Reallocate 5% from high-volatility equities to index funds."
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
