const ctx = typeof window !== "undefined" ? window : global;
const requestIdleCallbackShim = (
  callback: (arg0: { didTimeout: boolean; timeRemaining: () => number }) => void,
  _options?: IdleRequestOptions,
) => {
  const start = Date.now();
  return ctx.setTimeout(function () {
    callback({
      didTimeout: false,
      timeRemaining: function () {
        return Math.max(0, 12 - (Date.now() - start));
      },
    });
  });
};
const requestIdleCallback = ctx.requestIdleCallback || requestIdleCallbackShim;

// This is used to schedule heavy required task at idle time.
// But this task is required to advance process, so we want to execute it as fast as possible.
export const requestIdleCallbackWithRequiredWork = (cb: () => void) => {
  requestIdleCallback(cb, { timeout: 1 });
};
