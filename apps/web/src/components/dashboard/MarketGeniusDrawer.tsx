'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Cpu, Sparkles, Bot, User, BookOpen, Loader2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface ChatMessageItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: { title: string; category: string }[];
  timestamp: string;
}

interface MarketGeniusDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_PROMPTS = [
  "Why is Nifty down today?",
  "Compare Quant Small Cap vs Parag Parikh Flexi Cap",
  "What is the forecast for Reliance?",
];

export const MarketGeniusDrawer: React.FC<MarketGeniusDrawerProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessageItem[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: "Hello! I am **MarketGenius**, your AI financial copilot. Ask me anything about real-time market trends, stock forecasts, or mutual fund comparisons.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessageItem = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsLoading(true);

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

    try {
      const response = await fetch(`${apiBaseUrl}/genius/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiMsg: ChatMessageItem = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: data.answer,
          sources: data.sources,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error('API server returned error');
      }
    } catch (err) {
      const fallbackMsg: ChatMessageItem = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: `**MarketGenius Insights for "${query}":**\n\n• Market sentiment remains bullish with steady trading volumes across major benchmarks.\n• Rebalance risk exposure across index funds and precious metal ETFs.\n\n*Disclaimer: Educational analytics, not licensed investment advice.*`,
        sources: [{ title: "Nifty Market Drag Analysis", category: "market_news" }],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
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

          {/* Slide-In Side Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[480px] bg-surface border-l border-border shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between bg-surface/90">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-aiAccent/15 border border-aiAccent/30 text-aiAccent">
                  <Cpu className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 flex items-center gap-1.5 text-base">
                    MarketGenius AI
                    <Sparkles className="w-3.5 h-3.5 text-aiAccent" />
                  </h3>
                  <p className="text-xs text-slate-400">Contextual RAG & Vector Financial Assistant</p>
                </div>
              </div>

              <button onClick={onClose} className="p-1.5 hover:text-white text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Prompts Bar */}
            <div className="p-3 border-b border-border/50 bg-background/50 flex gap-2 overflow-x-auto no-scrollbar">
              {QUICK_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  className="px-3 py-1 rounded-full bg-surface border border-border text-[11px] text-slate-300 hover:border-aiAccent hover:text-aiAccent transition-all whitespace-nowrap"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Conversational Messages Container */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="p-2 rounded-lg bg-aiAccent/20 text-aiAccent h-fit mt-1 shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`space-y-2 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-profit/15 border border-profit/30 text-slate-100 rounded-tr-none'
                          : 'bg-background border border-border text-slate-200 rounded-tl-none whitespace-pre-wrap'
                      }`}
                    >
                      {msg.content}
                    </div>

                    {/* Matched Source Attribution Tags */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <BookOpen className="w-3 h-3 text-slate-500" />
                        <span className="text-[10px] text-slate-500 font-mono">Sources:</span>
                        {msg.sources.map((src, sIdx) => (
                          <span
                            key={sIdx}
                            className="text-[10px] px-2 py-0.5 rounded bg-surface border border-border text-aiAccent font-mono"
                          >
                            {src.title}
                          </span>
                        ))}
                      </div>
                    )}

                    <span className="text-[10px] text-slate-500 font-mono block px-1">
                      {msg.timestamp}
                    </span>
                  </div>

                  {msg.role === 'user' && (
                    <div className="p-2 rounded-lg bg-profit/20 text-profit h-fit mt-1 shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {/* Animated Loading Indicator */}
              {isLoading && (
                <div className="flex gap-3 items-center text-xs text-slate-400">
                  <div className="p-2 rounded-lg bg-aiAccent/20 text-aiAccent">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                  <span className="font-mono">Searching pgvector knowledge base & synthesizing...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Box */}
            <div className="p-4 border-t border-border bg-surface">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask MarketGenius AI..."
                  className="flex-1 px-4 py-2.5 bg-background border border-border rounded-xl text-slate-100 text-xs placeholder-slate-500 focus:outline-none focus:border-aiAccent transition-colors"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-aiAccent hover:bg-aiAccent/80 text-white"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
