import { Feature, MultiPolygon, Polygon } from "geojson";
import { MutableRefObject, useCallback, useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { MapRef } from "@reearth/beta/lib/core/Crust/types";
import { SketchType } from "@reearth/beta/lib/core/Map";
import { NLSLayer } from "@reearth/services/api/layersApi/utils";

import { Tab } from "../Navbar";

import { LayerConfigUpdateProps } from "./useLayers";

export type InteractionModeType = "default" | "sketch";
export type SketchToolType =
  | "marker"
  | "polyline"
  | "circle"
  | "rectangle"
  | "free-style"
  | "circle-extruded"
  | "rectangle-extruded"
  | "free-style-extruded"
  | undefined;

type Props = {
  tab: Tab;
  selectedLayer: NLSLayer | undefined;
  visualizerRef: MutableRefObject<MapRef | null>;
  handleLayerConfigUpdate: (inp: LayerConfigUpdateProps) => Promise<void>;
};

const tool2Type = (tool: SketchToolType): [SketchType, boolean] | [undefined, undefined] => {
  switch (tool) {
    case "marker":
      return ["marker", false];
    case "polyline":
      return ["polyline", false];
    case "circle":
      return ["circle", false];
    case "rectangle":
      return ["rectangle", false];
    case "free-style":
      return ["polygon", false];
    case "circle-extruded":
      return ["circle", true];
    case "rectangle-extruded":
      return ["rectangle", true];
    case "free-style-extruded":
      return ["polygon", true];
    default:
      return [undefined, undefined];
  }
};

export default ({ tab, selectedLayer, visualizerRef, handleLayerConfigUpdate }: Props) => {
  const [interactionMode, setInteractionMode] = useState<InteractionModeType>("default");

  const [selectedSketchTool, selectSketchTool] = useState<SketchToolType>(undefined);

  const sketchModeDisabled = useMemo(
    () => !selectedLayer?.config?.data.isSketchLayer,
    [selectedLayer],
  );

  const handleInteractionModeChange = useCallback((mode: InteractionModeType) => {
    setInteractionMode(mode);
  }, []);

  const handleSelectedSketchToolChange = useCallback(
    (type: SketchToolType) => {
      selectSketchTool(type);
      const [sketchType, extruded] = tool2Type(type);
      if (!sketchType) return;
      console.log(visualizerRef.current?.sketch);
      visualizerRef.current?.sketch?.enable?.(true);
      console.log("set type", sketchType);
      visualizerRef.current?.sketch?.setType?.(sketchType);
      // TODO: handle extruded
      console.log("extruded", extruded);
    },
    [visualizerRef],
  );

  useEffect(() => {
    if (interactionMode !== "sketch") {
      selectSketchTool(undefined);
      visualizerRef.current?.sketch?.enable?.(false);
    }
  }, [interactionMode, visualizerRef]);

  useEffect(() => {
    setInteractionMode("default");
  }, [tab]);

  useEffect(() => {
    if (sketchModeDisabled) {
      setInteractionMode("default");
    }
  }, [sketchModeDisabled]);

  const handleFeatureCreate = useCallback(
    (feature: Feature<Polygon | MultiPolygon> | null) => {
      console.log("feature created", feature);
      setInteractionMode("default");
      if (!selectedLayer?.id) return;
      console.log(selectedLayer.config);
      handleLayerConfigUpdate({
        layerId: selectedLayer.id,
        config: {
          data: {
            ...selectedLayer.config?.data,
            value: {
              type: "FeatureCollection",
              features: [
                ...(selectedLayer.config?.data?.value?.features ?? []),
                { ...feature, id: uuidv4() },
              ],
            },
          },
        },
      });
    },
    [selectedLayer, handleLayerConfigUpdate],
  );

  useEffect(() => {
    visualizerRef.current?.sketch?.onFeatureCreate?.(handleFeatureCreate);
  }, [visualizerRef, handleFeatureCreate]);

  return {
    interactionMode,
    sketchModeDisabled,
    selectedSketchTool,
    handleInteractionModeChange,
    handleSelectedSketchToolChange,
  };
};
