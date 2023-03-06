import { isArray, isObject } from "lodash-es";

import { LazyLayer } from "./hooks";
import { layerKeys, computedLayerKeys } from "./keys";

export const deepAssign = <O extends Record<string, any>>(obj: O, src: O) => {
  return Object.fromEntries(
    Object.entries({ ...src, ...obj })
      .map(([k, v]): [string, any] | undefined => {
        const srcV: unknown = src[k];
        if (Object.hasOwn(src, k) && (srcV === undefined || srcV === null)) {
          return undefined;
        }

        if (srcV === undefined) {
          return [k, v];
        }

        if (isArray(srcV)) {
          return [k, srcV];
        }

        if (
          isObject(v) &&
          Object.keys(v).length !== 0 &&
          isObject(srcV) &&
          Object.keys(srcV).length !== 0
        ) {
          return [k, deepAssign(v, srcV)];
        }

        if (v !== srcV) {
          return [k, srcV];
        }

        return [k, v];
      })
      .filter((v): v is [string, any] => !!v),
  ) as O;
};

export const copyLazyLayers = (layers: LazyLayer[] | undefined) => {
  return layers?.map(l => {
    return copyLazyLayer(l);
  });
};

export const copyLazyLayer = (l: LazyLayer | undefined) => {
  return layerKeys.reduce((res, key) => {
    if (key === "computed") {
      res[key] = computedLayerKeys.reduce((computedRes, computedKey) => {
        computedRes[computedKey] = l?.[key as keyof LazyLayer][computedKey];
        return computedRes;
      }, {} as Record<string, any>);
      return res;
    }
    res[key] = l?.[key as keyof LazyLayer];
    return res;
  }, {} as Record<string, any>) as LazyLayer;
};
