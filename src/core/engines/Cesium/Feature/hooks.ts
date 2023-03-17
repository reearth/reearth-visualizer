import { pick } from "lodash-es";
import { useMemo } from "react";

export const usePick = <T extends object, U extends keyof T>(
  o: T | undefined | null,
  fields: readonly U[],
): Pick<T, U> | undefined => {
  const p = useMemo(() => (o ? pick(o, fields) : undefined), [o, fields]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => p, [JSON.stringify(p)]);
};
