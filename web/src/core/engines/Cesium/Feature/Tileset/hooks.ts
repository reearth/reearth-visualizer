import {
  Cesium3DTileset as Cesium3DTilesetType,
  Cesium3DTileStyle,
  IonResource,
  ClippingPlane,
  ClippingPlaneCollection as CesiumClippingPlaneCollection,
  Cartesian3,
  Matrix4,
  Transforms,
  TranslationRotationScale,
  HeadingPitchRoll,
  Matrix3,
  Cesium3DTileset,
  Cesium3DTile,
  Cesium3DTileFeature,
  Model,
  Cesium3DTilePointFeature,
} from "cesium";
import { isEqual, pick } from "lodash-es";
import { MutableRefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CesiumComponentRef, useCesium } from "resium";

import type {
  ComputedFeature,
  ComputedLayer,
  Feature,
  EvalFeature,
  SceneProperty,
  Cesium3DTilesAppearance,
} from "../../..";
import { layerIdField, sampleTerrainHeightFromCartesian } from "../../common";
import type { InternalCesium3DTileFeature } from "../../types";
import { lookupFeatures, translationWithClamping } from "../../utils";
import {
  usePick,
  attachTag,
  extractSimpleLayer,
  extractSimpleLayerData,
  generateIDWithMD5,
  toColor,
} from "../utils";

import { useClippingBox } from "./useClippingBox";

import { Property } from ".";

const useData = (layer: ComputedLayer | undefined) => {
  return useMemo(() => {
    const data = extractSimpleLayerData(layer);
    return {
      type: data?.type,
      url: data?.url,
      layers: data?.layers
        ? Array.isArray(data.layers)
          ? data.layers.join(",")
          : data?.layers
        : undefined,
    };
  }, [layer]);
};

const makeFeatureFrom3DTile = (
  id: string,
  feature: InternalCesium3DTileFeature,
  coordinates: number[],
): Feature => {
  const properties =
    feature instanceof Model
      ? {}
      : Object.fromEntries(feature.getPropertyIds().map(id => [id, feature.getProperty(id)]));
  return {
    type: "feature",
    id,
    geometry: {
      type: "Point",
      coordinates,
    },
    properties,
    range: {
      x: coordinates[0],
      y: coordinates[1],
      z: coordinates[2],
    },
  };
};

const getBuiltinFeatureId = (f: InternalCesium3DTileFeature) => {
  return (f instanceof Model ? f.id : f instanceof Cesium3DTileFeature ? f.featureId : "") ?? "";
};

type CachedFeature = {
  feature: Feature;
  raw: InternalCesium3DTileFeature;
};

const MAX_NUMBER_OF_CONCURRENT_COMPUTING_FEATURES = 5000;

type StyleProperty<N = string> = {
  name: N;
  convert?: "color" | "colorFunctionString" | "vec2" | "vec4";
};

const COMMON_STYLE_PROPERTIES: StyleProperty<"color" | "show">[] = [
  { name: "color", convert: "color" },
  { name: "show" },
];
const MODEL_STYLE_PROPERTIES: StyleProperty<"color" | "show" | "pointSize" | "meta">[] = [
  { name: "color", convert: "colorFunctionString" },
  { name: "show" },
  { name: "pointSize" },
  { name: "meta" },
];
// TODO: Add more styles. And it has not been tested yet.
const POINT_STYLE_PROPERTIES: StyleProperty<"pointSize">[] = [{ name: "pointSize" }];

const TILESET_APPEARANCE_FIELDS: (keyof Cesium3DTilesAppearance)[] = [
  "show",
  "color",
  "pointSize",
  "meta",
];

// TODO: Implement other convert type
const convertStyle = (val: any, convert: StyleProperty["convert"]) => {
  if (convert === "color") {
    return toColor(val);
  } else if (convert === "colorFunctionString") {
    return `color("${val}")`;
  }

  return val;
};

