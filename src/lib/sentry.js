import * as Sentry from '@sentry/browser';

export function initSentry(dsn, env) {
  if (!dsn) return;
  Sentry.init({
    dsn,
    environment: env || 'production',
    release: process.env.NEXT_PUBLIC_RELEASE || undefined
  });
}
