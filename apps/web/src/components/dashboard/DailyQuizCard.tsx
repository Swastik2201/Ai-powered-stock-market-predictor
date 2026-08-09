'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { HelpCircle, CheckCircle2, XCircle, Flame, Coins, Sparkles, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface QuizData {
  quiz_id: string;
  question: string;
  options: string[];
  topic: string;
  attempted_today: boolean;
  is_correct_previous?: boolean;
  streak_days: number;
}

interface DailyQuizCardProps {
  userId?: string;
  className?: string;
  onRewardClaimed?: (amount: number) => void;
}

export const DailyQuizCard: React.FC<DailyQuizCardProps> = ({
  userId = 'user-123',
  className,
  onRewardClaimed,
}) => {
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [result, setResult] = useState<{ is_correct: boolean; explanation: string; reward: number } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchQuiz = async () => {
      setIsLoading(true);
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

      try {
        const response = await fetch(`${apiBaseUrl}/gamification/quiz/daily/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setQuiz(data);
          if (data.attempted_today) {
            setIsSubmitted(true);
          }
        } else {
          setQuiz(getMockQuiz());
        }
      } catch (err) {
        setQuiz(getMockQuiz());
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuiz();
  }, [userId]);

  const handleSubmitAnswer = async () => {
    if (selectedOption === null || !quiz || isSubmitted) return;

    setIsLoading(true);
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

    try {
      const response = await fetch(`${apiBaseUrl}/gamification/quiz/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          quiz_id: quiz.quiz_id,
          selected_option: selectedOption,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult({
          is_correct: data.is_correct,
          explanation: data.explanation,
          reward: data.reward_claimed,
        });
        setIsSubmitted(true);
        if (data.is_correct && data.reward_claimed > 0) {
          onRewardClaimed?.(data.reward_claimed);
        }
      } else {
        throw new Error('Submission failed');
      }
    } catch (err) {
      const isCorrect = selectedOption === 1;
      setResult({
        is_correct: isCorrect,
        explanation: 'The Rule of 72 is a quick mental shortcut: divide 72 by your annual interest rate to find the years needed to double your money (e.g. at 12% return, 72 / 12 = 6 years).',
        reward: isCorrect ? 50.0 : 0.0,
      });
      setIsSubmitted(true);
      if (isCorrect) onRewardClaimed?.(50.0);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={cn("w-full bg-surface border border-border shadow-xl space-y-6", className)}>
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg text-slate-100">
              <HelpCircle className="w-5 h-5 text-aiAccent" />
              Daily Financial Literacy Mini-Quiz
            </CardTitle>
            <CardDescription>
              Earn +₹50.00 virtual paper trading cash every day by answering correctly.
            </CardDescription>
          </div>

          {quiz && (
            <div className="flex items-center gap-2">
              <Badge variant="gold" className="flex items-center gap-1 font-mono">
                <Flame className="w-3.5 h-3.5 text-gold animate-pulse" />
                {quiz.streak_days} Day Streak
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {quiz && (
          <div className="space-y-4">
            {/* Question Text */}
            <div className="p-4 rounded-xl bg-background/60 border border-border/60">
              <h3 className="font-semibold text-slate-100 text-base leading-relaxed">
                {quiz.question}
              </h3>
            </div>

            {/* Multiple Choice Options */}
            <div className="space-y-2.5">
              {quiz.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                let optionStyle = "border-border/60 bg-background/40 hover:bg-background/80 text-slate-200";

                if (isSubmitted && result) {
                  if (idx === 1) { // Correct answer index
                    optionStyle = "border-profit bg-profit/15 text-profit font-bold";
                  } else if (isSelected && !result.is_correct) {
                    optionStyle = "border-loss bg-loss/15 text-loss font-bold";
                  }
                } else if (isSelected) {
                  optionStyle = "border-aiAccent bg-aiAccent/10 text-aiAccent font-bold";
                }

                return (
                  <button
                    key={idx}
                    disabled={isSubmitted}
                    onClick={() => setSelectedOption(idx)}
                    className={cn(
                      "w-full text-left p-3.5 rounded-xl border transition-all text-sm flex items-center justify-between font-sans",
                      optionStyle
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-surface border border-border flex items-center justify-center text-xs font-mono font-bold shrink-0">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      {opt}
                    </span>

                    {isSubmitted && idx === 1 && (
                      <CheckCircle2 className="w-5 h-5 text-profit shrink-0" />
                    )}
                    {isSubmitted && isSelected && !result?.is_correct && (
                      <XCircle className="w-5 h-5 text-loss shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Submit Action Button */}
            {!isSubmitted && (
              <Button
                onClick={handleSubmitAnswer}
                disabled={selectedOption === null || isLoading}
                isLoading={isLoading}
                variant="primary"
                leftIcon={<Sparkles className="w-4 h-4" />}
                className="w-full py-3 font-bold"
              >
                Submit Answer (+₹50 Reward)
              </Button>
            )}

            {/* Explanation & Reward Banner */}
            <AnimatePresence>
              {isSubmitted && result && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4 pt-2"
                >
                  {/* Reward Banner */}
                  {result.is_correct ? (
                    <div className="p-4 rounded-xl bg-profit/10 border border-profit/30 flex items-center justify-between shadow-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-profit/20 border border-profit/40 flex items-center justify-center text-profit">
                          <Coins className="w-5 h-5 text-profit animate-bounce" />
                        </div>
                        <div>
                          <span className="font-extrabold text-profit text-base block">
                            +₹50.00 Virtual Cash Credited!
                          </span>
                          <span className="text-xs text-slate-300">Daily quiz bonus added to paper trading wallet.</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-loss/10 border border-loss/30 text-loss text-xs flex items-center gap-2">
                      <XCircle className="w-4 h-4 shrink-0" />
                      <span>Incorrect answer. Better luck tomorrow!</span>
                    </div>
                  )}

                  {/* Financial Concept Explanation */}
                  <div className="p-4 rounded-xl bg-surface/80 border border-border space-y-1.5 text-xs text-slate-300 font-sans">
                    <span className="font-bold text-slate-100 flex items-center gap-1.5 text-sm">
                      <Lightbulb className="w-4 h-4 text-gold" />
                      Concept Breakdown
                    </span>
                    <p className="leading-relaxed text-slate-300">{result.explanation}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

function getMockQuiz(): QuizData {
  return {
    quiz_id: '11111111-1111-1111-1111-111111111111',
    question: 'What does the Rule of 72 calculate in financial compounding?',
    options: [
      'The exact tax rate on long-term capital gains',
      'The approximate number of years needed to double an investment',
      'The maximum limit for SIP investments per year',
      'The annual expense ratio of index mutual funds',
    ],
    topic: 'compound_interest',
    attempted_today: false,
    streak_days: 5,
  };
}
