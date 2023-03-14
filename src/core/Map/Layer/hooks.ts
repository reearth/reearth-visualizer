import { useAtom } from "jotai";
import { isEqual, pick } from "lodash-es";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";

import {
  clearAllExpressionCaches,
  computeAtom,
  DataType,
  evalFeature,
  type Data,
} from "../../mantle";
import type { Atom, DataRange, Layer, ComputedLayer, ComputedFeature, Feature } from "../types";

export type { Atom as Atom } from "../types";

export const createAtom = computeAtom;

export type EvalFeature = (layer: Layer, feature: Feature) => ComputedFeature | undefined;

export default function useHooks({
  layer,
  atom,
  overrides,
  delegatedDataTypes,
  selected,
  selectedFeatureId,
}: {
  layer: Layer | undefined;
  atom: Atom | undefined;
  overrides?: Record<string, any>;
  delegatedDataTypes?: DataType[];
  selected?: boolean;
  selectedFeatureId?: string;
}) {
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

  const prevForceUpdatableData = useRef<Pick<Data, "csv" | "jsonProperties">>();
  useLayoutEffect(() => {
    const data = layer?.type === "simple" ? layer.data : undefined;
    const forceUpdatableData = pick(data, "csv", "jsonProperties");

    if (isEqual(forceUpdatableData, prevForceUpdatableData.current) || !data?.url) {
      return;
    }

    forceUpdateFeatures();

    prevForceUpdatableData.current = forceUpdatableData;
  }, [layer, forceUpdateFeatures]);

  // idleCallback is still experimental in ios
  const ctx = typeof window !== "undefined" ? window : global;
  const requestIdleCallbackShim = (
    callback: (arg0: { didTimeout: boolean; timeRemaining: () => number }) => void,
  ) => {
    const start = Date.now();
    return ctx.setTimeout(function () {
      callback({
        didTimeout: false,
        timeRemaining: function () {
          return Math.max(0, 12 - (Date.now() - start));
        },
      });
    });
  };
  const requestIdleCallback = ctx.requestIdleCallback || requestIdleCallbackShim;
  // Clear expression cache if layer is unmounted
  useEffect(
    () => () => {
      requestIdleCallback(() => {
        // This is a little heavy task, and not critical for main functionality, so we can run this at idle time.
        computedLayer?.originalFeatures.forEach(f => {
          clearAllExpressionCaches(
            computedLayer.layer.type === "simple" ? computedLayer.layer : undefined,
            f,
          );
        });
      });
    },
    [], // eslint-disable-line react-hooks/exhaustive-deps -- clear cache only when layer is unmounted
  );

  useSelectEvent({ layer, selected, computedLayer, selectedFeatureId });

  return {
    computedLayer,
    handleFeatureRequest: requestFetch,
    handleFeatureFetch: writeFeatures,
    handleComputedFeatureFetch: writeComputedFeatures,
    handleFeatureDelete: deleteFeatures,
    evalFeature,
  };
}

function useSelectEvent({
  layer,
  selected,
  computedLayer,
  selectedFeatureId,
}: {
  layer: Layer | undefined;
  selected: boolean | undefined;
  computedLayer?: ComputedLayer;
  selectedFeatureId?: string;
}) {
  const selectEvent = layer?.type === "simple" ? layer.events?.select : undefined;
  useEffect(() => {
    if (!selected || !selectEvent) return;
    if (selectEvent.openUrl) {
      const url = selectEvent.openUrl.urlKey
        ? (selectedFeatureId
            ? computedLayer?.features.find(f => f.id === selectedFeatureId)?.properties
            : computedLayer?.properties)?.[selectEvent.openUrl.urlKey]
        : selectEvent.openUrl.url;
      if (typeof url === "string" && url) {
        window.open(url, "_blank", "noreferrer");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]); // only selected
}
