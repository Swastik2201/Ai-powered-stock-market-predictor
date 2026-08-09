'use client';

import React, { useState } from 'react';
import { MainTab, AssetItem } from '@/types/market';
import { TrendingUp, TrendingDown, ShieldCheck, Flame, PieChart, Landmark, Rocket } from 'lucide-react';

interface AssetCategoryTabsProps {
  assets: AssetItem[];
}

export const AssetCategoryTabs: React.FC<AssetCategoryTabsProps> = ({ assets }) => {
  const [activeTab, setActiveTab] = useState<MainTab>('indices');
  const [subFilter, setSubFilter] = useState<string>('all');

  // Tab definitions
  const tabs: { id: MainTab; label: string; icon: React.ReactNode; subFilters: string[] }[] = [
    { id: 'indices', label: 'Indices', icon: <Landmark className="w-4 h-4" />, subFilters: ['all', 'Benchmark', 'Sectoral'] },
    { id: 'equities', label: 'Equities', icon: <Flame className="w-4 h-4" />, subFilters: ['all', 'Large Cap', 'Intraday Gainers', 'Top Losers'] },
    { id: 'mutual_funds', label: 'Mutual Funds', icon: <PieChart className="w-4 h-4" />, subFilters: ['all', 'Large Cap', 'Mid Cap', 'Small Cap', 'Flexi Cap'] },
    { id: 'commodities', label: 'Gold & Silver', icon: <ShieldCheck className="w-4 h-4" />, subFilters: ['all', 'Precious Metal', 'ETFs'] },
    { id: 'ipos', label: 'IPOs', icon: <Rocket className="w-4 h-4" />, subFilters: ['all', 'Upcoming', 'Listed'] },
  ];

  const currentTabConfig = tabs.find((t) => t.id === activeTab);

  // Filter assets based on active main tab & sub-filter
  const filteredAssets = assets.filter((asset) => {
    if (activeTab === 'indices') return asset.asset_type === 'index';
    if (activeTab === 'equities') return asset.asset_type === 'stock';
    if (activeTab === 'mutual_funds') return asset.asset_type === 'mutual_fund';
    if (activeTab === 'commodities') return asset.asset_type === 'commodity';
    if (activeTab === 'ipos') return asset.asset_type === 'ipo';
    return true;
  }).filter((asset) => {
    if (subFilter === 'all') return true;
    return asset.category?.toLowerCase() === subFilter.toLowerCase();
  });

  return (
    <div className="w-full">
      {/* Top Level Category Tabs */}
      <div className="flex border-b border-border mb-6 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setSubFilter('all');
            }}
            className={`flex items-center gap-2 px-6 py-3.5 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-profit text-profit bg-profit/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Secondary Sub-Filters */}
      {currentTabConfig && currentTabConfig.subFilters.length > 1 && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {currentTabConfig.subFilters.map((sf) => (
            <button
              key={sf}
              onClick={() => setSubFilter(sf)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                subFilter === sf
                  ? 'bg-surface border border-profit text-profit'
                  : 'bg-surface/50 border border-border text-slate-400 hover:bg-surface'
              }`}
            >
              {sf}
            </button>
          ))}
        </div>
      )}

      {/* Asset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredAssets.length > 0 ? (
          filteredAssets.map((asset) => (
            <div
              key={asset.symbol}
              className="p-4 bg-surface border border-border rounded-xl hover:border-slate-700 transition-all shadow-md group"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-mono font-bold text-slate-100 group-hover:text-profit transition-colors">
                    {asset.symbol}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-1">{asset.name}</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-background border border-border text-slate-400">
                  {asset.category || asset.asset_type}
                </span>
              </div>

              <div className="flex justify-between items-end mt-4">
                <div>
                  <p className="text-xs text-slate-500">Current Price</p>
                  <p className="font-mono font-bold text-slate-100 text-lg">
                    ₹{asset.current_price.toLocaleString('en-IN')}
                  </p>
                </div>
                <div
                  className={`flex items-center gap-1 font-mono text-sm px-2 py-1 rounded ${
                    asset.day_change_pct >= 0 ? 'bg-profit/10 text-profit' : 'bg-loss/10 text-loss'
                  }`}
                >
                  {asset.day_change_pct >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {asset.day_change_pct >= 0 ? '+' : ''}{asset.day_change_pct.toFixed(2)}%
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full p-8 text-center text-slate-500 bg-surface/30 border border-border rounded-xl">
            No assets available under "{subFilter}" category.
          </div>
        )}
      </div>
    </div>
  );
};
