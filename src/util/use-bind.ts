import { OmitFunc, OmitFunc2, OmitFunc3 } from "@reearth/types";
import { mapValues } from "lodash-es";
import { useMemo } from "react";
import { isPresent } from "./util";

export const useBind = <P extends { [key in string]?: (a: A, ...args: any) => any }, A>(
  p: P,
  a?: A,
): { [K in keyof P]?: OmitFunc<NonNullable<P[K]>> } => {
  return mapValues(p, f => {
    // eslint-disable-next-line react-hooks/rules-of-hooks, react-hooks/exhaustive-deps
    return useMemo(() => (f && isPresent(a) ? (...args) => f(a, ...args) : undefined), [f, a]);
  });
};

export const useBind2 = <P extends { [key in string]?: (a: A, b: B, ...args: any) => any }, A, B>(
  p: P,
  a?: A,
  b?: B,
): { [K in keyof P]?: OmitFunc2<NonNullable<P[K]>> } => {
  return mapValues(p, f => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useMemo(
      () => (f && isPresent(a) && isPresent(b) ? (...args) => f(a, b, ...args) : undefined),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [f, a, b],
    );
  });
};

export const useBind3 = <
  P extends { [key in string]?: (a: A, b: B, ...args: any) => any },
  A,
  B,
  C,
>(
  p: P,
  a?: A,
  b?: B,
  c?: C,
): { [K in keyof P]?: OmitFunc3<NonNullable<P[K]>> } => {
  return mapValues(p, f => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useMemo(
      () =>
        f && isPresent(a) && isPresent(b) && isPresent(c)
          ? (...args) => f(a, b, c, ...args)
          : undefined,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [f, a, b, c],
    );
  });
};
