import { AreaSize } from "@reearth/beta/ui/layout";
import { FlyTo, SketchEditingFeature, SketchType } from "@reearth/core";
import { NLSLayer } from "@reearth/services/api/layersApi/utils";
import { LayerStyle } from "@reearth/services/api/layerStyleApi/utils";
import { Item } from "@reearth/services/api/propertyApi/utils";
import { Scene } from "@reearth/services/api/sceneApi";
import { ChangeCustomPropertyTitleInput, RemoveCustomPropertyInput, UpdateCustomPropertySchemaInput } from "@reearth/services/gql";
import { createContext, useContext, ReactNode } from "react";

import {
  LayerConfigUpdateProps,
  LayerMoveProps,
  LayerNameUpdateProps,
  LayerVisibilityUpdateProps,
  SelectedLayer
} from "../hooks/useLayers";
import {
  LayerStyleAddProps,
  LayerStyleNameUpdateProps,
  LayerStyleValueUpdateProps
} from "../hooks/useLayerStyles";
import {
  GeoJsonFeatureDeleteProps,
  GeoJsonFeatureUpdateProps
} from "../hooks/useSketch";

export interface MapPageContextType {
  handleVisualizerResize?: (props: AreaSize) => void;
  scene?: Scene;
  selectedSceneSetting?: string;
  handleSceneSettingSelect: (groupId: string) => void;
  layers: NLSLayer[];
  selectedLayerId?: string;
  handleLayerDelete: (id: string) => void;
  handleLayerNameUpdate: (inp: LayerNameUpdateProps) => void;
  handleLayerMove: (inp: LayerMoveProps) => void;
  handleLayerSelect: (id?: string) => void;
  openDataSourceLayerCreator: () => void;
  openSketchLayerCreator: () => void;
  layerId?: string;
  handleCustomPropertySchemaClick?: (id?: string) => void;
  handleCustomPropertySchemaUpdate?: (
    inp: UpdateCustomPropertySchemaInput
  ) => void;
  handleLayerVisibilityUpdate: (inp: LayerVisibilityUpdateProps) => void;
  handleFlyTo?: FlyTo;
  sketchEnabled: boolean;
  sketchType: SketchType | undefined;
  handleSketchTypeChange: (type: SketchType | undefined) => void;
  sketchEditingFeature?: SketchEditingFeature;
  handleSketchGeometryEditStart: () => void;
  handleSketchGeometryEditCancel: () => void;
  handleSketchGeometryEditApply: () => void;
  sceneSettings?: Item[];
  layerStyles?: LayerStyle[];
  sceneId?: string;
  selectedLayerStyleId?: string;
  selectedLayer: SelectedLayer | undefined;
  handleLayerStyleValueUpdate?: (inp: LayerStyleValueUpdateProps) => void;
  handleLayerConfigUpdate?: (inp: LayerConfigUpdateProps) => void;
  handleGeoJsonFeatureUpdate?: (inp: GeoJsonFeatureUpdateProps) => void;
  handleGeoJsonFeatureDelete?: (inp: GeoJsonFeatureDeleteProps) => void;
  handleLayerStyleAdd: (inp: LayerStyleAddProps) => void;
  handleLayerStyleDelete: (id: string) => void;
  handleLayerStyleNameUpdate: (inp: LayerStyleNameUpdateProps) => void;
  handleLayerStyleSelect: (id: string | undefined) => void;
  handleChangeCustomPropertyTitle: (
    inp: ChangeCustomPropertyTitleInput
  ) => void;
  handleRemoveCustomProperty: (inp: RemoveCustomPropertyInput) => void;
}

const MapPageContext = createContext<MapPageContextType | undefined>(undefined);

export const MapPageProvider = ({
  value,
  children
}: {
  value: MapPageContextType;
  children: ReactNode;
}) => {
  return (
    <MapPageContext.Provider value={value}>{children}</MapPageContext.Provider>
  );
};

export const useMapPage = (): MapPageContextType => {
  const context = useContext(MapPageContext);
  if (!context) {
    throw new Error("useMapPage must be used within a MapPageContext");
  }
  return context;
};
