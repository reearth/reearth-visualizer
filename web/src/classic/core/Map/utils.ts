import { cloneDeep, mergeWith, omit } from "lodash-es";
import { type RefObject, useCallback, useRef, useState, useMemo } from "react";

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

export function mergeProperty(a: any, b: any) {
  const a2 = cloneDeep(a);
  return mergeWith(
    a2,
    b,
    (s: any, v: any, _k: string | number | symbol, _obj: any, _src: any, stack: { size: number }) =>
      stack.size > 0 || Array.isArray(v) ? v ?? s : undefined,
  );
}

export function useOverriddenProperty<T extends {}>(
  property: T | undefined,
): [T, (pluginId: string, property: T) => void] {
  const [overriddenProperties, setOverrideProperty] = useState<{
    [pluginId: string]: any;
  }>({});
  const { overriddenPropertyCommon, overriddenProperty } = useMemo(() => {
    const { "": overriddenPropertyCommon, ...overriddenProperty } = overriddenProperties;
    return { overriddenPropertyCommon, overriddenProperty };
  }, [overriddenProperties]);

  const overrideProperty = useCallback((pluginId: string, property: any) => {
    setOverrideProperty(p => (property ? { ...p, [pluginId || ""]: property } : omit(p, pluginId)));
  }, []);

  const mergedProperty = useMemo(() => {
    return [overriddenPropertyCommon, ...Object.values(overriddenProperty)].reduce(
      (p, v) => mergeProperty(p, v),
      property,
    );
  }, [property, overriddenPropertyCommon, overriddenProperty]);

  return [mergedProperty, overrideProperty];
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

export type Undefinable<T extends object> = {
  [K in keyof T]: T[K] extends object
    ? T[K] extends (...args: any[]) => any
      ? T[K] | undefined
      : Undefinable<T[K]> | undefined
    : T[K] | undefined;
};
