import { MutableRefObject, useCallback, useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { MapRef } from "@reearth/beta/lib/core/Crust/types";
import { SketchFeature, SketchType } from "@reearth/beta/lib/core/Map/Sketch/types";
import { NLSLayer } from "@reearth/services/api/layersApi/utils";

import { Tab } from "../Navbar";

import { LayerConfigUpdateProps } from "./useLayers";

type Props = {
  tab: Tab;
  nlsLayers: NLSLayer[];
  selectedLayer: NLSLayer | undefined;
  visualizerRef: MutableRefObject<MapRef | null>;
  handleLayerConfigUpdate: (inp: LayerConfigUpdateProps) => Promise<void>;
};

export default ({
  tab,
  nlsLayers,
  selectedLayer,
  visualizerRef,
  handleLayerConfigUpdate,
}: Props) => {
  const [sketchType, setSketchType] = useState<SketchType | undefined>(undefined);

  const pendingSketchSelectionRef = useRef<{ layerId: string; featureId: string } | undefined>(
    undefined,
  );

  const handleSketchTypeChange = useCallback(
    (type: SketchType | undefined, from: "editor" | "plugin" = "editor") => {
      setSketchType(type);
      if (from === "editor") visualizerRef.current?.sketch?.setType?.(type);
    },
    [visualizerRef],
  );

  const handleSketchFeatureCreate = useCallback(
    async (feature: SketchFeature | null) => {
      // TODO: create a new layer if there is no selected sketch layer
      if (!selectedLayer?.id || !selectedLayer.config?.data?.isSketchLayer) return;
      const featureId = uuidv4();
      // TODO: support custom properties
      const customProperties = {};
      await handleLayerConfigUpdate({
        layerId: selectedLayer.id,
        config: {
          data: {
            ...selectedLayer.config?.data,
            value: {
              type: "FeatureCollection",
              features: [
                ...(selectedLayer.config?.data?.value?.features ?? []),
                {
                  ...feature,
                  id: featureId,
                  properties: { ...feature?.properties, ...customProperties },
                },
              ],
            },
          },
        },
      });
      pendingSketchSelectionRef.current = {
        layerId: selectedLayer.id,
        featureId,
      };
    },
    [selectedLayer, handleLayerConfigUpdate],
  );

  useEffect(() => {
    // Workaround: Delay 2 frames to ensure the computed layer & feature can be found.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (pendingSketchSelectionRef.current) {
          visualizerRef.current?.layers.selectFeature(
            pendingSketchSelectionRef.current.layerId,
            pendingSketchSelectionRef.current.featureId,
          );
          pendingSketchSelectionRef.current = undefined;
        }
      });
    });
  }, [nlsLayers, pendingSketchSelectionRef, visualizerRef]);

  useEffect(() => {
    setSketchType(undefined);
  }, [tab]);

  return {
    sketchType,
    handleSketchTypeChange,
    handleSketchFeatureCreate,
  };
};
