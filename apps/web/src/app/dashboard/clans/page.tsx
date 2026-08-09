'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trophy, Users, ShieldCheck, Sparkles } from 'lucide-react';
import { ClanManagement } from '@/components/dashboard/ClanManagement';
import { ClanLeaderboard } from '@/components/dashboard/ClanLeaderboard';

export default function ClanLeaguesPage() {
  const [activeClanId, setActiveClanId] = useState<string>('clan-1');

  return (
    <div className="min-h-screen bg-background text-slate-100 p-6 space-y-8 max-w-7xl mx-auto">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gold/10 text-gold border border-gold/30 flex items-center gap-1.5 font-mono">
          <Trophy className="w-3.5 h-3.5" />
          Multiplayer Trading Leagues
        </span>
      </div>

      {/* Main Grid: League Management & Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Create / Join Clan Modal Card */}
        <div className="lg:col-span-1">
          <ClanManagement onClanJoined={(id) => setActiveClanId(id)} />
        </div>

        {/* Right Column: Real-Time ROI Leaderboard */}
        <div className="lg:col-span-2">
          <ClanLeaderboard clanId={activeClanId} />
        </div>
      </div>
    </div>
  );
}
