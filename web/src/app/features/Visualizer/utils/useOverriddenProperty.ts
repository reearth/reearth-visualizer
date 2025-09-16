import { cloneDeep, mergeWith, omit } from "lodash-es";
import { useCallback, useMemo, useState } from "react";

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
} & Record<string, unknown>;

export function useOverriddenProperty<T extends object>(
  property: T | undefined
): [T | undefined, (pluginId: string, property: DeepPartial<T> | undefined) => void] {
  const [overriddenProperties, setOverrideProperty] = useState<
    Record<string, DeepPartial<T>>
  >({});
  const { overriddenPropertyCommon, overriddenProperty } = useMemo(() => {
    const { "": overriddenPropertyCommon, ...overriddenProperty } =
      overriddenProperties;
    return { overriddenPropertyCommon, overriddenProperty };
  }, [overriddenProperties]);

  const overrideProperty = useCallback((pluginId: string, property: DeepPartial<T> | undefined) => {
    setOverrideProperty((p) =>
      property ? { ...p, [pluginId || ""]: property } : omit(p, pluginId)
    );
  }, []);

  const mergedProperty = useMemo(() => {
    return [
      overriddenPropertyCommon,
      ...Object.values(overriddenProperty)
    ].reduce((p, v) => mergeProperty(p, v), property);
  }, [property, overriddenPropertyCommon, overriddenProperty]);

  return [mergedProperty, overrideProperty];
}

export function mergeProperty<T = unknown>(
  a: T | undefined,
  b: DeepPartial<T> | undefined
): T | undefined {
  const a2 = cloneDeep(a);
  return mergeWith(
    a2,
    b,
    (
      s: unknown,
      v: unknown,
      _k: string | number | symbol,
      _obj: unknown,
      _src: unknown,
      stack: { size: number }
    ) => (stack.size > 0 || Array.isArray(v) ? (v ?? s) : undefined)
  );
}
