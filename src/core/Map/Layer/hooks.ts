import { useAtom } from "jotai";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";

import {
  clearAllExpressionCaches,
  computeAtom,
  DataType,
  type Atom,
  evalFeature,
  ComputedFeature,
} from "../../mantle";
import type { DataRange, Feature, Layer } from "../../mantle";

export type { Atom as Atoms } from "../../mantle";

export const createAtom = computeAtom;

export type EvalFeature = (layer: Layer, feature: Feature) => ComputedFeature | undefined;

export default function useHooks(
  layer: Layer | undefined,
  atom: Atom | undefined,
  overrides?: Record<string, any>,
  delegatedDataTypes?: DataType[],
) {
  const [computedLayer, set] = useAtom(useMemo(() => atom ?? createAtom(), [atom]));
  const writeFeatures = useCallback(
    (features: Feature[]) => set({ type: "writeFeatures", features }),
    [set],
  );
  const writeComputedFeatures = useCallback(
    (feature: Feature[], computed: ComputedFeature[]) =>
      set({ type: "writeComputedFeatures", value: { feature, computed } }),
    [set],
  );
  const requestFetch = useCallback(
    (range: DataRange) => set({ type: "requestFetch", range }),
    [set],
  );
  const deleteFeatures = useCallback(
    (features: string[]) => set({ type: "deleteFeatures", features }),
    [set],
  );
  const forceUpdateFeatures = useCallback(() => set({ type: "forceUpdateFeatures" }), [set]);

  useLayoutEffect(() => {
    set({ type: "updateDelegatedDataTypes", delegatedDataTypes: delegatedDataTypes ?? [] });
  }, [delegatedDataTypes, set]);

  useLayoutEffect(() => {
    set({
      type: "override",
      overrides,
    });
  }, [set, overrides]);

  useLayoutEffect(() => {
    set({
      type: "setLayer",
      layer:
        typeof layer?.visible === "undefined" || layer?.type === null || layer?.type
          ? layer
          : undefined,
    });
  }, [layer, set]);

  const intervalId = useRef<number>();
  useLayoutEffect(() => {
    const data = layer?.type === "simple" ? layer.data : undefined;

    if (!data?.updateInterval || !data?.url) {
      return;
    }

    intervalId.current = window.setInterval(forceUpdateFeatures, data.updateInterval);

    return () => {
      if (intervalId.current) {
        clearInterval(intervalId.current);
      }
    };
  }, [layer, forceUpdateFeatures]);

  // Clear expression cache if layer is unmounted
  useEffect(
    () => () => {
      window.requestIdleCallback(() => {
        // This is a little heavy task, and not critical for main functionality, so we can run this at idle time.
        computedLayer?.originalFeatures.forEach(f => {
          clearAllExpressionCaches(
            computedLayer.layer.type === "simple" ? computedLayer.layer : undefined,
            f,
          );
        });
      });
    },
    [computedLayer],
  );

  return {
    computedLayer,
    handleFeatureRequest: requestFetch,
    handleFeatureFetch: writeFeatures,
    handleComputedFeatureFetch: writeComputedFeatures,
    handleFeatureDelete: deleteFeatures,
    evalFeature,
  };
}
