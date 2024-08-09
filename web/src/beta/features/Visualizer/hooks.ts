import { useCallback, useLayoutEffect, useMemo, useRef } from "react";

import { Camera } from "@reearth/beta/utils/value";
import { ViewerProperty, ComputedFeature, ComputedLayer } from "@reearth/core";

import { useVisualizerCamera } from "./atoms";
import { BuiltinWidgets } from "./Crust";
import { getBuiltinWidgetOptions } from "./Crust/Widgets/Widget";
import { useOverriddenProperty } from "./utils";

export default function useHooks({
  ownBuiltinWidgets,
  viewerProperty,
  onCoreLayerSelect,
  currentCamera,
}: {
  ownBuiltinWidgets?: (keyof BuiltinWidgets)[];
  viewerProperty?: ViewerProperty;
  onCoreLayerSelect?: (
    layerId: string | undefined,
    layer: ComputedLayer | undefined,
    feature: ComputedFeature | undefined,
  ) => void;
  currentCamera?: Camera;
}) {
  const shouldRender = useMemo(() => {
    const shouldWidgetAnimate = ownBuiltinWidgets?.some(
      id => !!getBuiltinWidgetOptions(id).animation,
    );
    return shouldWidgetAnimate;
  }, [ownBuiltinWidgets]);

  const [overriddenViewerProperty, overrideViewerProperty] = useOverriddenProperty(viewerProperty);

  const storyWrapperRef = useRef<HTMLDivElement>(null);

  const handleCoreLayerSelect = useCallback(
    async (
      layerId: string | undefined,
      layer: (() => Promise<ComputedLayer | undefined>) | undefined,
      feature: ComputedFeature | undefined,
    ) => {
      onCoreLayerSelect?.(layerId, await layer?.(), feature);
    },
    [onCoreLayerSelect],
  );

  const [visualizerCamera, setVisualizerCamera] = useVisualizerCamera();
  useLayoutEffect(() => {
    setVisualizerCamera(currentCamera);
  }, [currentCamera, setVisualizerCamera]);

  return {
    shouldRender,
    overriddenViewerProperty,
    overrideViewerProperty,
    storyWrapperRef,
    visualizerCamera,
    handleCoreLayerSelect,
  };
}
