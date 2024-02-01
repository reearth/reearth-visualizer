// ref: https://github.com/takram-design-engineering/plateau-view/blob/main/libs/heatmap/src/HeatmapMesh.tsx

import {
  ArcType,
  BoundingSphere,
  EllipsoidSurfaceAppearance,
  GeometryInstance,
  GroundPrimitive,
  PolygonGeometry,
} from "cesium";
import { type MultiPolygon, type Polygon } from "geojson";
import { pick } from "lodash-es";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useMemo,
  useLayoutEffect,
  memo,
} from "react";
import { useCesium } from "resium";

import { ComputedFeature, ComputedLayer } from "@reearth/beta/lib/core/mantle";
import { useConstant } from "@reearth/beta/utils/util";

import { convertPolygonToHierarchyArray } from "../../utils/polygon";
import { attachTag } from "../utils";

import { createColorMapImage } from "./colorMap";
import { viridisColorMapLUT } from "./constants";
import { type MeshImageData } from "./createMeshImageData";
import { createHeatmapMeshMaterial, type HeatmapMeshMaterialOptions } from "./HeatmapMeshMaterial";

export type HeatmapMeshHandle = {
  bringToFront: () => void;
  sendToBack: () => void;
};

export type HeatmapMeshProps = Omit<HeatmapMeshMaterialOptions, "image"> & {
  layer?: ComputedLayer;
  feature?: ComputedFeature;
  boundingSphere: BoundingSphere;
  meshImageData: MeshImageData;
  geometry: Polygon | MultiPolygon;
};

export const HeatmapMesh = memo(
  forwardRef<HeatmapMeshHandle, HeatmapMeshProps>(
    (
      {
        layer,
        feature,
        boundingSphere,
        meshImageData,
        geometry,
        colorMapLUT,
        bound,
        cropBound,
        ...props
      },
      ref,
    ) => {
      const { scene } = useCesium();
      const groundPrimitives = scene?.primitives;
      const primitiveRef = useRef<GroundPrimitive>();

      const material = useConstant(() =>
        createHeatmapMeshMaterial({
          image: meshImageData.image,
          width: meshImageData.width,
          height: meshImageData.height,
          bound,
          cropBound,
        }),
      );

      const geometryInstances = useMemo(() => {
        return convertPolygonToHierarchyArray(geometry).map(polygonHierarchy => {
          const instance = new GeometryInstance({
            geometry: new PolygonGeometry({
              polygonHierarchy,
              arcType: ArcType.GEODESIC,
              vertexFormat: EllipsoidSurfaceAppearance.VERTEX_FORMAT,
            }),
            id: layer?.id,
          });

          return instance;
        });
      }, [geometry, layer?.id]);

      // Since we expect a single feature, we directly access the first one
      const geometryInstance = geometryInstances[0];

      useEffect(() => {
        if (groundPrimitives?.isDestroyed()) {
          return;
        }
        const primitive =
          // TODO: Needs trapezoidal texture projection to accurately map the
          // data. See also: https://github.com/CesiumGS/cesium/issues/4164
          new GroundPrimitive({
            geometryInstances: geometryInstance,
            appearance: new EllipsoidSurfaceAppearance({
              material,
            }),
          });
        groundPrimitives?.add(primitive);
        primitiveRef.current = primitive;

        return () => {
          if (!groundPrimitives?.isDestroyed()) {
            groundPrimitives?.remove(primitive);
          }
          primitiveRef.current = undefined;
        };
      }, [geometryInstance, groundPrimitives, material]);

      useLayoutEffect(() => {
        // Code for attaching tag
        if (!primitiveRef.current || primitiveRef.current?.isDestroyed()) return;
        attachTag(primitiveRef.current, {
          layerId: layer?.id,
          featureId: feature?.id,
          originalProperties: boundingSphere,
        });
      }, [layer?.id, feature?.id, boundingSphere]);

      useEffect(() => {
        material.uniforms.image = meshImageData.image;
      }, [meshImageData.image, material]);

      Object.assign(material.uniforms, pick(meshImageData, ["width", "height"]));

      useEffect(() => {
        material.uniforms.colorMap =
          colorMapLUT != null
            ? createColorMapImage(colorMapLUT)
            : createColorMapImage(viridisColorMapLUT);
      }, [colorMapLUT, material]);

      Object.assign(
        material.uniforms,
        pick(props, [
          "minValue",
          "maxValue",
          "opacity",
          "contourSpacing",
          "contourThickness",
          "contourAlpha",
          "logarithmic",
        ]),
      );

      useImperativeHandle(
        ref,
        () => ({
          bringToFront: () => {
            if (groundPrimitives?.isDestroyed()) {
              return;
            }

            if (groundPrimitives?.contains(primitiveRef)) {
              groundPrimitives?.raiseToTop(primitiveRef);
            }
          },
          sendToBack: () => {
            if (groundPrimitives?.isDestroyed()) {
              return;
            }

            if (groundPrimitives?.contains(primitiveRef)) {
              groundPrimitives?.lowerToBottom(primitiveRef);
            }
          },
        }),
        [groundPrimitives],
      );

      scene?.requestRender();
      return null;
    },
  ),
);

HeatmapMesh.displayName = "HeatmapMesh";
