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
  GoogleMaps as CesiumGoogleMaps,
  Resource,
  defaultValue,
  ImageBasedLighting,
  Cesium3DTileContent,
  Color,
  Viewer,
} from "cesium";
import { pick } from "lodash-es";
import { MutableRefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CesiumComponentRef, useCesium } from "resium";

import { useRefValue } from "@reearth/beta/lib/core/hooks";
import { LayerSimple } from "@reearth/beta/lib/core/Map";

import type {
  ComputedFeature,
  ComputedLayer,
  Feature,
  EvalFeature,
  SceneProperty,
  Cesium3DTilesAppearance,
} from "../../..";
import { layerIdField, sampleTerrainHeightFromCartesian } from "../../common";
import { arrayToCartecian3 } from "../../helpers/sphericalHaromic";
import type { InternalCesium3DTileFeature } from "../../types";
import {
  convertCesium3DTileFeatureProperties,
  lookupFeatures,
  translationWithClamping,
} from "../../utils/utils";
import { useContext } from "../context";
import {
  usePick,
  attachTag,
  extractSimpleLayer,
  extractSimpleLayerData,
  generateIDWithMD5,
  toColor,
  getTag,
} from "../utils";

import { TilesetFeatureIndex } from "./TilesetFeatureIndex";
import { GoogleMaps } from "./types";
import { useClippingBox } from "./useClippingBox";
import { useDrawClipping } from "./useDrawClipping";

import { Property } from ".";

const DEFAULT_FEATURE_COLOR = Color.WHITE;

const useData = (layer: ComputedLayer | undefined) => {
  return useMemo(() => {
    const data = extractSimpleLayerData(layer);
    return {
      type: data?.type,
      url: data?.url,
      idProperty: data?.idProperty,
      layers: data?.layers
        ? Array.isArray(data.layers)
          ? data.layers.join(",")
          : data?.layers
        : undefined,
    };
  }, [layer]);
};

const makeFeatureId = (
  tileFeature: InternalCesium3DTileFeature,
  content: Cesium3DTileContent,
  idProperty?: string,
) => {
  const coordinates = content.tile.boundingSphere.center;
  const specifiedId =
    idProperty && !(tileFeature instanceof Model) ? tileFeature.getProperty(idProperty) : undefined;
  if (specifiedId) {
    return specifiedId as string;
  }
  const featureId = getBuiltinFeatureId(tileFeature);
  return generateIDWithMD5(
    `${coordinates.x}-${coordinates.y}-${coordinates.z}-${featureId}-${
      !(tileFeature instanceof Model)
        ? JSON.stringify(
            // Read only root properties.
            Object.entries(convertCesium3DTileFeatureProperties(tileFeature))
              .filter((_k, v) => typeof v === "string" || typeof v === "number")
              .map(([k, v]) => `${k}${v}`),
          )
        : ""
    }`,
  );
};

const makeFeatureFrom3DTile = (
  tileFeature: InternalCesium3DTileFeature,
  content: Cesium3DTileContent,
  idProperty?: string,
): Omit<Feature, "properties"> => {
  const coordinates = content.tile.boundingSphere.center;
  const id = makeFeatureId(tileFeature, content, idProperty);
  return {
    type: "feature",
    id,
    geometry: {
      type: "Point",
      coordinates: [coordinates.x, coordinates.y, coordinates.z],
    },
    range: {
      x: coordinates.x,
      y: coordinates.y,
      z: coordinates.z,
    },
  };
};

const getBuiltinFeatureId = (f: InternalCesium3DTileFeature) => {
  return (f instanceof Model ? f.id : f instanceof Cesium3DTileFeature ? f.featureId : "") ?? "";
};

type CachedFeature = {
  // NOTE: `properties` wastes memory, so don't pass it.
  feature: Omit<Feature, "properties">;
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
    return val === undefined ? val : `color("${val}")`;
  }

  return val;
};

