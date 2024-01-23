import { ImageryLayer as CesiumImageryLayer, type ImageryProvider } from "@cesium/engine";

export interface ImageryLayerHandle {
  imageryLayer: CesiumImageryLayer;
  bringToFront: () => void;
  sendToBack: () => void;
}

export interface ImageryLayerProps extends CesiumImageryLayer.ConstructorOptions {
  imageryProvider: ImageryProvider;
}
