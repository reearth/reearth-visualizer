import { useState, useEffect, useRef, useCallback } from "react";
import { easing, IEasingMap } from "ts-easing";

export type Easing = keyof IEasingMap;

const useTween = (e: Easing | ((t: number) => number), duration: number, dep: any) => {
  const first = useRef(false);
  const [v, setV] = useState(0);
  const data = useRef<{
    fn: (t: number) => number;
    startedAt: number;
    duration: number;
  }>();
  const timeout = useRef<number>();

  const cb = useCallback(() => {
    if (!data.current) return;
    const now = Date.now();
    const diff = now - data.current.startedAt;
    const nv = data.current.fn(diff / data.current.duration);
    setV(nv);
    if (diff < data.current.duration) {
      timeout.current = requestAnimationFrame(cb);
    } else {
      data.current = undefined;
      timeout.current = undefined;
    }
  }, []);

  useEffect(() => {
    if (first.current) {
      if (duration === 0) {
        setV(1);
        data.current = undefined;
        timeout.current = undefined;
        return;
      }
      data.current = {
        fn: typeof e === "function" ? e : easing[e],
        duration,
        startedAt: Date.now(),
      };
      setV(0);
      timeout.current = requestAnimationFrame(cb);
    }
    first.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dep, cb]);

  return v;
};

export default useTween;
