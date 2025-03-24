import { ViewerProperty } from "@reearth/beta/features/Editor/Visualizer/type";
import { Camera } from "@reearth/beta/utils/value";
import { MapRef } from "@reearth/core";
import { config } from "@reearth/services/config";
import {
  MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

export default ({
  visualizerRef,
  enabledVisualizer
}: {
  visualizerRef: MutableRefObject<MapRef | null>;
  enabledVisualizer: boolean;
}) => {
  const [ready, setReady] = useState(false);
  const [currentCamera, setCurrentCamera] = useState<Camera | undefined>(
    undefined
  );

  useEffect(() => {
    if (!enabledVisualizer) {
      setCurrentCamera(undefined);
    }
  }, [enabledVisualizer]);

  const handleIsVisualizerUpdate = useCallback(
    (value: boolean) => setReady(value),
    [setReady]
  );

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
    handleIsVisualizerUpdate,
    ready,
    setCurrentCamera,
    viewerProperty,
    visualizerRef
  };
};
