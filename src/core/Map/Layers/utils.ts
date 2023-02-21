import { isArray, isObject } from "lodash-es";

export const deepAssign = <O extends Record<string, any>>(obj: O, src: O) => {
  return Object.fromEntries(
    Object.entries({ ...src, ...obj })
      .map(([k, v]): [string, any] | undefined => {
        const srcV: unknown = src[k];
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
