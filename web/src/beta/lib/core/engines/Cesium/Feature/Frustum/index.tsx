// Ref: https://github.com/takram-design-engineering/plateau-view/blob/main/libs/pedestrian/src/StreetViewFrustum.tsx

import {
  Cartesian3,
  Math as CesiumMath,
  FrustumGeometry,
  PerspectiveFrustum,
  Quaternion,
  GeometryInstance,
  ComponentDatatype,
  GeometryAttribute,
  Primitive as CesiumPrimitive,
  HeadingPitchRoll,
  Transforms,
  Cartesian2,
  Matrix4,
} from "cesium";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { CesiumComponentRef, Primitive, useCesium } from "resium";

import { FrustumAppearance } from "@reearth/beta/lib/core/mantle";
import { toColor } from "@reearth/beta/utils/value";

import { usePreRender } from "../../hooks/useSceneEvent";
import { useContext } from "../context";
import { attachTag, type FeatureComponentConfig, type FeatureProps } from "../utils";

import { FrustumColorAppearance } from "./FrustumColorAppearance";
import { getFieldOfViewSeparate } from "./getFieldOfView";

export type Props = FeatureProps<Property>;

export type Property = FrustumAppearance;

const colorGeometryAttribute = new GeometryAttribute({
  componentDatatype: ComponentDatatype.UNSIGNED_BYTE,
  componentsPerAttribute: 3,
  normalize: true,
  values: new Uint8Array(
    // Colors of vertices adjacent to the near plane are 255. 0 otherwise.
    [
      0xff, 0xff, 0xff, 0xff, 0, 0, 0, 0, 0, 0xff, 0xff, 0, 0, 0xff, 0xff, 0, 0xff, 0, 0, 0xff,
      0xff, 0, 0, 0xff,
    ].flatMap(value => [value, value, value]),
  ),
});

const scaleScratch = new Cartesian3();
const fovScratch = new Cartesian2();

const TAN_PI_OVER_FOUR = Math.tan(CesiumMath.PI_OVER_FOUR);

export default function Frustum({ isVisible, property, geometry, layer, feature }: Props) {
  const { viewer } = useCesium();
  const {
    color,
    show = true,
    opacity = 1,
    zoom = 1,
    aspectRatio = 3 / 2,
    length = 200,
  } = property || {};
  const { requestRender } = useContext();
  const primitiveRef = useRef<CesiumComponentRef<CesiumPrimitive>>(null);

  const { translate, rotate } = layer?.transition ?? {};
  const translatedCoords = useMemo(
    () => (translate ? Cartesian3.fromDegrees(...translate) : undefined),
    [translate],
  );

  const coordinates = useMemo(
    () => (geometry?.type === "Point" ? geometry.coordinates : undefined),
    [geometry?.coordinates, geometry?.type],
  );
  const position = useMemo(() => {
    return coordinates
      ? Cartesian3.fromDegrees(coordinates[0], coordinates[1], coordinates[2])
      : Cartesian3.ZERO;
  }, [coordinates]);

  const geometryInstance = useMemo(() => {
    const geometry = FrustumGeometry.createGeometry(
      new FrustumGeometry({
        frustum: new PerspectiveFrustum({
          fov: CesiumMath.PI_OVER_TWO,
          aspectRatio: 1,
          near: 0.0001,
          far: 1,
        }),
        origin: Cartesian3.ZERO,
        orientation: Quaternion.IDENTITY,
        vertexFormat: FrustumColorAppearance.VERTEX_FORMAT,
      }),
    );

    if (!geometry) return;

    geometry.attributes.color = colorGeometryAttribute;
    return new GeometryInstance({ geometry });
  }, []);

  const appearance = useMemo(
    () =>
      new FrustumColorAppearance({
        color: toColor(color),
      }),
    [color],
  );

  useEffect(() => {
    if (!primitiveRef.current || primitiveRef.current.cesiumElement?.isDestroyed()) return;
    requestRender?.();
  });

  useLayoutEffect(() => {
    if (!primitiveRef.current || primitiveRef.current.cesiumElement?.isDestroyed()) return;
    attachTag(primitiveRef.current.cesiumElement, {
      layerId: layer?.id,
      featureId: feature?.id,
    });
  }, [layer?.id, feature?.id]);

  usePreRender(() => {
    const primitive = primitiveRef.current?.cesiumElement;
    if (!primitive || primitive.isDestroyed() || !viewer) return;

    primitive.appearance.material.uniforms.opacity = opacity;

    const origin = translatedCoords ?? position;
    const rotation = Transforms.headingPitchRollQuaternion(
      origin,
      new HeadingPitchRoll(
        CesiumMath.toRadians(rotate?.[0] ?? 0) + CesiumMath.PI_OVER_TWO,
        CesiumMath.PI_OVER_TWO - CesiumMath.toRadians(rotate?.[1] ?? 0),
        CesiumMath.toRadians(rotate?.[2] ?? 0),
      ),
    );
    const fov = getFieldOfViewSeparate(viewer.scene.camera, zoom, fovScratch);
    const farWidth = (Math.tan(fov.x / 2) / TAN_PI_OVER_FOUR) * length;
    scaleScratch.x = (opacity * farWidth) / aspectRatio;
    scaleScratch.y = opacity * farWidth;
    scaleScratch.z = opacity * length;
    Matrix4.fromTranslationQuaternionRotationScale(
      origin,
      rotation,
      scaleScratch,
      primitive.modelMatrix,
    );
  });

  return !feature || !isVisible || !show ? null : (
    <Primitive
      ref={primitiveRef}
      geometryInstances={geometryInstance}
      asynchronous={false}
      appearance={appearance}
    />
  );
}

export const config: FeatureComponentConfig = {
  noLayer: true,
};
