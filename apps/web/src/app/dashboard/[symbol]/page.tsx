'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, Cpu, RefreshCw, BarChart2, ShoppingCart } from 'lucide-react';
import { StockChart } from '@/components/dashboard/StockChart';
import { TimeframeSelector } from '@/components/dashboard/TimeframeSelector';
import { RiskRadarChart } from '@/components/dashboard/RiskRadarChart';
import { OrderModal } from '@/components/dashboard/OrderModal';
import { useChartData, TimeframeOption } from '@/hooks/useChartData';
import { PriceTag } from '@/components/ui/PriceTag';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function StockDetailPage() {
  const params = useParams();
  const rawSymbol = (params?.symbol as string) || 'AAPL';
  const symbol = rawSymbol.toUpperCase();

  const [timeframe, setTimeframe] = useState<TimeframeOption>('1M');
  const [isOrderModalOpen, setIsOrderModalOpen] = useState<boolean>(false);
  const { data, isLoading, error, refetch } = useChartData(symbol, timeframe);

  // Compute latest quote parameters from chart data
  const latestCandle = data.length > 0 ? data[data.length - 1] : null;
  const previousCandle = data.length > 1 ? data[data.length - 2] : null;

  const currentPrice = latestCandle ? latestCandle.close : 224.50;
  const prevPrice = previousCandle ? previousCandle.close : currentPrice * 0.98;
  const dayChangePct = prevPrice ? ((currentPrice - prevPrice) / prevPrice) * 100 : 1.25;

  return (
    <div className="min-h-screen bg-background text-slate-100 p-6 space-y-8 max-w-7xl mx-auto">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<RefreshCw className="w-3.5 h-3.5" />} onClick={refetch}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Stock Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface p-6 rounded-xl border border-border shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold font-mono tracking-tight text-white">{symbol}</h1>
            <Badge variant="profit">LIVE</Badge>
            <Badge variant="ai">AI Signal: Strong Buy</Badge>
          </div>
          <p className="text-sm text-slate-400">Market Price Analytics & Technical Candlestick Series</p>
        </div>

        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
          <div className="text-right space-y-1">
            <PriceTag value={currentPrice} changePct={dayChangePct} currency={symbol.includes('NS') ? 'INR' : 'USD'} size="lg" />
            <span className="text-xs text-slate-500 block">Real-time quote feed</span>
          </div>

          <Button
            variant="primary"
            leftIcon={<ShoppingCart className="w-4 h-4" />}
            onClick={() => setIsOrderModalOpen(true)}
            className="shadow-lg shadow-profit/20"
          >
            Trade Asset (Paper Money)
          </Button>
        </div>
      </div>

      {/* Interactive Stock Chart Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-aiAccent" />
            Interactive Candlestick Chart
          </h2>

          {/* Timeframe Selector Button Group */}
          <TimeframeSelector
            activeTimeframe={timeframe}
            onSelectTimeframe={(tf) => setTimeframe(tf)}
          />
        </div>

        {/* Lightweight Charts Candlestick Container */}
        <StockChart data={data} isLoading={isLoading} error={error} height={460} />
      </div>

      {/* 5-Axis Risk Radar Section */}
      <section className="pt-2">
        <RiskRadarChart symbol={symbol} />
      </section>

      {/* Key Statistics Cards */}
      {latestCandle && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-surface border border-border space-y-1">
            <span className="text-xs text-slate-400 block">Session Open</span>
            <span className="font-mono text-lg font-bold">₹{latestCandle.open.toFixed(2)}</span>
          </div>
          <div className="p-4 rounded-xl bg-surface border border-border space-y-1">
            <span className="text-xs text-slate-400 block">Session High</span>
            <span className="font-mono text-lg font-bold text-profit">₹{latestCandle.high.toFixed(2)}</span>
          </div>
          <div className="p-4 rounded-xl bg-surface border border-border space-y-1">
            <span className="text-xs text-slate-400 block">Session Low</span>
            <span className="font-mono text-lg font-bold text-loss">₹{latestCandle.low.toFixed(2)}</span>
          </div>
          <div className="p-4 rounded-xl bg-surface border border-border space-y-1">
            <span className="text-xs text-slate-400 block">Volume</span>
            <span className="font-mono text-lg font-bold text-slate-200">
              {latestCandle.volume ? latestCandle.volume.toLocaleString('en-IN') : 'N/A'}
            </span>
          </div>
        </div>
      )}

      {/* Paper Trading Order Ticket Modal */}
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        symbol={symbol}
        currentPrice={currentPrice}
      />
    </div>
  );
}
