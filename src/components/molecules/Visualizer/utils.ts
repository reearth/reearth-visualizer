import { cloneDeep, mergeWith, omit } from "lodash";
import { useCallback, useMemo, useRef, useState } from "react";

export function mergeProperty(a: any, b: any) {
  const a2 = cloneDeep(a);
  return mergeWith(
    a2,
    b,
    (s: any, v: any, _k: string | number | symbol, _obj: any, _src: any, stack: { size: number }) =>
      stack.size > 0 || Array.isArray(v) ? v ?? s : undefined,
  );
}

export function useOverriddenProperty<T = any>(
  property: T,
): [T, (pluginId: string, property: T) => void] {
  const [{ "": overriddenPropertyCommon, ...overriddenProperty }, setOverrideProperty] = useState<{
    [pluginId: string]: any;
  }>({});

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

export function useGet<T>(value: T): () => T {
  const ref = useRef<T>(value);
  ref.current = value;
  return useCallback(() => ref.current, []);
}