const useFeature = ({
  id,
  tileset,
  idProperty,
  layer,
  viewer,
  featureIndex,
  selectedFeatureIdsRef,
  evalFeature,
  onComputedFeatureFetch,
  shouldUseFeatureIndex,
}: {
  id?: string;
  tileset: MutableRefObject<Cesium3DTileset | undefined>;
  idProperty?: string;
  layer?: ComputedLayer;
  viewer?: Viewer;
  evalFeature: EvalFeature;
  onComputedFeatureFetch?: (f: Feature[], cf: ComputedFeature[]) => void;
  featureIndex: TilesetFeatureIndex;
  selectedFeatureIdsRef: MutableRefObject<string[]>;
  shouldUseFeatureIndex?: boolean;
}) => {
  const cachedFeaturesRef = useRef<CachedFeature[]>([]);
  const cachedCalculatedLayerRef = useRef(layer);
  const cachedFeatureIds = useRef(new Set<string>());
  const layerId = layer?.id || id;
  const layerIdRef = useRefValue(layerId);

  const attachComputedFeature = useCallback(
    async (feature?: CachedFeature) => {
      const layer = cachedCalculatedLayerRef?.current?.layer;
      if (layer?.type === "simple" && feature?.feature) {
        const raw = feature.raw;
        const tag = getTag(raw);
        const properties =
          viewer && !(raw instanceof Model) ? convertCesium3DTileFeatureProperties(raw) : {};
        const isFeatureSelected = shouldUseFeatureIndex
          ? selectedFeatureIdsRef.current.includes(tag?.featureId ?? "")
          : tag?.isFeatureSelected;

        const computedFeature = evalFeature(layer, { ...feature?.feature, properties });

        const style = computedFeature?.["3dtiles"];

        COMMON_STYLE_PROPERTIES.forEach(({ name, convert }) => {
          if (name === "color") {
            if (isFeatureSelected) {
              raw.color =
                typeof layer["3dtiles"]?.selectedFeatureColor === "string"
                  ? toColor(layer["3dtiles"]?.selectedFeatureColor) ?? raw.color
                  : raw.color;
              return;
            }

            raw.color = DEFAULT_FEATURE_COLOR;
          }
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

        attachTag(feature.raw, {
          layerId,
          featureId: feature.feature.id,
          computedFeature,
          isFeatureSelected: tag?.isFeatureSelected,
        });

        return computedFeature;
      }
      return;
    },
    [evalFeature, layerId, viewer, shouldUseFeatureIndex, selectedFeatureIdsRef],
  );

  const handleTilesetLoad = useCallback(
    async (t: Cesium3DTile) => {
      if (t.tileset.isDestroyed()) return;
      const features = new Set<Feature>();
      await lookupFeatures(t.content, async (tileFeature, content, batchId) => {
        const feature = (() => {
          const normalFeature = makeFeatureFrom3DTile(tileFeature, content, idProperty);
          const feature: CachedFeature = {
            feature: normalFeature,
            raw: tileFeature,
          };
          return feature;
        })();

        // Attach tag temporally to select the feature correctly.
        attachTag(feature.raw, {
          layerId: layerIdRef.current,
          featureId: feature.feature.id,
        });

        if (batchId != null && shouldUseFeatureIndex) {
          featureIndex.addFeature(content, batchId, feature.feature.id);
        }

        await attachComputedFeature(feature);
        cachedFeaturesRef.current.push(feature);

        cachedFeatureIds.current.add(feature.feature.id);

        // NOTE: Don't pass a large object like `properties`.
        features.add(pick(feature.feature, ["id", "type", "range"]));
      });
      onComputedFeatureFetch?.(Array.from(features.values()), []);
    },
    [
      cachedFeaturesRef,
      attachComputedFeature,
      onComputedFeatureFetch,
      idProperty,
      featureIndex,
      shouldUseFeatureIndex,
      layerIdRef,
    ],
  );
  const handleTilesetLoadRef = useRef(handleTilesetLoad);
  handleTilesetLoadRef.current = handleTilesetLoad;
  useEffect(
    () =>
      tileset.current?.tileLoad.addEventListener((t: Cesium3DTile) =>
        handleTilesetLoadRef.current(t),
      ),
    [tileset],
  );

  const handleTilesetUnload = useCallback(
    async (t: Cesium3DTile) => {
      if (t.tileset.isDestroyed() || !shouldUseFeatureIndex) return;
      await lookupFeatures(t.content, async (tileFeature, content) => {
        featureIndex.deleteFeature(makeFeatureId(tileFeature, content, idProperty));
      });
    },
    [idProperty, featureIndex, shouldUseFeatureIndex],
  );
  const handleTilesetUnloadRef = useRef(handleTilesetUnload);
  handleTilesetUnloadRef.current = handleTilesetUnload;
  useEffect(
    () =>
      tileset.current?.tileUnload.addEventListener((t: Cesium3DTile) =>
        handleTilesetUnloadRef.current(t),
      ),
    [tileset],
  );

  useEffect(() => {
    cachedCalculatedLayerRef.current = layer;
  }, [layer]);

  // Update 3dtiles styles
  const tileAppearance = useMemo(() => extractSimpleLayer(layer)?.["3dtiles"], [layer]);
  const pickedAppearance = usePick(tileAppearance, TILESET_APPEARANCE_FIELDS);

  const updateStyle = shouldUseFeatureIndex ? 0 : layer?.layer._updateStyle;
  const prevUpdateStyle = useRef(updateStyle);

  // If styles are updated while features are calculating,
  // we stop calculating features, and reassign styles.
  const skippedComputingAt = useRef<number | null>();
  useEffect(() => {
    skippedComputingAt.current = Date.now();
  }, [pickedAppearance, updateStyle]);

  const computeFeatureAsync = useCallback(
    async (f: CachedFeature, startedComputingAt: number) =>
      new Promise(resolve =>
        requestAnimationFrame(() => {
          if (skippedComputingAt.current && skippedComputingAt.current > startedComputingAt) {
            resolve(undefined);
            return;
          }

          if (pickedAppearance || updateStyle) {
            attachComputedFeature(f);
          }
          resolve(undefined);
        }),
      ),
    [pickedAppearance, attachComputedFeature, updateStyle],
  );

  const computeFeatures = useCallback(
    async (startedComputingAt: number) => {
      const tempAsyncProcesses: Promise<unknown>[] = [];
      let skipped = false;
      // TODO: Search the layer's features from tilesetRef to improve performance instead of using cachedFeaturesRef
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
      prevUpdateStyle.current = updateStyle;
      tempAsyncProcesses.length = 0;
    },
    [computeFeatureAsync, updateStyle],
  );

  const { requestRender } = useContext();

  useEffect(() => {
    const compute = async () => {
      const startedComputingAt = Date.now();
      await computeFeatures(startedComputingAt);
      requestRender?.();
    };
    compute();
  }, [computeFeatures, requestRender, updateStyle]);
};

export const useHooks = ({
  id,
  boxId,
  isVisible,
  property,
  sceneProperty,
  layer,
  meta,
  evalFeature,
  onComputedFeatureFetch,
  onLayerFetch,
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
  onComputedFeatureFetch?: (f: Feature[], cf: ComputedFeature[]) => void;
  onLayerFetch?: (value: Partial<Pick<LayerSimple, "properties">>) => void;
}) => {
  const { viewer } = useCesium();
  const tilesetRef = useRef<Cesium3DTilesetType>();
  const { onLayerLoad } = useContext();
  const layerIdRef = useRef(layer?.id);
  layerIdRef.current = layer?.id;

  const {
    tileset,
    styleUrl,
    edgeColor,
    edgeWidth,
    experimental_clipping,
    apiKey,
    selectedFeatureColor,
    disableIndexingFeature,
  } = property ?? {};
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
  const { url, type, idProperty } = useData(layer);
  const shouldUseFeatureIndex = !disableIndexingFeature && !!idProperty;

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

  const { drawClippingEnabled, drawClippingEdgeProps } = useDrawClipping({
    ...experimental_clipping?.draw,
    tilesetRef,
    viewer,
    clippingPlanes,
  });
  const [featureIndex] = useState(() => new TilesetFeatureIndex());

  const ref = useCallback(
    (tileset: CesiumComponentRef<Cesium3DTilesetType> | null) => {
      if (tileset?.cesiumElement) {
        attachTag(tileset.cesiumElement, {
          layerId: layer?.id || id,
          featureIndex: shouldUseFeatureIndex ? featureIndex : undefined,
          appearanceType: "3dtiles",
        });
      }
      if (layer?.id && tileset?.cesiumElement) {
        (tileset?.cesiumElement as any)[layerIdField] = layer.id;
      }
      tilesetRef.current = tileset?.cesiumElement;
    },
    [id, layer?.id, featureIndex, shouldUseFeatureIndex],
  );

  const selectedFeatureIdsRef = useRef<string[]>([]);
  const selectedFeatureColorRef = useRef(selectedFeatureColor);
  selectedFeatureColorRef.current = selectedFeatureColor;
  const [selectedFeatureColorMap] = useState(() => new Map<string, Color>());

  useEffect(() => {
    if (!tilesetRef.current || !shouldUseFeatureIndex) return;
    Object.assign(tilesetRef.current, {
      onSelectFeature: (f: Cesium3DTileFeature) => {
        const tag = getTag(f);
        if (tag?.featureId) {
          selectedFeatureIdsRef.current.push(tag.featureId);
          selectedFeatureColorMap.set(tag.featureId, f.color);
        }
        if (selectedFeatureColorRef.current) {
          f.color = toColor(selectedFeatureColorRef.current) ?? f.color;
        }
      },
      onUnselectFeature: (f: Cesium3DTileFeature) => {
        const tag = getTag(f);
        if (tag?.featureId) {
          selectedFeatureIdsRef.current = selectedFeatureIdsRef.current.filter(
            v => v !== tag.featureId,
          );
        }
        f.color = selectedFeatureColorMap.get(tag?.featureId ?? "") ?? DEFAULT_FEATURE_COLOR;
      },
    });
  }, [selectedFeatureColorMap, featureIndex, shouldUseFeatureIndex]);

  useFeature({
    id,
    tileset: tilesetRef,
    layer,
    idProperty,
    viewer,
    evalFeature,
    onComputedFeatureFetch,
    featureIndex,
    selectedFeatureIdsRef,
    shouldUseFeatureIndex,
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
    if (experimental_clipping?.draw) return;

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
    experimental_clipping?.draw,
  ]);

  useEffect(() => {
    if (experimental_clipping?.draw) return;
    clippingPlanes.enabled = clippingVisible;
  }, [clippingPlanes, clippingVisible, experimental_clipping?.draw]);

  useEffect(() => {
    if (experimental_clipping?.draw) return;
    clippingPlanes.unionClippingRegions = direction === "outside";
  }, [clippingPlanes, direction, experimental_clipping?.draw]);

  useEffect(() => {
    if (experimental_clipping?.draw) return;
    clippingPlanes.removeAll();
    planes?.forEach(plane =>
      clippingPlanes.add(
        new ClippingPlane(
          new Cartesian3(plane.normal?.x, plane.normal?.y, plane.normal?.z),
          (plane.distance || 0) * clipDirection,
        ),
      ),
    );
  }, [planes, clippingPlanes, clipDirection, experimental_clipping?.draw]);

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

  const googleMapResource = useMemo(() => {
    if (type !== "google-photorealistic" || !isVisible) return;
    // Ref: https://github.com/CesiumGS/cesium/blob/b208135a095073386e5f04a59956ee11a03aa847/packages/engine/Source/Scene/createGooglePhotorealistic3DTileset.js#L30
    const googleMaps = CesiumGoogleMaps as GoogleMaps;
    // Default key: https://github.com/CesiumGS/cesium/blob/b208135a095073386e5f04a59956ee11a03aa847/packages/engine/Source/Core/GoogleMaps.js#L6C36-L6C36
    const key = defaultValue(apiKey, googleMaps.defaultApiKey);
    const credit = googleMaps.getDefaultApiKeyCredit(key);
    return new Resource({
      url: `${googleMaps.mapTilesApiEndpoint}3dtiles/root.json`,
      queryParameters: { key },
      credits: credit ? [credit] : undefined,
    } as Resource.ConstructorOptions);
  }, [apiKey, type, isVisible]);

  const tilesetUrl = useMemo(() => {
    return type === "osm-buildings" && isVisible
      ? IonResource.fromAssetId(96188, {
          accessToken: meta?.cesiumIonAccessToken as string | undefined,
        }) // https://github.com/CesiumGS/cesium/blob/main/packages/engine/Source/Scene/createOsmBuildings.js#L53
      : googleMapResource
      ? googleMapResource
      : type === "3dtiles" && isVisible
      ? url ?? tileset
      : null;
  }, [isVisible, tileset, url, type, meta, googleMapResource]);

  const imageBasedLighting = useMemo(() => {
    if (
      !property?.specularEnvironmentMaps &&
      !property?.sphericalHarmonicCoefficients &&
      !sceneProperty?.light?.specularEnvironmentMaps &&
      !sceneProperty?.light?.sphericalHarmonicCoefficients
    )
      return;

    const ibl = new ImageBasedLighting();
    const specularEnvironmentMaps =
      property?.specularEnvironmentMaps ?? sceneProperty?.light?.specularEnvironmentMaps;
    const imageBasedLightIntensity =
      property?.imageBasedLightIntensity ?? sceneProperty?.light?.imageBasedLightIntensity;
    const sphericalHarmonicCoefficients = arrayToCartecian3(
      property?.sphericalHarmonicCoefficients ??
        sceneProperty?.light?.sphericalHarmonicCoefficients,
      imageBasedLightIntensity,
    );

    if (specularEnvironmentMaps) {
      ibl.specularEnvironmentMaps = specularEnvironmentMaps;
    }
    if (sphericalHarmonicCoefficients) {
      ibl.sphericalHarmonicCoefficients = sphericalHarmonicCoefficients;
    }
    return ibl;
  }, [
    property?.specularEnvironmentMaps,
    property?.sphericalHarmonicCoefficients,
    property?.imageBasedLightIntensity,
    sceneProperty?.light?.specularEnvironmentMaps,
    sceneProperty?.light?.sphericalHarmonicCoefficients,
    sceneProperty?.light?.imageBasedLightIntensity,
  ]);

  const handleReady = useCallback(
    (tileset: Cesium3DTileset) => {
      onLayerFetch?.({ properties: tileset.properties });
      onLayerLoad?.({ layerId: layerIdRef.current });
    },
    [onLayerFetch, onLayerLoad],
  );

  return {
    tilesetUrl,
    ref,
    style,
    clippingPlanes,
    drawClippingEnabled,
    drawClippingEdgeProps,
    builtinBoxProps,
    imageBasedLighting,
    handleReady,
  };
};
