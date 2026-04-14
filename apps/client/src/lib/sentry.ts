
/**
 * Sentry Error Tracking Setup
 * 
 * Captures errors and performance data in production
 */
import * as Sentry from '@sentry/react';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

export function initSentry() {
  if (!SENTRY_DSN || import.meta.env.DEV) {
    console.warn('[Sentry] Skipping initialization - no DSN or in development');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: 0.1, // 10% of transactions
    // Session Replay
    replaysSessionSampleRate: 0.01, // 1% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% of error sessions
    // Environment
    environment: import.meta.env.MODE,
    release: import.meta.env.VITE_APP_VERSION || '1.0.0',
    // Before sending, filter out sensitive data
    beforeSend(event: any) {
      // Remove user IPs
      if (event.request) {
        delete event.request.headers?.['X-Forwarded-For'];
        delete event.request.headers?.['X-Real-Ip'];
      }
      return event;
    },
  });

  console.info('[Sentry] Initialized successfully');
}


export function captureException(error: Error, context?: Record<string, unknown>) {
  if (import.meta.env.DEV) {
    console.error('[Sentry] Would capture:', error, context);
    return;
  }
  Sentry.captureException(error, { extra: context });
}

export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  if (import.meta.env.DEV) {
    console.log(`[Sentry] ${level}:`, message);
    return;
  }
  Sentry.captureMessage(message, level);
}

export function setUser(user: { id: string; email?: string; username?: string } | null) {
  Sentry.setUser(user);
}

export function addBreadcrumb(breadcrumb: Sentry.Breadcrumb) {
  Sentry.addBreadcrumb(breadcrumb);
}
