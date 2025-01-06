import { Camera } from "@reearth/beta/utils/value";
import { MapRef, ViewerProperty } from "@reearth/core";
import { config } from "@reearth/services/config";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export default () => {
  // Refrence: hooks of Editor/Visualizer/hooks.ts and Publish/hooks.ts
  const visualizerRef = useRef<MapRef | null>(null);
  console.log("visualizerRef", visualizerRef);
  const [ready, setReady] = useState(false);
  const [currentCamera, setCurrentCamera] = useState<Camera | undefined>(
    undefined
  );

  const handleIsVisualizerUpdate = useCallback(
    (value: boolean) => setReady(value),
    [setReady]
  );

  const handleFlyTo = useMemo(() => {
    console.log("handleFlyTo visualizerRef", visualizerRef.current);
    return (layerId: string, options?: Record<string, string | number>) => {
      if (visualizerRef.current) {
        visualizerRef.current.engine.flyTo(layerId, options);
      }
    };
  }, [visualizerRef]);

  const engineMeta = useMemo(
    () => ({
      cesiumIonAccessToken: config()?.cesiumIonAccessToken
    }),
    []
  );

  const viewerProperty: ViewerProperty = useMemo(
    () => ({
      tiles: [
        {
          id: "default",
          type: "default"
        }
      ]
    }),
    []
  );

  useEffect(() => {
    setReady(true);
  }, []);

  return {
    currentCamera,
    engineMeta,
    handleFlyTo,
    handleIsVisualizerUpdate,
    ready,
    setCurrentCamera,
    viewerProperty,
    visualizerRef
  };
};
