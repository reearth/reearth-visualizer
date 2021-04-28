import { useRef, useState, useCallback, useEffect } from "react";

export type Durations =
  | [number | null | undefined, number | null | undefined][]
  | (number | null | undefined)[];

export const useDelayedCount = (durations: Durations = []) => {
  const [mode, setMode] = useState(0);
  const prevMode = useRef(0);
  const exit = useRef(false);
  const timeout = useRef<number>();

  const advanceMode = useCallback(() => {
    setMode(Math.max(0, Math.min(durations.length, mode + (exit.current ? -1 : 1))));
  }, [durations.length, mode]);

  const startTransit = useCallback(
    (e: boolean) => {
      if (timeout.current || e ? mode <= 0 : mode >= durations.length) return;
      exit.current = e;
      advanceMode();
    },
    [advanceMode, durations.length, mode],
  );

  useEffect(() => {
    if (prevMode.current === mode) return;
    if (timeout.current !== undefined) {
      clearTimeout(timeout.current);
      timeout.current = undefined;
    }
    const nextMode = durations?.[prevMode.current - (exit.current ? 1 : 0)];
    const duration = Array.isArray(nextMode) ? nextMode[exit.current ? 1 : 0] : nextMode;
    prevMode.current = mode;
    if (!duration) {
      advanceMode();
      return;
    }
    timeout.current = window.setTimeout(() => {
      advanceMode();
      timeout.current = undefined;
    }, duration);
  }, [advanceMode, durations, mode]);

  // clear timeout on unmount
  useEffect(
    () => () => {
      if (timeout.current) {
        clearTimeout(timeout.current);
        timeout.current = undefined;
      }
    },
    [],
  );

  return [mode, prevMode.current, startTransit] as const;
};
