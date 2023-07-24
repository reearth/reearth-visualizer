import { useCallback, useEffect, useRef } from "react";

export const useImmutableFunction = <T>(v: T) => {
  const valueRef = useRef(v);
  const immutableFunc = useCallback(() => valueRef.current, []);
  useEffect(() => {
    valueRef.current = v;
  }, [v]);
  return immutableFunc;
};
