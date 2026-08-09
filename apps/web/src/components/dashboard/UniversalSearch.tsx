'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Fuse from 'fuse.js';
import { Search, X, TrendingUp, TrendingDown, Command } from 'lucide-react';
import { AssetItem } from '@/types/market';

interface UniversalSearchProps {
  initialAssets: AssetItem[];
  onSelectAsset?: (asset: AssetItem) => void;
}

export const UniversalSearch: React.FC<UniversalSearchProps> = ({ initialAssets, onSelectAsset }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Initialize Fuse.js instance with fuzzy configuration
  const fuse = useMemo(() => {
    return new Fuse(initialAssets, {
      keys: [
        { name: 'symbol', weight: 0.7 },
        { name: 'name', weight: 0.3 },
        { name: 'category', weight: 0.2 },
      ],
      threshold: 0.3, // Typo tolerance
      includeMatches: true,
    });
  }, [initialAssets]);

  // Execute fuzzy search
  const results = useMemo(() => {
    if (!query.trim()) return [];
    return fuse.search(query).map((res) => res.item);
  }, [query, fuse]);

  // Keyboard shortcut listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl mx-auto mb-8">
      {/* Search Input Box */}
      <div className="relative flex items-center">
        <Search className="absolute left-4 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search Stocks, Nifty, Mutual Funds, Gold, ETFs... (Press Cmd+K)"
          className="w-full pl-12 pr-24 py-3.5 bg-surface border border-border rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-aiAccent transition-colors shadow-lg"
        />
        <div className="absolute right-3 flex items-center gap-1">
          {query && (
            <button onClick={() => setQuery('')} className="p-1 hover:text-white text-slate-400">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:flex items-center gap-0.5 px-2 py-1 text-xs font-mono text-slate-400 bg-background border border-border rounded">
            <Command className="w-3 h-3" /> K
          </kbd>
        </div>
      </div>

      {/* Fuzzy Results Dropdown Drawer */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-surface/95 backdrop-blur-md border border-border rounded-xl shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto">
          {results.length > 0 ? (
            <div className="p-2 divide-y divide-border/50">
              {results.map((asset) => (
                <div
                  key={asset.symbol}
                  onClick={() => {
                    onSelectAsset?.(asset);
                    setIsOpen(false);
                  }}
                  className="flex items-center justify-between p-3 hover:bg-background/60 rounded-lg cursor-pointer transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-100 font-mono">{asset.symbol}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-background text-slate-400 border border-border uppercase">
                        {asset.asset_type}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400">{asset.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-slate-100">₹{asset.current_price.toLocaleString('en-IN')}</p>
                    <p className={`text-xs flex items-center justify-end gap-0.5 font-mono ${asset.day_change_pct >= 0 ? 'text-profit' : 'text-loss'}`}>
                      {asset.day_change_pct >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {asset.day_change_pct >= 0 ? '+' : ''}{asset.day_change_pct.toFixed(2)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-slate-400">
              No assets found matching "{query}".
            </div>
          )}
        </div>
      )}
    </div>
  );
};
