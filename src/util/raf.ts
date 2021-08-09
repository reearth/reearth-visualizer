import { easing as tweenEasing, IEasingMap } from "ts-easing";

export type Easing = keyof IEasingMap;

export function interval(callback: (t: number) => boolean, delay?: number): () => void {
  let prev = 0;
  let raf = 0;
  let to = 0;

  const cb = () => {
    if (callback(prev === 0 ? 0 : Date.now() - prev)) {
      raf = window.requestAnimationFrame(cb);
    }
    if (prev === 0) {
      prev = Date.now();
    }
  };

  if (typeof delay === "number") {
    to = window.setTimeout(cb, delay);
  } else {
    raf = window.requestAnimationFrame(cb);
  }

  return () => {
    window.clearTimeout(to);
    window.cancelAnimationFrame(raf);
  };
}

export function intervalDuring(
  callback: (time: number) => void,
  duration: number,
  delay?: number,
): () => void {
  if (duration < 0) return () => {};
  return interval(d => {
    const t = Math.min(1, duration === 0 ? 1 : d / duration);
    callback(t);
    return t < 1;
  }, delay);
}

export function tweenInterval(
  callback: (v: number, t: number) => void,
  easing: Easing | ((t: number) => number),
  duration: number,
  delay?: number,
): () => void {
  const e = typeof easing === "function" ? easing : tweenEasing[easing];
  return intervalDuring(
    d => {
      callback(e(d), d);
    },
    duration,
    delay,
  );
}
