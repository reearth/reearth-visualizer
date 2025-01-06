import { Camera } from "@reearth/beta/utils/value";
import { MapRef, ViewerProperty } from "@reearth/core";
import { config } from "@reearth/services/config";
import {
  MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

export default ({
  visualizerRef
}: {
  visualizerRef: MutableRefObject<MapRef | null>;
}) => {
  const [ready, setReady] = useState(false);
  const [currentCamera, setCurrentCamera] = useState<Camera | undefined>(
    undefined
  );

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
