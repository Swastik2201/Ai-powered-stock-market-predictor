'use client';

import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export const FinancialDisclaimer: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(true);

  if (!isVisible) return null;

  return (
    <aside aria-label="Regulatory Disclaimer" className="w-full bg-slate-900/95 border-t border-gold/30 p-3 text-xs font-sans text-slate-300 backdrop-blur-md sticky bottom-0 z-40 shadow-2xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-gold shrink-0 animate-pulse" />
          <p className="leading-snug text-slate-300">
            <strong className="text-gold font-semibold">Regulatory Disclaimer:</strong> Educational simulation only. Predictions and allocations are probabilistic outputs based on historical market data and do not constitute certified investment advice.
          </p>
        </div>

        <button
          onClick={() => setIsVisible(false)}
          className="p-1 hover:text-white text-slate-400 transition-colors shrink-0"
          title="Dismiss Disclaimer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
