import { useRef, useState, useCallback, useEffect } from "react";
import { usePreviousDistinct } from "react-use";

export type Durations =
  | [number | null | undefined, number | null | undefined][]
  | (number | null | undefined)[];

export const useDelayedCount = (durations: Durations = []) => {
  const [mode, setMode] = useState(0);
  const prevMode = usePreviousDistinct(mode);
  const exit = useRef(false);
  const timeout = useRef<number>();

  const advanceMode = useCallback(() => {
    setMode(m => Math.max(0, Math.min(durations.length + 1, m + (exit.current ? -1 : 1))));
  }, [durations.length]);

  const startTransition = useCallback(
    (e: boolean, skipAnimation?: boolean) => {
      if (timeout.current) {
        clearTimeout(timeout.current);
        timeout.current = undefined;
      }

      if (skipAnimation) {
        setMode(e ? 0 : durations.length + 1);
        return;
      }

      exit.current = e;
      advanceMode();
    },
    [advanceMode, durations.length],
  );

  useEffect(() => {
    if (timeout.current !== undefined) {
      clearTimeout(timeout.current);
      timeout.current = undefined;
    }

    if (mode <= 0 || mode >= durations.length + 1) return;

    const next = durations?.[mode - 1];
    const duration = Array.isArray(next) ? next[exit.current ? 1 : 0] : next;

    timeout.current = window.setTimeout(() => {
      timeout.current = undefined;
      advanceMode();
    }, duration ?? 0);
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

  return [mode, prevMode, startTransition] as const;
};
