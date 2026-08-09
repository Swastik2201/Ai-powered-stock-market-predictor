'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/browserClient';
import { Button } from '@/components/ui/Button';
import { TrendingUp, Mail, Sparkles, CheckCircle2, AlertCircle, ShieldCheck, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const supabase = createClient();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    const redirectUrl = `${window.location.origin}/auth/callback`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (error) {
      setErrorMsg(error.message);
      setIsLoading(false);
    }
  };

  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);

    const redirectUrl = `${window.location.origin}/auth/callback`;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setIsSubmitted(true);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-100 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient Background Radial Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-aiAccent/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-profit/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-surface/90 border border-border shadow-2xl rounded-3xl p-8 space-y-8 backdrop-blur-xl relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-aiAccent/15 border border-aiAccent/30 text-aiAccent shadow-lg mb-1">
            <TrendingUp className="w-7 h-7 text-aiAccent" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            MarketGenius AI
          </h1>
          <p className="text-xs text-slate-400">
            AI-Powered Stock Market Predictor & Paper Trading Suite
          </p>
        </div>

        {/* Google OAuth 2.0 Sign In Button */}
        <div className="space-y-4">
          <Button
            onClick={handleGoogleSignIn}
            isLoading={isLoading}
            variant="outline"
            className="w-full py-3.5 bg-background/80 hover:bg-background border-border text-slate-100 font-semibold flex items-center justify-center gap-3 shadow-md"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continue with Google
          </Button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-border/80 w-full" />
            <span className="bg-surface px-3 text-[11px] font-mono text-slate-400 uppercase tracking-widest absolute">
              Or Magic Link
            </span>
          </div>
        </div>

        {/* Email Magic Link Passwordless Form */}
        {!isSubmitted ? (
          <form onSubmit={handleMagicLinkSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-4 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="trader@marketgenius.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl text-slate-100 text-sm focus:outline-none focus:border-aiAccent font-sans"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-loss/10 border border-loss/30 text-loss text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="w-full py-3.5 font-bold flex items-center justify-center gap-2 bg-aiAccent hover:bg-aiAccent/90 shadow-lg shadow-aiAccent/20"
            >
              Send Passwordless Magic Link
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        ) : (
          /* Magic Link Success Confirmation */
          <div className="p-6 rounded-2xl bg-profit/10 border border-profit/30 space-y-3 text-center">
            <div className="w-12 h-12 rounded-full bg-profit/20 border border-profit/40 text-profit flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-100 text-base">Check Your Email Inbox!</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              We sent a passwordless sign-in magic link to <strong className="text-profit">{email}</strong>. Click the link to log in instantly.
            </p>
          </div>
        )}

        {/* Footer Info */}
        <div className="pt-2 border-t border-border/50 text-center space-y-2">
          <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-profit" />
            Encrypted session security powered by Supabase Auth
          </p>
          <Link
            href="/dashboard"
            className="text-xs text-aiAccent hover:underline font-semibold inline-block pt-1"
          >
            Skip to Dashboard Demo Preview →
          </Link>
        </div>
      </div>
    </div>
  );
}
