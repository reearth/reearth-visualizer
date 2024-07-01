import { useEffect, useMemo, useRef, useState } from "react";

import { Camera } from "@reearth/beta/utils/value";
import { MapRef } from "@reearth/core";
import { config } from "@reearth/services/config";

export default () => {
  // Refrence: hooks of Editor/Visualizer/hooks.ts and Publish/hooks.ts
  const visualizerRef = useRef<MapRef | null>(null);
  const [ready, setReady] = useState(false);
  const [currentCamera, setCurrentCamera] = useState<Camera | undefined>(undefined);

  const engineMeta = useMemo(
    () => ({
      cesiumIonAccessToken: config()?.cesiumIonAccessToken,
    }),
    [],
  );

  const sceneProperty = useMemo(
    () => ({
      tiles: [
        {
          id: "default",
          type: "default",
        },
      ],
    }),
    [],
  );

  useEffect(() => {
    setReady(true);
  }, []);

  return {
    visualizerRef,
    sceneProperty,
    ready,
    engineMeta,
    currentCamera,
    setCurrentCamera,
  };
};
