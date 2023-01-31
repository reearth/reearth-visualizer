import { useEffect } from "react";
import { initialize, pageview } from "react-ga";

import type { SceneProperty } from "@reearth/core/Map";

export const useGA = (sceneProperty: SceneProperty) => {
  // GA
  const { enableGA, trackingId } = sceneProperty?.googleAnalytics || {};

  useEffect(() => {
    if (!enableGA || !trackingId) return;
    initialize(trackingId);
    pageview(window.location.pathname);
  }, [enableGA, trackingId]);
};
