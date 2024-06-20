import { useCallback, useLayoutEffect, useMemo, useRef } from "react";

import { Camera } from "@reearth/beta/utils/value";
import { ComputedFeature, ComputedLayer } from "@reearth/core";

import { useVisualizerCamera } from "./atoms";
import { BuiltinWidgets } from "./Crust";
import { getBuiltinWidgetOptions } from "./Crust/Widgets/Widget";

export default function useHooks({
  ownBuiltinWidgets,
  onCoreLayerSelect,
  currentCamera,
}: {
  ownBuiltinWidgets?: (keyof BuiltinWidgets)[];
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
    storyWrapperRef,
    visualizerCamera,
    handleCoreLayerSelect,
  };
}