const useFeature = ({
  id,
  tileset,
  layer,
  evalFeature,
}: {
  id?: string;
  tileset: MutableRefObject<Cesium3DTileset | undefined>;
  layer?: ComputedLayer;
  evalFeature: EvalFeature;
}) => {
  const cachedFeaturesRef = useRef<CachedFeature[]>([]);
  const cachedCalculatedLayerRef = useRef(layer);
  const cachedFeatureIds = useRef(new Set<string>());
  const layerId = layer?.id || id;

  const attachComputedFeature = useCallback(
    async (feature?: CachedFeature) => {
      const layer = cachedCalculatedLayerRef?.current?.layer;
      if (layer?.type === "simple" && feature?.feature) {
        const computedFeature = evalFeature(layer, feature?.feature);

        const style = computedFeature?.["3dtiles"];

        const raw = feature.raw;

        COMMON_STYLE_PROPERTIES.forEach(({ name, convert }) => {
          const val = convertStyle(style?.[name], convert);
          if (val !== undefined) {
            raw[name] = val;
          }
        });

        if (raw instanceof Cesium3DTilePointFeature) {
          POINT_STYLE_PROPERTIES.forEach(({ name, convert }) => {
            const val = convertStyle(style?.[name], convert);
            if (val !== undefined) {
              raw[name] = val;
            }
          });
        }

        if ("style" in raw) {
          raw.style = new Cesium3DTileStyle(
            // TODO: Convert value if it's necessary
            MODEL_STYLE_PROPERTIES.reduce((res, { name, convert }) => {
              const val = convertStyle(style?.[name as keyof typeof style], convert);
              if (val === undefined) return res;
              return { ...res, [name]: val };
            }, {}),
          );
        }

        attachTag(feature.raw, { layerId, featureId: feature.feature.id, computedFeature });

        return computedFeature;
      }
      return;
    },
    [evalFeature, layerId],
  );

  useEffect(() => {
    tileset.current?.tileLoad.addEventListener((t: Cesium3DTile) => {
      lookupFeatures(t.content, async (tileFeature, content) => {
        const coordinates = content.tile.boundingSphere.center;
        const featureId = getBuiltinFeatureId(tileFeature);
        const id = generateIDWithMD5(
          `${coordinates.x}-${coordinates.y}-${coordinates.z}-${featureId}`,
        );
        const feature = (() => {
          const normalFeature = makeFeatureFrom3DTile(id, tileFeature, [
            coordinates.x,
            coordinates.y,
            coordinates.z,
          ]);
          const feature: CachedFeature = {
            feature: normalFeature,
            raw: tileFeature,
          };
          cachedFeaturesRef.current.push(feature);
          cachedFeatureIds.current.add(id);
          return feature;
        })();

        await attachComputedFeature(feature);
      });
    });
  }, [tileset, cachedFeaturesRef, attachComputedFeature, layerId]);

  useEffect(() => {
    cachedCalculatedLayerRef.current = layer;
  }, [layer]);

  // Update 3dtiles styles
  const tileAppearance = useMemo(() => extractSimpleLayer(layer)?.["3dtiles"], [layer]);
  const pickedAppearance = usePick(tileAppearance, TILESET_APPEARANCE_FIELDS);

  // If styles are updated while features are calculating,
  // we stop calculating features, and reassign styles.
  const skippedComputingAt = useRef<number | null>();
  useEffect(() => {
    skippedComputingAt.current = Date.now();
  }, [pickedAppearance]);

  const computeFeatureAsync = useCallback(
    async (f: CachedFeature, startedComputingAt: number) =>
      new Promise(resolve =>
        requestAnimationFrame(() => {
          if (skippedComputingAt.current && skippedComputingAt.current > startedComputingAt) {
            resolve(undefined);
            return;
          }

          const pickedProperties = pick(f.feature.properties, TILESET_APPEARANCE_FIELDS);
          if (pickedAppearance && !isEqual(pickedProperties, pickedAppearance)) {
            Object.entries(pickedAppearance).forEach(([k, v]) => {
              f.feature.properties[k] = v;
            });
            attachComputedFeature(f);
          }
          resolve(undefined);
        }),
      ),
    [pickedAppearance, attachComputedFeature],
  );

  const computeFeatures = useCallback(
    async (startedComputingAt: number) => {
      const tempAsyncProcesses: Promise<unknown>[] = [];
      let skipped = false;
      for (const f of cachedFeaturesRef.current) {
        if (skippedComputingAt.current && skippedComputingAt.current > startedComputingAt) {
          skipped = true;
          break;
        }

        tempAsyncProcesses.push(computeFeatureAsync(f, startedComputingAt));

        if (tempAsyncProcesses.length > MAX_NUMBER_OF_CONCURRENT_COMPUTING_FEATURES) {
          await Promise.all(tempAsyncProcesses);
          tempAsyncProcesses.length = 0;
        }
      }
      if (!skipped) {
        await Promise.all(tempAsyncProcesses);
      }
      tempAsyncProcesses.length = 0;
    },
    [computeFeatureAsync],
  );

  useEffect(() => {
    const compute = async () => {
      const startedComputingAt = Date.now();
      await computeFeatures(startedComputingAt);
    };
    compute();
  }, [computeFeatures]);
};

