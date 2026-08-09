export function initPostHog() {
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!apiKey) {
    console.log('[PostHog Analytics] Initialized in mock mode (Key not set).');
    return;
  }
  console.log(`[PostHog Analytics] Initialized with Key: ${apiKey.substring(0, 10)}...`);
}

export function trackEvent(eventName: string, properties?: Record<string, any>) {
  console.log(`[PostHog Track Event] ${eventName}:`, properties);
}

export function trackTradeExecution(symbol: string, tradeType: 'BUY' | 'SELL', totalAmount: number) {
  trackEvent('paper_trade_executed', {
    symbol,
    tradeType,
    totalAmount,
    timestamp: new Date().toISOString(),
  });
}

export function trackClanCreated(clanId: string, clanName: string, code: string) {
  trackEvent('clan_league_created', {
    clanId,
    clanName,
    code,
    timestamp: new Date().toISOString(),
  });
}
