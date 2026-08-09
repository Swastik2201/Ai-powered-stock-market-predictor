'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TrendingUp, Trophy, BarChart2, Bot, Sparkles, LayoutGrid, ShieldCheck } from 'lucide-react';
import { UserNav } from '@/components/common/UserNav';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export const Navbar: React.FC = () => {
  const pathname = usePathname();

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
    { href: '/dashboard/clans', label: 'Clan Leagues', icon: Trophy },
    { href: '/dashboard/backtest', label: 'Backtest Visualizer', icon: BarChart2 },
    { href: '/design-system', label: 'Design System', icon: Sparkles },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#090C10]/85 backdrop-blur-xl border-b border-border/80 shadow-2xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
        {/* Brand Logo & Live Pulse */}
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-aiAccent to-emerald-400 p-[1px] shadow-lg shadow-aiAccent/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#090C10] rounded-[11px] flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-aiAccent group-hover:text-emerald-400 transition-colors" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                MarketGenius
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-aiAccent/15 text-aiAccent border border-aiAccent/30">
                AI v1.0
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block font-mono">Predictive Financial Engine</span>
          </div>
        </Link>

        {/* Center Route Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 font-sans text-xs font-semibold">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all relative",
                  isActive
                    ? "text-white bg-surface border border-border/80 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-surface/50"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-aiAccent" : "text-slate-500")} />
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-gradient-to-r from-aiAccent to-emerald-400 rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Bar */}
        <div className="flex items-center gap-3">
          <span className="hidden lg:flex items-center gap-1.5 text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-profit/10 text-profit border border-profit/20">
            <span className="w-1.5 h-1.5 rounded-full bg-profit animate-ping" />
            Nifty +0.85%
          </span>

          <UserNav />
        </div>
      </div>
    </header>
  );
};
