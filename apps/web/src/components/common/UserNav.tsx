'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/browserClient';
import { Badge } from '@/components/ui/Badge';
import { User, LogOut, ShieldCheck, Settings, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserNavProps {
  userEmail?: string;
  userName?: string;
  avatarUrl?: string;
  riskProfile?: string;
}

export const UserNav: React.FC<UserNavProps> = ({
  userEmail = 'trader@marketgenius.ai',
  userName = 'Swastik Sharma',
  avatarUrl,
  riskProfile = 'Moderate Risk',
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore mock error
    } finally {
      router.push('/login');
    }
  };

  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1.5 rounded-full hover:bg-surface border border-border/80 transition-all focus:outline-none"
      >
        <div className="w-8 h-8 rounded-full bg-aiAccent/20 border border-aiAccent/40 flex items-center justify-center text-aiAccent font-bold text-xs">
          {initials}
        </div>
        <span className="text-xs font-semibold text-slate-200 hidden sm:inline">{userName}</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          <div className="absolute right-0 mt-2 w-64 bg-surface border border-border shadow-2xl rounded-2xl p-4 space-y-4 z-50 text-xs font-sans">
            {/* User Details */}
            <div className="flex items-center gap-3 pb-3 border-b border-border">
              <div className="w-10 h-10 rounded-full bg-aiAccent/20 border border-aiAccent/40 flex items-center justify-center text-aiAccent font-bold text-sm shrink-0">
                {initials}
              </div>
              <div className="truncate space-y-0.5">
                <p className="font-bold text-slate-100 truncate">{userName}</p>
                <p className="text-[11px] text-slate-400 truncate">{userEmail}</p>
              </div>
            </div>

            {/* Risk Profile Tag */}
            <div className="p-2.5 rounded-xl bg-background/60 border border-border flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5 font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-gold" />
                Risk Tag
              </span>
              <Badge variant="gold">{riskProfile}</Badge>
            </div>

            {/* Action Links */}
            <div className="space-y-1 pt-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push('/dashboard/clans');
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-background/80 flex items-center gap-2 text-slate-200 transition-colors"
              >
                <Award className="w-4 h-4 text-gold" />
                Multiplayer Leagues
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push('/settings');
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-background/80 flex items-center gap-2 text-slate-200 transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                Account Settings
              </button>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              className="w-full text-left px-3 py-2.5 rounded-lg bg-loss/10 hover:bg-loss/20 text-loss font-semibold flex items-center justify-center gap-2 transition-colors border border-loss/20 mt-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
