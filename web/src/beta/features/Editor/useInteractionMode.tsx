import { Feature, MultiPolygon, Polygon, Point, LineString } from "geojson";
import { MutableRefObject, useCallback, useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { InteractionModeType, MapRef } from "@reearth/beta/lib/core/Crust/types";
import { SketchType } from "@reearth/beta/lib/core/Map/Sketch/types";
import { NLSLayer } from "@reearth/services/api/layersApi/utils";

import { Tab } from "../Navbar";

import { LayerConfigUpdateProps } from "./useLayers";

type Props = {
  tab: Tab;
  selectedLayer: NLSLayer | undefined;
  visualizerRef: MutableRefObject<MapRef | null>;
  handleLayerConfigUpdate: (inp: LayerConfigUpdateProps) => Promise<void>;
};

export default ({ tab, selectedLayer, visualizerRef, handleLayerConfigUpdate }: Props) => {
  const [interactionMode, setInteractionMode] = useState<InteractionModeType>("default");

  const [selectedSketchTool, selectSketchTool] = useState<SketchType | undefined>(undefined);
  const currentTypeRef = useRef<SketchType | undefined>(selectedSketchTool);
  currentTypeRef.current = selectedSketchTool;

  const handleInteractionModeChange = useCallback((mode: InteractionModeType) => {
    setInteractionMode(mode);
  }, []);

  const handleSelectedSketchToolChange = useCallback(
    (type: SketchType) => {
      selectSketchTool(type);
      if (!type) return;
      visualizerRef.current?.sketch?.setType?.(type);
    },
    [visualizerRef],
  );

  const handleFeatureCreate = useCallback(
    async (feature: Feature<Polygon | MultiPolygon | Point | LineString> | null) => {
      selectSketchTool(undefined);
      // TODO: Create a new layer if there is no selected sketch layer
      if (!selectedLayer?.id || !selectedLayer.config?.data?.isSketchLayer) return;
      const featureId = uuidv4();
      await handleLayerConfigUpdate({
        layerId: selectedLayer.id,
        config: {
          data: {
            ...selectedLayer.config?.data,
            value: {
              type: "FeatureCollection",
              features: [
                ...(selectedLayer.config?.data?.value?.features ?? []),
                { ...feature, id: featureId },
              ],
            },
          },
        },
      });
      requestAnimationFrame(() => {
        visualizerRef.current?.layers.selectFeatures([
          { layerId: selectedLayer.id, featureId: [featureId] },
        ]);
      });
      // setTimeout(() => {
      //   visualizerRef.current?.layers.selectFeatures([
      //     { layerId: selectedLayer.id, featureId: [featureId] },
      //   ]);
      // }, 1000);
    },
    [selectedLayer, visualizerRef, handleLayerConfigUpdate],
  );

  const handleTypeChange = useCallback(
    (type: SketchType | undefined) => {
      if (type !== currentTypeRef.current) {
        selectSketchTool(type);
      }
    },
    [currentTypeRef],
  );

  useEffect(() => {
    visualizerRef.current?.sketch?.onFeatureCreate?.(handleFeatureCreate);
    visualizerRef.current?.sketch?.onTypeChange?.(handleTypeChange);
  }, [visualizerRef, handleFeatureCreate, handleTypeChange]);

  useEffect(() => {
    if (interactionMode !== "sketch") {
      selectSketchTool(undefined);
    }
  }, [interactionMode, visualizerRef]);

  useEffect(() => {
    setInteractionMode("default");
  }, [tab]);

  return {
    interactionMode,
    selectedSketchTool,
    handleInteractionModeChange,
    handleSelectedSketchToolChange,
  };
};
