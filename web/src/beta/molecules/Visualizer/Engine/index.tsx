import {
  ForwardRefRenderFunction,
  ComponentType,
  PropsWithoutRef,
  ReactNode,
  RefAttributes,
  CSSProperties,
  forwardRef,
} from "react";

import type { Camera, LatLng } from "@reearth/classic/util/value";

import { Clock, SelectLayerOptions } from "../Plugin/types";

import Cesium from "./Cesium";
import type { EngineRef, SceneProperty } from "./ref";

export type { OverriddenInfobox, SelectLayerOptions } from "../Plugin/types";
export type { SceneProperty, ClusterProperty, ClusterProps } from "./ref";

export type EngineProps = {
  className?: string;
  style?: CSSProperties;
  isEditable?: boolean;
  isBuilt?: boolean;
  inEditor?: boolean;
  property?: SceneProperty;
  camera?: Camera;
  clock?: Clock;
  small?: boolean;
  children?: ReactNode;
  ready?: boolean;
  selectedLayerId?: string;
  layerSelectionReason?: string;
  isLayerDraggable?: boolean;
  isLayerDragging?: boolean;
  shouldRender?: boolean;
  meta?: Record<string, unknown>;
  onLayerSelect?: (id?: string, options?: SelectLayerOptions) => void;
  onCameraChange?: (camera: Camera) => void;
  onTick?: (clock: Clock) => void;
  onLayerDrag?: (layerId: string, position: LatLng) => void;
  onLayerDrop?: (layerId: string, propertyKey: string, position: LatLng | undefined) => void;
};

export type Component = ComponentType<PropsWithoutRef<EngineProps> & RefAttributes<Ref>>;
export type Props = EngineProps & { engine?: Engine };
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
