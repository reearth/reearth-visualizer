import {
  ArcType,
  ClassificationType,
  EllipsoidSurfaceAppearance,
  GeometryInstance,
  GroundPrimitive,
  PolygonGeometry,
} from "@cesium/engine";
import { type MultiPolygon, type Polygon } from "geojson";
import { pick } from "lodash-es";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { useCesium } from "resium";

import { useConstant } from "@reearth/beta/utils/util";

import { createColorMapImage } from "./colorMap";
import { viridisColorMapLUT } from "./constants";
import { type MeshImageData } from "./createMeshImageData";
import { createHeatmapMeshMaterial, type HeatmapMeshMaterialOptions } from "./HeatmapMeshMaterial";
import { convertPolygonToHierarchyArray } from "./utils";

export type HeatmapMeshHandle = {
  bringToFront: () => void;
  sendToBack: () => void;
};

export type HeatmapMeshProps = Omit<HeatmapMeshMaterialOptions, "image"> & {
  meshImageData: MeshImageData;
  geometry: Polygon | MultiPolygon;
};

export const HeatmapMesh = forwardRef<HeatmapMeshHandle, HeatmapMeshProps>(
  ({ meshImageData, geometry, colorMap, ...props }, ref) => {
    const { scene } = useCesium();
    const groundPrimitives = scene?.groundPrimitives;
    const primitivesRef = useRef<GroundPrimitive[]>();

    const material = useConstant(() =>
      createHeatmapMeshMaterial({
        image: meshImageData.image,
        width: meshImageData.width,
        height: meshImageData.height,
      }),
    );

    useEffect(() => {
      if (groundPrimitives?.isDestroyed()) {
        return;
      }
      const primitives = convertPolygonToHierarchyArray(geometry).map(polygonHierarchy => {
        const instance = new GeometryInstance({
          geometry: new PolygonGeometry({
            polygonHierarchy,
            arcType: ArcType.GEODESIC,
            vertexFormat: EllipsoidSurfaceAppearance.VERTEX_FORMAT,
          }),
        });
        // TODO: Needs trapezoidal texture projection to accurately map the
        // data. See also: https://github.com/CesiumGS/cesium/issues/4164
        return new GroundPrimitive({
          geometryInstances: instance,
          classificationType: ClassificationType.BOTH,
          appearance: new EllipsoidSurfaceAppearance({
            material,
          }),
        });
      });
      primitives.forEach(primitive => {
        groundPrimitives?.add(primitive);
      });
      primitivesRef.current = primitives;
      return () => {
        if (!groundPrimitives?.isDestroyed()) {
          primitives.forEach(primitive => {
            groundPrimitives?.remove(primitive);
          });
        }
        primitivesRef.current = undefined;
      };
    }, [meshImageData, geometry, groundPrimitives, material]);

    useEffect(() => {
      material.uniforms.image = meshImageData.image;
    }, [meshImageData.image, material]);

    Object.assign(material.uniforms, pick(meshImageData, ["width", "height"]));

    useEffect(() => {
      material.uniforms.colorMap =
        colorMap != null ? createColorMapImage(colorMap) : createColorMapImage(viridisColorMapLUT);
    }, [colorMap, material]);

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
        "rectangle",
        "cropRectangle",
      ]),
    );

    useImperativeHandle(
      ref,
      () => ({
        bringToFront: () => {
          if (groundPrimitives?.isDestroyed()) {
            return;
          }
          primitivesRef.current?.forEach(primitive => {
            if (groundPrimitives?.contains(primitive)) {
              groundPrimitives?.raiseToTop(primitive);
            }
          });
        },
        sendToBack: () => {
          if (groundPrimitives?.isDestroyed()) {
            return;
          }
          primitivesRef.current?.forEach(primitive => {
            if (groundPrimitives?.contains(primitive)) {
              groundPrimitives?.lowerToBottom(primitive);
            }
          });
        },
      }),
      [groundPrimitives],
    );

    scene?.requestRender();
    return null;
  },
);

HeatmapMesh.displayName = "HeatmapMesh";
