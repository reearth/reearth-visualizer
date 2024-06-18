import { createContext, useContext, ReactNode } from "react";

import { AreaSize } from "@reearth/beta/ui/layout";
import { Camera } from "@reearth/beta/utils/value";
import { FlyTo, SketchType } from "@reearth/core";
import { NLSLayer } from "@reearth/services/api/layersApi/utils";
import { LayerStyle } from "@reearth/services/api/layerStyleApi/utils";
import { Item } from "@reearth/services/api/propertyApi/utils";
import { Scene } from "@reearth/services/api/sceneApi";

import {
  LayerConfigUpdateProps,
  LayerNameUpdateProps,
  LayerVisibilityUpdateProps,
  SelectedLayer,
} from "../hooks/useLayers";
import {
  LayerStyleAddProps,
  LayerStyleNameUpdateProps,
  LayerStyleValueUpdateProps,
} from "../hooks/useLayerStyles";
import { GeoJsonFeatureUpdateProps } from "../hooks/useSketch";

interface MapPageContextType {
  onVisualizerResize?: (props: AreaSize) => void;
  scene?: Scene;
  selectedSceneSetting?: string;
  onSceneSettingSelect: (groupId: string) => void;
  layers: NLSLayer[];
  selectedLayerId?: string;
  onLayerDelete: (id: string) => void;
  onLayerNameUpdate: (inp: LayerNameUpdateProps) => void;
  onLayerSelect: (id?: string) => void;
  onDataSourceLayerCreatorOpen: () => void;
  onSketchLayerCreatorOpen: () => void;
  onLayerVisibilityUpate: (inp: LayerVisibilityUpdateProps) => void;
  onFlyTo?: FlyTo;
  sketchEnabled: boolean;
  sketchType: SketchType | undefined;
  onSketchTypeChange: (type: SketchType | undefined) => void;
  sceneSettings?: Item[];
  layerStyles?: LayerStyle[];
  sceneId?: string;
  selectedLayerStyleId?: string;
  currentCamera?: Camera;
  selectedLayer: SelectedLayer | undefined;
  onLayerStyleValueUpdate?: (inp: LayerStyleValueUpdateProps) => void;
  onLayerConfigUpdate?: (inp: LayerConfigUpdateProps) => void;
  onGeoJsonFeatureUpdate?: (inp: GeoJsonFeatureUpdateProps) => void;
  onLayerStyleAdd: (inp: LayerStyleAddProps) => void;
  onLayerStyleDelete: (id: string) => void;
  onLayerStyleNameUpdate: (inp: LayerStyleNameUpdateProps) => void;
  onLayerStyleSelect: (id: string) => void;
}

const MapPageContext = createContext<MapPageContextType | undefined>(undefined);

export const MapPageProvider = ({
  value,
  children,
}: {
  value: MapPageContextType;
  children: ReactNode;
}) => {
  return <MapPageContext.Provider value={value}>{children}</MapPageContext.Provider>;
};

export const useMapPage = (): MapPageContextType => {
  const context = useContext(MapPageContext);
  if (!context) {
    throw new Error("useMapPage must be used within a MapPageContext");
  }
  return context;
};
