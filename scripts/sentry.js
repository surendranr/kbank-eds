import * as Sentry from '@sentry/browser';

const DEFAULT_DSN = '';

function getConfiguredValue(key) {
  const value = window[key] || window[`__${key}__`] || '';
  return String(value).trim();
}

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function initSentry() {
  const dsn = getConfiguredValue('SENTRY_DSN') || DEFAULT_DSN;
  const environment = getConfiguredValue('SENTRY_ENVIRONMENT') || window.location.hostname || 'localhost';
  const release = getConfiguredValue('SENTRY_RELEASE') || window.hlx?.version || 'local';
  const tracesSampleRate = toNumber(getConfiguredValue('SENTRY_TRACES_SAMPLE_RATE'), 1.0);
  const replaysSessionSampleRate = toNumber(getConfiguredValue('SENTRY_REPLAYS_SESSION_SAMPLE_RATE'), 0.1);
  const replaysOnErrorSampleRate = toNumber(getConfiguredValue('SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE'), 1.0);

  if (!dsn) {
    return false;
  }

  Sentry.init({
    dsn,
    environment,
    release,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    tracesSampleRate,
    replaysSessionSampleRate,
    replaysOnErrorSampleRate,
    enabled: true,
    beforeSend(event) {
      const exceptionMessage = event.exception?.values?.[0]?.value || '';
      if (/ResizeObserver loop limit exceeded|Script error/i.test(exceptionMessage)) {
        return null;
      }
      return event;
    },
  });

  const params = new URLSearchParams(window.location.search);
  if (params.get('sentry-test') === '1') {
    Sentry.captureException(new Error('Sentry test exception from QA'));
  }

  return true;
}
