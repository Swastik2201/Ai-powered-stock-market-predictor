import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { HistoricalSimulator } from '@/components/dashboard/HistoricalSimulator';

export default function BacktestSimulatorPage() {
  return (
    <div className="min-h-screen bg-background text-slate-100 p-6 space-y-8 max-w-7xl mx-auto">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Historical Backtest & Compounding Simulator</h1>
        <p className="text-sm text-slate-400">
          Visualize wealth accumulation over time using systematic investment plans (SIP) vs traditional savings accounts.
        </p>
      </div>

      {/* Historical Simulator Component */}
      <HistoricalSimulator />
    </div>
  );
}
