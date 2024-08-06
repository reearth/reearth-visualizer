import { cloneDeep, mergeWith, omit } from "lodash-es";
import { useCallback, useMemo, useState } from "react";

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

export function mergeProperty(a: any, b: any) {
  const a2 = cloneDeep(a);
  return mergeWith(
    a2,
    b,
    (s: any, v: any, _k: string | number | symbol, _obj: any, _src: any, stack: { size: number }) =>
      stack.size > 0 || Array.isArray(v) ? v ?? s : undefined,
  );
}
