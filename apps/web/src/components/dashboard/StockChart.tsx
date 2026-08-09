'use client';

import React, { useEffect, useRef } from 'react';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  ColorType,
  CrosshairMode,
} from 'lightweight-charts';
import { OHLCDataPoint, TimeframeOption } from '@/hooks/useChartData';
import { Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StockChartProps {
  data: OHLCDataPoint[];
  isLoading?: boolean;
  error?: string | null;
  height?: number;
  className?: string;
}

export const StockChart: React.FC<StockChartProps> = ({
  data,
  isLoading = false,
  error = null,
  height = 420,
  className,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // 1. Initialize Lightweight Chart instance with Dark Mode Theme Tokens
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: height,
      layout: {
        background: { type: ColorType.Solid, color: '#0B0E14' },
        textColor: '#94A3B8',
        fontSize: 12,
        fontFamily: 'JetBrains Mono, monospace',
      },
      grid: {
        vertLines: { color: 'rgba(33, 38, 45, 0.6)' },
        horzLines: { color: 'rgba(33, 38, 45, 0.6)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: '#8A2BE2',
          width: 1,
          style: 3, // Dashed
          labelBackgroundColor: '#161B22',
        },
        horzLine: {
          color: '#8A2BE2',
          width: 1,
          style: 3,
          labelBackgroundColor: '#161B22',
        },
      },
      rightPriceScale: {
        borderColor: '#21262D',
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderColor: '#21262D',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: {
        vertTouchDrag: false,
      },
    });

    chartRef.current = chart;

    // 2. Add Candlestick Series with Bullish (#00E676) and Bearish (#FF5252) Token Colors
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#00E676',
      downColor: '#FF5252',
      borderVisible: false,
      wickUpColor: '#00E676',
      wickDownColor: '#FF5252',
    });

    candlestickSeriesRef.current = candlestickSeries;

    // 3. Handle Responsive Container Resizing with ResizeObserver
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });

    resizeObserver.observe(chartContainerRef.current);

    // 4. Strict Cleanup on Component Unmount / Re-render
    return () => {
      resizeObserver.disconnect();
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        candlestickSeriesRef.current = null;
      }
    };
  }, [height]);

  // Update Candlestick Series data whenever `data` prop changes
  useEffect(() => {
    if (candlestickSeriesRef.current && data && data.length > 0) {
      try {
        candlestickSeriesRef.current.setData(data as any);
        if (chartRef.current) {
          chartRef.current.timeScale().fitContent();
        }
      } catch (err) {
        console.error('Error setting Lightweight Chart data:', err);
      }
    }
  }, [data]);

  return (
    <div className={cn('relative w-full rounded-xl overflow-hidden glass-card p-4', className)}>
      {/* Loading Canvas Mask Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-aiAccent animate-spin" />
          <span className="text-xs font-mono text-slate-400">Loading GPU-Accelerated Chart Data...</span>
        </div>
      )}

      {/* Error Overlay */}
      {error && !isLoading && (
        <div className="absolute inset-0 bg-background/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-2 text-loss p-6 text-center">
          <AlertCircle className="w-8 h-8" />
          <span className="font-semibold text-sm">Failed to render stock chart</span>
          <span className="text-xs text-slate-400">{error}</span>
        </div>
      )}

      {/* Chart Canvas Container DOM Ref */}
      <div ref={chartContainerRef} className="w-full" style={{ height: `${height}px` }} />
    </div>
  );
};
