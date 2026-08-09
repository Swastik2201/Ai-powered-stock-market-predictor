import React from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PriceTag } from "@/components/ui/PriceTag";
import { StatCard } from "@/components/ui/StatCard";
import { TrendingUp, Cpu, DollarSign, Award, ArrowRight, ShieldCheck, Zap } from "lucide-react";

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-background text-slate-100 p-8 space-y-12 max-w-7xl mx-auto">
      {/* Header */}
      <header className="border-b border-border pb-6 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-aiAccent/15 text-aiAccent border border-aiAccent/30 text-xs font-semibold">
          <Cpu className="w-4 h-4" />
          <span>Financial Design System & UI Token Specification</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight">Financial Web Design Tokens & Core Components</h1>
        <p className="text-slate-400 text-sm">
          A showcase of custom dark-mode financial tokens, glassmorphism cards, glowing AI accents, and reusable React UI primitives.
        </p>
      </header>

      {/* Color Palette Tokens */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold border-b border-border/40 pb-2">1. Financial Color Tokens</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="p-4 rounded-xl bg-background border border-border space-y-2 text-center">
            <div className="w-full h-12 rounded-lg bg-background border border-border" />
            <span className="text-xs font-mono block">#0B0E14</span>
            <span className="text-xs text-slate-400">Background</span>
          </div>

          <div className="p-4 rounded-xl bg-surface border border-border space-y-2 text-center">
            <div className="w-full h-12 rounded-lg bg-surface border border-border" />
            <span className="text-xs font-mono block">#161B22</span>
            <span className="text-xs text-slate-400">Surface</span>
          </div>

          <div className="p-4 rounded-xl bg-surface border border-border space-y-2 text-center">
            <div className="w-full h-12 rounded-lg bg-border" />
            <span className="text-xs font-mono block">#21262D</span>
            <span className="text-xs text-slate-400">Border</span>
          </div>

          <div className="p-4 rounded-xl bg-surface border border-border space-y-2 text-center">
            <div className="w-full h-12 rounded-lg bg-profit" />
            <span className="text-xs font-mono block text-profit font-bold">#00E676</span>
            <span className="text-xs text-slate-400">Profit / Bullish</span>
          </div>

          <div className="p-4 rounded-xl bg-surface border border-border space-y-2 text-center">
            <div className="w-full h-12 rounded-lg bg-loss" />
            <span className="text-xs font-mono block text-loss font-bold">#FF5252</span>
            <span className="text-xs text-slate-400">Loss / Bearish</span>
          </div>

          <div className="p-4 rounded-xl bg-surface border border-border space-y-2 text-center">
            <div className="w-full h-12 rounded-lg bg-aiAccent glow-ai" />
            <span className="text-xs font-mono block text-purple-400 font-bold">#8A2BE2</span>
            <span className="text-xs text-slate-400">AI Accent</span>
          </div>

          <div className="p-4 rounded-xl bg-surface border border-border space-y-2 text-center">
            <div className="w-full h-12 rounded-lg bg-gold" />
            <span className="text-xs font-mono block text-gold font-bold">#FFD700</span>
            <span className="text-xs text-slate-400">Gold / Gamification</span>
          </div>
        </div>
      </section>

      {/* Buttons Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold border-b border-border/40 pb-2">2. Button Components (`Button.tsx`)</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <Button variant="primary">Primary Action</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="profit" leftIcon={<TrendingUp className="w-4 h-4" />}>Buy Stock</Button>
          <Button variant="loss">Sell Asset</Button>
          <Button variant="ai" leftIcon={<Cpu className="w-4 h-4" />}>Ask MarketGenius AI</Button>
          <Button variant="outline">Outline Button</Button>
          <Button variant="ghost">Ghost Button</Button>
          <Button variant="primary" isLoading>Loading State</Button>
        </div>
      </section>

      {/* Badges Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold border-b border-border/40 pb-2">3. Asset Badge Components (`Badge.tsx`)</h2>
        <div className="flex flex-wrap gap-3 items-center">
          <Badge variant="default">Large Cap</Badge>
          <Badge variant="profit">Bullish +4.5%</Badge>
          <Badge variant="loss">Bearish -2.1%</Badge>
          <Badge variant="ai"><Zap className="w-3 h-3 text-aiAccent" /> AI Sentiment High</Badge>
          <Badge variant="gold"><Award className="w-3 h-3 text-gold" /> Clan Winner</Badge>
          <Badge variant="outline">ETF / Index</Badge>
        </div>
      </section>

      {/* Price Tags Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold border-b border-border/40 pb-2">4. Price Formatting Indicators (`PriceTag.tsx`)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="p-4 rounded-xl bg-surface border border-border space-y-1">
            <span className="text-xs text-slate-400 block">USD Profit Quote</span>
            <PriceTag value={224.50} changePct={4.25} currency="USD" size="lg" />
          </div>

          <div className="p-4 rounded-xl bg-surface border border-border space-y-1">
            <span className="text-xs text-slate-400 block">INR Loss Quote</span>
            <PriceTag value={2980.00} changePct={-1.85} currency="INR" size="lg" />
          </div>

          <div className="p-4 rounded-xl bg-surface border border-border space-y-1">
            <span className="text-xs text-slate-400 block">Neutral Quote</span>
            <PriceTag value={542.10} changePct={0.00} currency="USD" size="md" />
          </div>

          <div className="p-4 rounded-xl bg-surface border border-border space-y-1">
            <span className="text-xs text-slate-400 block">Small Price Tag</span>
            <PriceTag value={1820.50} change={35.20} currency="INR" size="sm" />
          </div>
        </div>
      </section>

      {/* Stat Cards KPI Grid Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold border-b border-border/40 pb-2">5. Metric KPI Cards (`StatCard.tsx`)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            label="Total Net Worth"
            value={124500.50}
            changePct={5.80}
            currency="USD"
            icon={<DollarSign className="w-5 h-5 text-profit" />}
            subtitle="Calculated across 8 active asset allocations"
          />

          <StatCard
            variant="ai"
            label="AI Market Sentiment"
            value="Strongly Bullish"
            icon={<Cpu className="w-5 h-5 text-aiAccent" />}
            subtitle="Powered by Prophet & Gemini models"
          />

          <StatCard
            variant="profit"
            label="Virtual Paper Balance"
            value={10398750.00}
            changePct={12.40}
            currency="INR"
            icon={<ShieldCheck className="w-5 h-5 text-gold" />}
            subtitle="Clan League Rank #1"
          />
        </div>
      </section>

      {/* Glassmorphism Composite Card */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold border-b border-border/40 pb-2">6. Glassmorphism Composite Card (`Card.tsx`)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card variant="ai">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-purple-300">
                  <Cpu className="w-5 h-5 text-aiAccent" />
                  MarketGenius Copilot Advice
                </CardTitle>
                <Badge variant="ai">AI Verified</Badge>
              </div>
              <CardDescription>
                Real-time multi-model analysis combining time-series trends & news sentiment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-300">
              <p>
                "Technical indicators highlight strong support for AAPL at $220. Recommended strategy: Increase allocation by 5%."
              </p>
            </CardContent>
            <CardFooter className="justify-between">
              <span className="text-xs text-slate-400">Updated 2 minutes ago</span>
              <Button variant="ai" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Execute Strategy
              </Button>
            </CardFooter>
          </Card>

          <Card variant="default">
            <CardHeader>
              <CardTitle>Asset Allocation Summary</CardTitle>
              <CardDescription>Current distribution across equities, bonds, and cash.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Equities & ETFs</span>
                <span className="font-bold text-profit">65.0%</span>
              </div>
              <div className="w-full bg-background h-2 rounded-full overflow-hidden">
                <div className="bg-profit h-full w-[65%]" />
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Cash / Paper Reserves</span>
                <span className="font-bold text-gold">35.0%</span>
              </div>
              <div className="w-full bg-background h-2 rounded-full overflow-hidden">
                <div className="bg-gold h-full w-[35%]" />
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="secondary" size="sm" className="w-full">
                Rebalance Portfolio
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>
    </div>
  );
}
