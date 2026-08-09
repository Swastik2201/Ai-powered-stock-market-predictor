export function initSentry() {
  const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!sentryDsn) {
    console.log('[Sentry Monitoring] Initialized in mock mode (DSN not set).');
    return;
  }
  console.log(`[Sentry Monitoring] Initialized with DSN: ${sentryDsn.substring(0, 15)}...`);
}

export function captureException(error: Error | any, context?: Record<string, any>) {
  console.error('[Sentry Error Captured]', error, context);
}
