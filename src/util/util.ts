import { Args, Args3, Args2 } from "@reearth/types";

export const isPresent = <V>(v: V | undefined): v is V => typeof v !== "undefined";

export const partitionObject = <T extends {}, K extends keyof T>(
  obj: T,
  keys: K[],
): [Pick<T, K>, Omit<T, K>] => {
  const a: any = {};
  const b: any = {};
  for (const k of Object.keys(obj)) {
    if (keys.includes(k as K)) {
      a[k] = obj[k as K];
    } else {
      b[k] = obj[k as K];
    }
  }
  return [a, b];
};

export const bindFunc = <F extends (a: A, ...args: any[]) => any, A>(f?: F, a?: A) =>
  isPresent(f) && isPresent(a) ? (...args: Args<F>) => f(a, ...args) : undefined;

export const bindFunc2 = <F extends (a: A, b: B, ...args: any[]) => any, A, B>(
  f?: F,
  a?: A,
  b?: B,
) =>
  isPresent(f) && isPresent(a) && isPresent(b)
    ? (...args: Args2<F>) => f(a, b, ...args)
    : undefined;

export const bindFunc3 = <F extends (a: A, b: B, c: C, ...args: any[]) => any, A, B, C>(
  f?: F,
  a?: A,
  b?: B,
  c?: C,
) =>
  isPresent(f) && isPresent(a) && isPresent(b) && isPresent(c)
    ? (...args: Args3<F>) => f(a, b, c, ...args)
    : undefined;
