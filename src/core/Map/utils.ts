import { type RefObject, useCallback, useRef } from "react";

export function useGet<T>(value: T): () => T {
  const ref = useRef<T>(value);
  ref.current = value;
  return useCallback(() => ref.current, []);
}

export function wrapRef<T>(ref: RefObject<T>, keys: FunctionKeys<T>): WrappedRef<T> {
  return Object.fromEntries(
    (Object.keys(keys) as (keyof T)[]).map(k => {
      return [k, (...args: any[]) => (ref.current?.[k] as any)?.(...args)];
    }),
  ) as WrappedRef<T>;
}

export type FunctionKeys<T> = {
  [P in keyof T as T[P] extends (...args: any[]) => any ? P : never]: 1;
};

export type WrappedRef<T> = {
  [P in keyof T as T[P] extends (...args: any[]) => any ? P : never]: T[P] extends (
    ...args: infer A
  ) => infer R
    ? (...args: A) => R | undefined
    : never;
};
