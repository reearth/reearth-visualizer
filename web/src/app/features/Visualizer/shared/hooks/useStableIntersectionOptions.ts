import { useMemo } from "react";

/**
 * Hook to create stable IntersectionObserver options to prevent unnecessary re-renders
 */
export const useStableIntersectionOptions = (
  root: Element | null,
  threshold: number | number[] = 0.5,
  rootMargin = "0px"
): IntersectionObserverInit => {
  // Serialize threshold array to ensure stable comparison
  const thresholdKey = Array.isArray(threshold)
    ? threshold.join(",")
    : threshold;

  return useMemo(
    () => ({
      root,
      threshold,
      rootMargin
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [root, thresholdKey, rootMargin]
  );
};
