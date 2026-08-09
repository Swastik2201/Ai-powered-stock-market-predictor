'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Flame, Zap, TrendingUp, TrendingDown, RefreshCw, Clock } from 'lucide-react';
import { formatINR } from '@/lib/utils';

export interface BreakoutSignal {
  symbol: string;
  name: string;
  signal_type: 'VOLUME_SPIKE' | 'PRICE_BREAKOUT' | '52W_HIGH_CROSS' | 'RSI_OVERSOLD';
  timeframe: string;
  price_at_signal: number;
  volume_ratio: number;
  change_pct: number;
  created_at: string;
}

export const IntradayScreener: React.FC = () => {
  const [signals, setSignals] = useState<BreakoutSignal[]>([]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchBreakouts = async () => {
    setIsRefreshing(true);
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    try {
      const response = await fetch(`${apiBaseUrl}/screeners/intraday/breakouts`);
      if (response.ok) {
        const data = await response.json();
        setSignals(data);
      } else {
        setSignals(getMockBreakouts());
      }
    } catch (err) {
      setSignals(getMockBreakouts());
    } finally {
      setIsRefreshing(false);
      setLastUpdated(new Date().toLocaleTimeString());
    }
  };

  useEffect(() => {
    fetchBreakouts();
    // Auto-refresh signals every 15 seconds
    const interval = setInterval(fetchBreakouts, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="w-full space-y-6">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-xl text-amber-400">
              <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
              Intraday Momentum & Volume Breakouts
            </CardTitle>
            <CardDescription>
              Automated 5-minute scanner detecting 3.0x volume surges & +1.5% momentum candles.
            </CardDescription>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Refreshed: {lastUpdated || 'Just now'}
            </span>
            <Button
              variant="outline"
              size="sm"
              isLoading={isRefreshing}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={fetchBreakouts}
            >
              Scan
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-border/70 text-slate-400 text-xs uppercase tracking-wider bg-background/40">
                <th className="p-3">Asset / Symbol</th>
                <th className="p-3">Trigger Signal</th>
                <th className="p-3">Price at Signal</th>
                <th className="p-3">Volume Ratio</th>
                <th className="p-3 text-right">5m Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 font-mono">
              {signals.map((sig, idx) => (
                <tr
                  key={`${sig.symbol}-${idx}`}
                  className="hover:bg-surface/60 transition-colors group"
                >
                  <td className="p-3 font-sans">
                    <div className="font-bold text-slate-100 font-mono group-hover:text-profit transition-colors">
                      {sig.symbol}
                    </div>
                    <div className="text-xs text-slate-400 line-clamp-1">{sig.name}</div>
                  </td>

                  <td className="p-3 font-sans">
                    {sig.signal_type === 'VOLUME_SPIKE' && (
                      <Badge variant="gold">
                        <Zap className="w-3 h-3 text-gold" />
                        ⚡ Volume Spike ({sig.volume_ratio}x)
                      </Badge>
                    )}
                    {sig.signal_type === 'PRICE_BREAKOUT' && (
                      <Badge variant="profit">
                        <TrendingUp className="w-3 h-3 text-profit" />
                        🚀 Price Breakout ({sig.change_pct >= 0 ? '+' : ''}{sig.change_pct}%)
                      </Badge>
                    )}
                    {sig.signal_type === '52W_HIGH_CROSS' && (
                      <Badge variant="ai">
                        <Flame className="w-3 h-3 text-aiAccent" />
                        🔥 52W High Cross
                      </Badge>
                    )}
                    {sig.signal_type === 'RSI_OVERSOLD' && (
                      <Badge variant="loss">
                        <TrendingDown className="w-3 h-3 text-loss" />
                        📉 RSI Oversold
                      </Badge>
                    )}
                  </td>

                  <td className="p-3 text-slate-200">
                    ₹{sig.price_at_signal.toLocaleString('en-IN')}
                  </td>

                  <td className="p-3 font-bold text-gold">
                    {sig.volume_ratio.toFixed(1)}x avg
                  </td>

                  <td className="p-3 text-right">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                        sig.change_pct >= 0 ? 'bg-profit/15 text-profit' : 'bg-loss/15 text-loss'
                      }`}
                    >
                      {sig.change_pct >= 0 ? '+' : ''}{sig.change_pct.toFixed(2)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

function getMockBreakouts(): BreakoutSignal[] {
  return [
    {
      symbol: "RELIANCE",
      name: "Reliance Industries Ltd",
      signal_type: "VOLUME_SPIKE",
      timeframe: "5m",
      price_at_signal: 2985.50,
      volume_ratio: 4.20,
      change_pct: 1.85,
      created_at: new Date().toISOString(),
    },
    {
      symbol: "TCS",
      name: "Tata Consultancy Services",
      signal_type: "PRICE_BREAKOUT",
      timeframe: "5m",
      price_at_signal: 4215.00,
      volume_ratio: 2.80,
      change_pct: 2.10,
      created_at: new Date().toISOString(),
    },
    {
      symbol: "QUANT_SMALL",
      name: "Quant Small Cap Fund",
      signal_type: "52W_HIGH_CROSS",
      timeframe: "5m",
      price_at_signal: 262.10,
      volume_ratio: 3.50,
      change_pct: 2.45,
      created_at: new Date().toISOString(),
    },
  ];
}
