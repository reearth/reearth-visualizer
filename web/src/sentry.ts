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

export const reportError = (errors: ReportError[]) => {
  errors.forEach((error) => {
    if (error instanceof Error) {
      Sentry.captureException(error);
    } else {
      Sentry.captureException(
        new Error(
          `${error.type || "Unknown"}: ${error.message || "No message provided"}`
        )
      );
    }
  });
};
