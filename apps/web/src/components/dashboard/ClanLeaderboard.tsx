'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Trophy, Medal, Award, TrendingUp, TrendingDown, Users, RefreshCw } from 'lucide-react';
import { formatINR, cn } from '@/lib/utils';

export interface LeaderboardUser {
  rank: number;
  user_id: string;
  full_name: string;
  avatar_url?: string;
  portfolio_value: number;
  cash_balance: number;
  roi_pct: number;
  trophy_badge?: 'gold' | 'silver' | 'bronze' | null;
}

export interface ClanLeaderboardData {
  clan_id: string;
  clan_name: string;
  room_code: string;
  total_members: number;
  leaderboard: LeaderboardUser[];
}

interface ClanLeaderboardProps {
  clanId?: string;
  className?: string;
}

export const ClanLeaderboard: React.FC<ClanLeaderboardProps> = ({ clanId = 'clan-1', className }) => {
  const [data, setData] = useState<ClanLeaderboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

    try {
      const response = await fetch(`${apiBaseUrl}/clans/leaderboard/${clanId}`);
      if (response.ok) {
        const json = await response.json();
        setData(json);
      } else {
        setData(getMockLeaderboard(clanId));
      }
    } catch (err) {
      setData(getMockLeaderboard(clanId));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [clanId]);

  return (
    <Card className={cn("w-full space-y-6 bg-surface border border-border shadow-xl", className)}>
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-xl text-slate-100">
              <Trophy className="w-5 h-5 text-gold" />
              {data ? data.clan_name : "League ROI Leaderboard"}
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <span>Ranked strictly by % ROI return on initial ₹1,000 capital.</span>
              {data && (
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-gold/10 border border-gold/30 text-gold font-bold">
                  ROOM PIN: {data.room_code}
                </span>
              )}
            </CardDescription>
          </div>

          <button
            onClick={fetchLeaderboard}
            className="p-2 rounded-lg bg-background/60 hover:bg-background border border-border text-slate-400 hover:text-slate-200 transition-colors"
            title="Refresh Leaderboard"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          </button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm font-sans">
            <thead className="bg-background/60 text-slate-400 font-mono text-xs uppercase border-b border-border">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Trader</th>
                <th className="py-3 px-4 text-right">Portfolio Value</th>
                <th className="py-3 px-4 text-right">Cash Balance</th>
                <th className="py-3 px-4 text-right">ROI Return %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {data && data.leaderboard.map((user) => {
                const isPositive = user.roi_pct >= 0;
                return (
                  <tr
                    key={user.user_id}
                    className={cn(
                      "hover:bg-background/50 transition-colors font-mono",
                      user.rank === 1 && "bg-gold/5"
                    )}
                  >
                    {/* Rank & Trophy Badge */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        {user.rank === 1 && (
                          <div className="w-7 h-7 rounded-full bg-gold/20 border border-gold/50 flex items-center justify-center text-gold shadow-md">
                            <Trophy className="w-4 h-4 text-gold" />
                          </div>
                        )}
                        {user.rank === 2 && (
                          <div className="w-7 h-7 rounded-full bg-slate-300/20 border border-slate-300/50 flex items-center justify-center text-slate-300">
                            <Medal className="w-4 h-4 text-slate-300" />
                          </div>
                        )}
                        {user.rank === 3 && (
                          <div className="w-7 h-7 rounded-full bg-amber-700/20 border border-amber-700/50 flex items-center justify-center text-amber-600">
                            <Award className="w-4 h-4 text-amber-600" />
                          </div>
                        )}
                        {user.rank > 3 && (
                          <span className="w-7 text-center font-bold text-slate-400 text-sm">
                            #{user.rank}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Trader Avatar & Name */}
                    <td className="py-3.5 px-4 font-sans font-semibold text-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-border flex items-center justify-center text-xs font-bold text-gold">
                          {user.full_name.substring(0, 2).toUpperCase()}
                        </div>
                        <span>{user.full_name}</span>
                        {user.user_id === 'user-123' && (
                          <Badge variant="outline" className="text-[10px] py-0 px-1.5">You</Badge>
                        )}
                      </div>
                    </td>

                    {/* Total Portfolio Value */}
                    <td className="py-3.5 px-4 text-right font-bold text-slate-100">
                      {formatINR(user.portfolio_value)}
                    </td>

                    {/* Cash Balance */}
                    <td className="py-3.5 px-4 text-right text-slate-400">
                      {formatINR(user.cash_balance)}
                    </td>

                    {/* ROI Return % */}
                    <td className="py-3.5 px-4 text-right font-extrabold">
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs",
                        isPositive ? "bg-profit/10 text-profit border border-profit/30" : "bg-loss/10 text-loss border border-loss/30"
                      )}>
                        {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {isPositive ? '+' : ''}{user.roi_pct.toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

function getMockLeaderboard(clanId: string): ClanLeaderboardData {
  return {
    clan_id: clanId,
    clan_name: "Alpha WallStreet Traders",
    room_code: "TRD99X",
    total_members: 4,
    leaderboard: [
      { rank: 1, user_id: 'user-123', full_name: 'Swastik Sharma', portfolio_value: 1420.50, cash_balance: 240.50, roi_pct: 42.05, trophy_badge: 'gold' },
      { rank: 2, user_id: 'user-456', full_name: 'Rohan Gupta', portfolio_value: 1285.00, cash_balance: 180.00, roi_pct: 28.50, trophy_badge: 'silver' },
      { rank: 3, user_id: 'user-789', full_name: 'Ananya Verma', portfolio_value: 1150.20, cash_balance: 320.00, roi_pct: 15.02, trophy_badge: 'bronze' },
      { rank: 4, user_id: 'user-999', full_name: 'Vikram Patel', portfolio_value: 980.00, cash_balance: 50.00, roi_pct: -2.00, trophy_badge: null },
    ]
  };
}
