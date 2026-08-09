'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Award, Lock, CheckCircle2, PieChart, Shield, Trophy, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BadgeItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  is_unlocked: boolean;
  unlocked_at?: string;
}

export interface UserBadgesData {
  user_id: string;
  total_unlocked: number;
  badges: BadgeItem[];
}

interface BadgeGalleryProps {
  userId?: string;
  className?: string;
}

export const BadgeGallery: React.FC<BadgeGalleryProps> = ({ userId = 'user-123', className }) => {
  const [data, setData] = useState<UserBadgesData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchBadges = async () => {
      setIsLoading(true);
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

      try {
        const response = await fetch(`${apiBaseUrl}/gamification/badges/${userId}`);
        if (response.ok) {
          const json = await response.json();
          setData(json);
        } else {
          setData(getMockBadges());
        }
      } catch (err) {
        setData(getMockBadges());
      } finally {
        setIsLoading(false);
      }
    };

    fetchBadges();
  }, [userId]);

  const renderBadgeIcon = (iconName: string, isUnlocked: boolean) => {
    const iconProps = { className: cn("w-6 h-6", isUnlocked ? "text-gold" : "text-slate-500") };
    switch (iconName) {
      case 'PieChart':
        return <PieChart {...iconProps} />;
      case 'Shield':
        return <Shield {...iconProps} />;
      case 'Trophy':
        return <Trophy {...iconProps} />;
      default:
        return <Award {...iconProps} />;
    }
  };

  return (
    <Card className={cn("w-full bg-surface border border-border shadow-xl space-y-6", className)}>
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg text-slate-100">
              <Award className="w-5 h-5 text-gold" />
              Achievement Badges Gallery
            </CardTitle>
            <CardDescription>
              Earn special recognition badges by diversifying, holding disciplined positions, and winning clan leagues.
            </CardDescription>
          </div>

          {data && (
            <Badge variant="gold" className="font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              {data.total_unlocked} / {data.badges.length} Unlocked
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.badges.map((badge) => (
              <div
                key={badge.id}
                className={cn(
                  "p-5 rounded-2xl border transition-all space-y-3 relative overflow-hidden flex flex-col justify-between",
                  badge.is_unlocked
                    ? "bg-gradient-to-br from-gold/10 via-surface to-aiAccent/10 border-gold/40 shadow-xl shadow-gold/5"
                    : "bg-background/40 border-border/60 opacity-60 grayscale"
                )}
              >
                {/* Unlock Status Top Badge */}
                <div className="flex justify-between items-start">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl border flex items-center justify-center shadow-lg",
                      badge.is_unlocked
                        ? "bg-gold/20 border-gold/50 text-gold"
                        : "bg-surface border-border text-slate-500"
                    )}
                  >
                    {renderBadgeIcon(badge.icon, badge.is_unlocked)}
                  </div>

                  {badge.is_unlocked ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-profit/10 text-profit border border-profit/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      UNLOCKED
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-border flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      LOCKED
                    </span>
                  )}
                </div>

                {/* Badge Details */}
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-100 text-base">{badge.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{badge.description}</p>
                </div>

                {/* Unlock Timestamp */}
                {badge.is_unlocked && badge.unlocked_at && (
                  <div className="pt-2 border-t border-border/40 text-[11px] font-mono text-gold/80">
                    Unlocked: {new Date(badge.unlocked_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

function getMockBadges(): UserBadgesData {
  return {
    user_id: 'user-123',
    total_unlocked: 2,
    badges: [
      {
        id: 'diversification_guru',
        title: 'Diversification Guru',
        description: 'Hold at least 3 distinct asset classes (e.g. Stocks, Gold, ETFs) simultaneously.',
        icon: 'PieChart',
        category: 'asset_allocation',
        is_unlocked: true,
        unlocked_at: '2026-08-01T10:00:00Z',
      },
      {
        id: 'diamond_hands',
        title: 'Diamond Hands',
        description: 'Hold an asset through a >5% market drawdown for 14+ days without panic selling.',
        icon: 'Shield',
        category: 'trading_discipline',
        is_unlocked: true,
        unlocked_at: '2026-08-05T14:30:00Z',
      },
      {
        id: 'clan_champion',
        title: 'Clan Champion',
        description: 'Finish #1 on a multiplayer clan league leaderboard at tournament end.',
        icon: 'Trophy',
        category: 'social_league',
        is_unlocked: false,
      },
    ],
  };
}
