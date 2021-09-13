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

import { SelectPrimitiveOptions } from "@reearth/plugin";
import type { Camera } from "@reearth/util/value";

import Cesium from "./Cesium";
import type { EngineRef } from "./ref";

export type { OverriddenInfobox, SelectPrimitiveOptions } from "@reearth/plugin";

export type SceneProperty = {
  default?: {
    camera?: Camera;
    terrain?: boolean;
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
  selectedPrimitiveId?: string;
  primitiveSelectionReason?: string;
  onPrimitiveSelect?: (id?: string, options?: SelectPrimitiveOptions) => void;
  onCameraChange?: (camera: Camera) => void;
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
