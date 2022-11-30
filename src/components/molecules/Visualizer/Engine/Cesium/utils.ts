import {
  Cartesian3,
  Viewer as CesiumViewer,
  Math as CesiumMath,
  TranslationRotationScale,
  Cartographic,
} from "cesium";

export const convertCartesian3ToPosition = (
  cesium?: CesiumViewer,
  pos?: Cartesian3,
): { lat: number; lng: number; height: number } | undefined => {
  if (!pos) return;
  const cartographic = cesium?.scene.globe.ellipsoid.cartesianToCartographic(pos);
  if (!cartographic) return;
  return {
    lat: CesiumMath.toDegrees(cartographic.latitude),
    lng: CesiumMath.toDegrees(cartographic.longitude),
    height: cartographic.height,
  };
};

export const translationWithClamping = (
  trs: TranslationRotationScale,
  allowEnterGround: boolean,
  terrainHeightEstimate: number,
) => {
  if (!allowEnterGround) {
    const cartographic = Cartographic.fromCartesian(trs.translation, undefined, new Cartographic());
    const boxBottomHeight = cartographic.height - trs.scale.z / 2;
    const floorHeight = terrainHeightEstimate;
    if (boxBottomHeight < floorHeight) {
      cartographic.height += floorHeight - boxBottomHeight;
      Cartographic.toCartesian(cartographic, undefined, trs.translation);
    }
  }
};
