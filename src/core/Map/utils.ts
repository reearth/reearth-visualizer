import { useCallback, useRef } from "react";

export function useGet<T>(value: T): () => T {
  const ref = useRef<T>(value);
  ref.current = value;
  return useCallback(() => ref.current, []);
}
