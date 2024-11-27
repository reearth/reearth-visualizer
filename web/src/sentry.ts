import * as Sentry from "@sentry/browser";

type ReportError = { type?: string | undefined; message?: string | undefined };

export const initialize = () => {
  const { sentryDsn, sentryEnv } = window.REEARTH_CONFIG ?? {};
  if (sentryDsn) {
    Sentry.init({
      dsn: sentryDsn,
      environment: sentryEnv
    });
  }
};

export const reportError = (error: ReportError) => {
  Sentry.captureException(error);
};
