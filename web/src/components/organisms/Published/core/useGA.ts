import { useEffect } from "react";

import type { SceneProperty } from "@reearth/core/Map";

const isGa4TrackingId = (trackingId: string) => trackingId.startsWith("G-");
export const useGA = (sceneProperty: SceneProperty) => {
  const { enableGA, trackingId } = sceneProperty?.googleAnalytics || {};

  useEffect(() => {
    if (!enableGA || !trackingId) return;

    const loadGaModule = async () => {
      const ga = isGa4TrackingId(trackingId) ? await import("./ga4") : await import("./ga");
      ga.initialize(trackingId);
      ga.pageview(window.location.pathname);
    };

    loadGaModule();
  }, [enableGA, trackingId]);
};
