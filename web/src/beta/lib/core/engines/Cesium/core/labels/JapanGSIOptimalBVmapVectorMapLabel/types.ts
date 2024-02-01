import { ImageryLayer as CesiumImageryLayer, type ImageryProvider } from "@cesium/engine";

export interface Imagery {
  imageryLayer: CesiumImageryLayer;
  x: number;
  y: number;
  level: number;
}

export interface KeyedImagery extends Imagery {
  key: string;
  children?: KeyedImagery[];
  descendants?: KeyedImagery[];
}

export interface ImageryLayerHandle {
  imageryLayer: CesiumImageryLayer;
  bringToFront: () => void;
  sendToBack: () => void;
}

export interface ImageryLayerProps extends CesiumImageryLayer.ConstructorOptions {
  imageryProvider: ImageryProvider;
}

export type ImageryCoords = Pick<Imagery, "x" | "y" | "level">;
