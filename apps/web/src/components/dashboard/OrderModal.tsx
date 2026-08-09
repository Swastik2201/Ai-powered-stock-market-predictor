'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, TrendingDown, DollarSign, Wallet, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatINR } from '@/lib/utils';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  symbol: string;
  currentPrice: number;
  onSuccess?: () => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  symbol,
  currentPrice,
  onSuccess,
}) => {
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [quantity, setQuantity] = useState<number>(1);
  const [availableCash, setAvailableCash] = useState<number>(1000.00);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const totalCost = Number((quantity * currentPrice).toFixed(2));

  const handleExecuteOrder = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (quantity <= 0) {
      setErrorMsg('Quantity must be greater than 0');
      return;
    }

    if (tradeType === 'BUY' && totalCost > availableCash) {
      setErrorMsg(`Insufficient funds! Required: ${formatINR(totalCost)}, Available: ${formatINR(availableCash)}`);
      return;
    }

    setIsLoading(true);
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

    try {
      const response = await fetch(`${apiBaseUrl}/trading/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'user-123',
          symbol: symbol.toUpperCase(),
          trade_type: tradeType,
          quantity: quantity,
          execution_price: currentPrice,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableCash(data.remaining_cash ?? (availableCash - totalCost));
        setSuccessMsg(`Order Executed! ${tradeType} ${quantity} units of ${symbol} @ ₹${currentPrice}`);
        onSuccess?.();
        setTimeout(() => {
          setSuccessMsg(null);
          onClose();
        }, 2000);
      } else {
        const errJson = await response.json();
        throw new Error(errJson.detail || 'Failed to execute order');
      }
    } catch (err: any) {
      // Local simulation fallback
      if (tradeType === 'BUY') {
        setAvailableCash((prev) => Math.max(0, prev - totalCost));
      } else {
        setAvailableCash((prev) => prev + totalCost);
      }
      setSuccessMsg(`Paper Order Executed! ${tradeType} ${quantity} units of ${symbol} @ ₹${currentPrice}`);
      onSuccess?.();
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 2000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/70 backdrop-blur-sm z-50"
          />

          {/* Centered Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-surface border border-border shadow-2xl rounded-2xl z-50 p-6 space-y-6"
          >
            {/* Header */}
            <div className="flex justify-between items-start border-b border-border pb-4">
              <div>
                <h3 className="font-bold text-slate-100 text-lg flex items-center gap-2">
                  Paper Trade Ticket
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-background border border-border text-slate-400">
                    {symbol}
                  </span>
                </h3>
                <p className="text-xs text-slate-400">Execute instant virtual paper money orders</p>
              </div>

              <button onClick={onClose} className="p-1 hover:text-white text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Wallet Balance Info */}
            <div className="p-3 rounded-xl bg-background/60 border border-border/60 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-profit" />
                Available Cash
              </span>
              <span className="font-bold text-slate-100">{formatINR(availableCash)}</span>
            </div>

            {/* BUY / SELL Toggle Segment */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-background rounded-xl border border-border">
              <button
                onClick={() => setTradeType('BUY')}
                className={`py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  tradeType === 'BUY'
                    ? 'bg-profit/20 border border-profit text-profit shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                BUY
              </button>
              <button
                onClick={() => setTradeType('SELL')}
                className={`py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  tradeType === 'SELL'
                    ? 'bg-loss/20 border border-loss text-loss shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <TrendingDown className="w-4 h-4" />
                SELL
              </button>
            </div>

            {/* Order Quantity & Price Inputs */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">Quantity (Units)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-slate-100 font-mono text-sm focus:outline-none focus:border-profit"
                />
              </div>

              <div className="flex justify-between items-center text-xs font-mono p-3 rounded-xl bg-background/40 border border-border/50">
                <span className="text-slate-400">Market Execution Price</span>
                <span className="font-bold text-slate-200">₹{currentPrice.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center text-sm font-mono p-3.5 rounded-xl bg-surface border border-border">
                <span className="text-slate-300 font-sans font-semibold">Total Order Cost</span>
                <span className="font-extrabold text-profit text-base">{formatINR(totalCost)}</span>
              </div>
            </div>

            {/* Notifications */}
            {errorMsg && (
              <div className="p-3 rounded-lg bg-loss/10 border border-loss/30 text-loss text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-lg bg-profit/10 border border-profit/30 text-profit text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Submit Action Button */}
            <Button
              variant={tradeType === 'BUY' ? 'primary' : 'loss'}
              onClick={handleExecuteOrder}
              isLoading={isLoading}
              className="w-full py-3 font-bold text-sm"
            >
              Confirm {tradeType} Order ({formatINR(totalCost)})
            </Button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
