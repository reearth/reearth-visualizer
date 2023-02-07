import {
  Cartesian3,
  Viewer as CesiumViewer,
  Math as CesiumMath,
  TranslationRotationScale,
  Cartographic,
  Entity,
} from "cesium";

import { getTag } from "./Feature";

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

export function findEntity(
  viewer: CesiumViewer,
  layerId?: string,
  featureId?: string,
): Entity | undefined {
  const id = featureId ?? layerId;
  const keyName = featureId ? "featureId" : "layerId";
  if (!id) return;

  let entity = viewer.entities.getById(id);
  if (entity) return entity;

  entity = viewer.entities.values.find(e => getTag(e)?.[keyName] === id);
  if (entity) return entity;

  for (const ds of [viewer.dataSourceDisplay.dataSources, viewer.dataSources]) {
    for (let i = 0; i < ds.length; i++) {
      const entities = ds.get(i).entities.values;
      const e = entities.find(e => getTag(e)?.[keyName] === id);
      if (e) {
        return e;
      }
    }
  }

  return;
}
