import * as Sentry from "@sentry/browser";

export const initialize = () => {
  const { sentryDsn, sentryEnv } = window.REEARTH_CONFIG ?? {};
  if (sentryDsn) {
    Sentry.init({
      dsn: sentryDsn,
      environment: sentryEnv,
    });
  }
};

export const reportError = (error: any) => {
  Sentry.captureException(error);
};
