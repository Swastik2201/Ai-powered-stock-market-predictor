import Link from "next/link";
import { TrendingUp, Bot, Shield, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 bg-background text-slate-100">
      <div className="max-w-4xl text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-border text-aiAccent text-sm font-medium">
          <Bot className="w-4 h-4" />
          <span>Next-Gen AI Market Intelligence</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
          Smart Stock Market Predictions & Asset Allocation
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
          Leverage predictive AI models, time-series forecasting, and intelligent portfolio optimizations designed for high-performance financial decisions.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-aiAccent text-white font-semibold hover:opacity-90 transition-opacity"
          >
            Launch Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-surface border border-border font-semibold hover:bg-slate-800 transition-colors"
          >
            Sign In
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 text-left">
          <div className="p-6 rounded-xl bg-surface border border-border space-y-3">
            <TrendingUp className="w-8 h-8 text-profit" />
            <h3 className="text-lg font-bold">Predictive Forecasts</h3>
            <p className="text-sm text-slate-400">
              Prophet-backed time-series models for stock price trend projections.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-surface border border-border space-y-3">
            <Bot className="w-8 h-8 text-aiAccent" />
            <h3 className="text-lg font-bold">Financial Genius AI</h3>
            <p className="text-sm text-slate-400">
              Google Gemini & LangChain assistant for market sentiment & insights.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-surface border border-border space-y-3">
            <Shield className="w-8 h-8 text-gold" />
            <h3 className="text-lg font-bold">Optimal Allocation</h3>
            <p className="text-sm text-slate-400">
              Data-driven risk-balanced portfolio asset distribution models.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