export const useHooks = ({
  id,
  boxId,
  isVisible,
  property,
  layer,
  feature,
  meta,
  evalFeature,
}: {
  id: string;
  boxId: string;
  isVisible?: boolean;
  property?: Property;
  sceneProperty?: SceneProperty;
  layer?: ComputedLayer;
  feature?: ComputedFeature;
  meta?: Record<string, unknown>;
  evalFeature: EvalFeature;
}) => {
  const { viewer } = useCesium();
  const { tileset, styleUrl, edgeColor, edgeWidth, experimental_clipping } = property ?? {};
  const {
    width,
    height,
    length,
    location,
    coordinates,
    heading,
    roll,
    pitch,
    planes: _planes,
    visible: clippingVisible = true,
    direction = "inside",
    builtinBoxProps,
    allowEnterGround,
  } = useClippingBox({ clipping: experimental_clipping, boxId });
  const [style, setStyle] = useState<Cesium3DTileStyle>();
  const { url, type } = useData(layer);

  const prevPlanes = useRef(_planes);
  const planes = useMemo(() => {
    if (
      !prevPlanes.current?.length ||
      !prevPlanes.current?.every(
        (p, i) =>
          p.normal?.x === _planes?.[i].normal?.x &&
          p.normal?.y === _planes?.[i].normal?.y &&
          p.normal?.z === _planes?.[i].normal?.z &&
          p.distance === _planes?.[i].distance,
      )
    ) {
      prevPlanes.current = _planes;
    }
    return prevPlanes.current;
  }, [_planes]);
  const clipDirection = direction === "inside" ? -1 : 1;
  // Create immutable object
  const [clippingPlanes] = useState(
    () =>
      new CesiumClippingPlaneCollection({
        planes: planes?.map(
          plane =>
            new ClippingPlane(
              new Cartesian3(plane.normal?.x, plane.normal?.y, plane.normal?.z),
              (plane.distance || 0) * clipDirection,
            ),
        ),
        unionClippingRegions: direction === "outside",
        edgeWidth: edgeWidth,
        edgeColor: toColor(edgeColor),
      }),
  );
  const tilesetRef = useRef<Cesium3DTilesetType>();

  const ref = useCallback(
    (tileset: CesiumComponentRef<Cesium3DTilesetType> | null) => {
      if (tileset?.cesiumElement) {
        attachTag(tileset.cesiumElement, { layerId: layer?.id || id, featureId: feature?.id });
      }
      if (layer?.id && tileset?.cesiumElement) {
        (tileset?.cesiumElement as any)[layerIdField] = layer.id;
      }
      tilesetRef.current = tileset?.cesiumElement;
    },
    [id, layer?.id, feature?.id],
  );

  useFeature({
    id,
    tileset: tilesetRef,
    layer,
    evalFeature,
  });

  const [terrainHeightEstimate, setTerrainHeightEstimate] = useState(0);
  const inProgressSamplingTerrainHeight = useRef(false);
  const updateTerrainHeight = useCallback(
    (translation: Cartesian3) => {
      if (inProgressSamplingTerrainHeight.current || !viewer) {
        return;
      }

      if (!allowEnterGround) {
        inProgressSamplingTerrainHeight.current = true;
        sampleTerrainHeightFromCartesian(viewer.scene, translation).then(v => {
          setTerrainHeightEstimate(v ?? 0);
          inProgressSamplingTerrainHeight.current = false;
        });
      }
    },
    [allowEnterGround, viewer],
  );

  useEffect(() => {
    const coords = coordinates
      ? coordinates
      : location
      ? [location.lng, location.lat, location.height ?? 0]
      : undefined;
    const position = Cartesian3.fromDegrees(coords?.[0] || 0, coords?.[1] || 0, coords?.[2] || 0);

    const prepareClippingPlanes = async () => {
      if (!tilesetRef.current) {
        return;
      }

      try {
        await tilesetRef.current?.readyPromise;
      } catch (e) {
        console.error("Could not load 3D tiles: ", e);
        return;
      }

      // Use internal original matrix for clipping planes.
      const clippingPlanesOriginMatrix = (
        tilesetRef.current as any
      ).clippingPlanesOriginMatrix.clone();

      const dimensions = new Cartesian3(width || 100, length || 100, height || 100);

      if (!allowEnterGround) {
        const trs = new TranslationRotationScale(position, undefined, dimensions);
        translationWithClamping(trs, !!allowEnterGround, terrainHeightEstimate);
        position.x = trs.translation.x;
        position.y = trs.translation.y;
        position.z = trs.translation.z;
      }

      const hpr = heading && pitch && roll ? new HeadingPitchRoll(heading, pitch, roll) : undefined;
      const boxTransform = Matrix4.multiply(
        hpr
          ? Matrix4.fromRotationTranslation(Matrix3.fromHeadingPitchRoll(hpr), position)
          : Transforms.eastNorthUpToFixedFrame(position),
        Matrix4.fromScale(dimensions, new Matrix4()),
        new Matrix4(),
      );

      const inverseOriginalModelMatrix = Matrix4.inverse(clippingPlanesOriginMatrix, new Matrix4());

      Matrix4.multiply(inverseOriginalModelMatrix, boxTransform, clippingPlanes.modelMatrix);
    };

    prepareClippingPlanes();
    if (!allowEnterGround) {
      updateTerrainHeight(position);
    }
  }, [
    width,
    length,
    height,
    heading,
    pitch,
    roll,
    location,
    coordinates,
    clippingPlanes.modelMatrix,
    updateTerrainHeight,
    allowEnterGround,
    terrainHeightEstimate,
  ]);

  useEffect(() => {
    clippingPlanes.enabled = clippingVisible;
  }, [clippingPlanes, clippingVisible]);

  useEffect(() => {
    clippingPlanes.unionClippingRegions = direction === "outside";
  }, [clippingPlanes, direction]);

  useEffect(() => {
    clippingPlanes.removeAll();
    planes?.forEach(plane =>
      clippingPlanes.add(
        new ClippingPlane(
          new Cartesian3(plane.normal?.x, plane.normal?.y, plane.normal?.z),
          (plane.distance || 0) * clipDirection,
        ),
      ),
    );
  }, [planes, clippingPlanes, clipDirection]);

  useEffect(() => {
    if (!styleUrl) {
      setStyle(undefined);
      return;
    }
    (async () => {
      const res = await fetch(styleUrl);
      if (!res.ok) return;
      setStyle(new Cesium3DTileStyle(await res.json()));
    })();
  }, [styleUrl]);

  const tilesetUrl = useMemo(() => {
    return type === "osm-buildings" && isVisible
      ? IonResource.fromAssetId(96188, {
          accessToken: meta?.cesiumIonAccessToken as string | undefined,
        }) // https://github.com/CesiumGS/cesium/blob/main/packages/engine/Source/Scene/createOsmBuildings.js#L53
      : type === "3dtiles" && isVisible
      ? url ?? tileset
      : null;
  }, [isVisible, tileset, url, type, meta]);

  return {
    tilesetUrl,
    ref,
    style,
    clippingPlanes,
    builtinBoxProps,
  };
};
