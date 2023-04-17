import {
  Cartesian3,
  Viewer as CesiumViewer,
  Math as CesiumMath,
  TranslationRotationScale,
  Cartographic,
  Color,
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

export const toColor = (c?: string) => {
  if (!c || typeof c !== "string") return undefined;

  // support alpha
  const m = c.match(/^#([A-Fa-f0-9]{6})([A-Fa-f0-9]{2})$|^#([A-Fa-f0-9]{3})([A-Fa-f0-9])$/);
  if (!m) return Color.fromCssColorString(c);

  const alpha = parseInt(m[4] ? m[4].repeat(2) : m[2], 16) / 255;
  return Color.fromCssColorString(`#${m[1] ?? m[3]}`).withAlpha(alpha);
};
