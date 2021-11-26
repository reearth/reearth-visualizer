import React, {
  ForwardRefRenderFunction,
  PropsWithChildren,
  ComponentType,
  PropsWithoutRef,
  ReactNode,
  RefAttributes,
  CSSProperties,
  forwardRef,
} from "react";

import type { Camera, LatLng } from "@reearth/util/value";

import { SelectLayerOptions } from "../Plugin/types";

import Cesium from "./Cesium";
import type { EngineRef } from "./ref";

export type { OverriddenInfobox, SelectLayerOptions } from "../Plugin/types";

export type SceneProperty = {
  default?: {
    camera?: Camera;
    terrain?: boolean;
    terrainType?: "cesium" | "arcgis"; // default: cesium
    terrainExaggeration?: number; // default: 1
    terrainExaggerationRelativeHeight?: number; // default: 0
    depthTestAgainstTerrain?: boolean;
    skybox?: boolean;
    bgcolor?: string;
    ion?: string;
  };
  tiles?: {
    id: string;
    tile_type?: string;
    tile_url?: string;
    tile_maxLevel?: number;
    tile_minLevel?: number;
  }[];
  terrain?: {
    terrain?: boolean;
    terrainType?: "cesium" | "arcgis"; // default: cesium
    terrainExaggeration?: number; // default: 1
    terrainExaggerationRelativeHeight?: number; // default: 0
    depthTestAgainstTerrain?: boolean;
  };
  atmosphere?: {
    enable_sun?: boolean;
    enable_lighting?: boolean;
    ground_atmosphere?: boolean;
    sky_atmosphere?: boolean;
    shadows?: boolean;
    fog?: boolean;
    fog_density?: number;
    brightness_shift?: number;
    hue_shift?: number;
    surturation_shift?: number;
  };
  timeline?: {
    animation?: boolean;
  };
  googleAnalytics?: {
    enableGA?: boolean;
    trackingId?: string;
  };
  theme?: {
    themeType?: "light" | "dark" | "forest" | "custom";
    themeTextColor?: string;
    themeSelectColor?: string;
    themeBackgroundColor?: string;
  };
};

export type EngineProps = {
  className?: string;
  style?: CSSProperties;
  isEditable?: boolean;
  isBuilt?: boolean;
  property?: SceneProperty;
  camera?: Camera;
  small?: boolean;
  children?: ReactNode;
  ready?: boolean;
  selectedLayerId?: string;
  layerSelectionReason?: string;
  onLayerSelect?: (id?: string, options?: SelectLayerOptions) => void;
  onCameraChange?: (camera: Camera) => void;
  isLayerDraggable?: boolean;
  onLayerDrag?: (layerId: string, position: LatLng) => void;
  onLayerDrop?: (layerId: string, propertyKey: string, position: LatLng | undefined) => void;
  isLayerDragging?: boolean;
};

export type Component = ComponentType<PropsWithoutRef<EngineProps> & RefAttributes<Ref>>;
export type Props = PropsWithChildren<EngineProps & { engine?: Engine }>;
export type Ref = EngineRef;
export type Engine = keyof typeof engines;

// TODO: lazy loading
const engines = {
  cesium: Cesium,
};

const Engine: ForwardRefRenderFunction<Ref, Props> = ({ engine, children, ...props }, ref) => {
  const Engine: Component | undefined = engine ? engines[engine] : undefined;
  return Engine ? (
    <Engine {...props} ref={ref}>
      {children}
    </Engine>
  ) : null;
};

export default forwardRef(Engine);
