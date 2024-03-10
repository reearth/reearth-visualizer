import { atom, useAtomValue } from "jotai";
import { omit } from "lodash-es";
import {
  ForwardedRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  RefObject,
} from "react";
import { useSet } from "react-use";
import { v4 as uuidv4 } from "uuid";

import { DATA_CACHE_KEYS } from "@reearth/beta/lib/core/mantle/atoms/data";
import { objectFromGetter } from "@reearth/beta/utils/object";

import { computeAtom, convertLegacyLayer, SelectedFeatureInfo } from "../../mantle";
import type { Atom, ComputedFeature, ComputedLayer, Layer, NaiveLayer } from "../../mantle";
import { FORCE_REQUEST_RENDER, REQUEST_RENDER_ONCE } from "../hooks";
import { EngineRef, RequestingRenderMode } from "../types";
import { useGet } from "../utils";

import { computedLayerKeys, layerKeys } from "./keys";
import { deepAssign } from "./utils";

export type { Layer, NaiveLayer } from "../../mantle";

/**
 * Same as a Layer, but all fields except id is lazily evaluated,
 * in order to reduce unnecessary sending and receiving of data to and from
 * QuickJS (a plugin runtime) and to improve performance.
 */
export type LazyLayer = Readonly<Layer> & {
  computed?: Readonly<ComputedLayer>;
  // compat
  pluginId?: string;
  extensionId?: string;
  property?: any;
  propertyId?: string;
  isVisible?: boolean;
};

export type Ref = {
  findById: (id: string) => LazyLayer | undefined;
  findByIds: (...ids: string[]) => (LazyLayer | undefined)[];
  add: (layer: NaiveLayer) => LazyLayer | undefined;
  addAll: (...layers: NaiveLayer[]) => (LazyLayer | undefined)[];
  replace: (...layers: Layer[]) => void;
  override: (id: string, layer?: (Partial<Layer> & { property?: any }) | null) => void;
  deleteLayer: (...ids: string[]) => void;
  isLayer: (obj: any) => obj is LazyLayer;
  layers: () => LazyLayer[];
  walk: <T>(
    fn: (layer: LazyLayer, index: number, parents: LazyLayer[]) => T | void,
  ) => T | undefined;
  find: (
    fn: (layer: LazyLayer, index: number, parents: LazyLayer[]) => boolean,
  ) => LazyLayer | undefined;
  findAll: (fn: (layer: LazyLayer, index: number, parents: LazyLayer[]) => boolean) => LazyLayer[];
  findByTags: (...tagIds: string[]) => LazyLayer[];
  findByTagLabels: (...tagLabels: string[]) => LazyLayer[];
  hide: (...layers: string[]) => void;
  show: (...layers: string[]) => void;
  select: (
    layerId: string | undefined,
    reason?: LayerSelectionReason,
    info?: SelectedFeatureInfo,
  ) => void;
  selectFeature: (
    layerId: string | undefined,
    featureId: string | undefined,
    reason?: LayerSelectionReason,
    info?: SelectedFeatureInfo,
  ) => void;
  selectFeatures: (
    layers: {
      layerId?: string;
      featureId?: string[];
    }[],
    reason?: LayerSelectionReason,
    info?: SelectedFeatureInfo,
  ) => void;
  selectedLayer: () => LazyLayer | undefined;
  selectedFeature: () => ComputedFeature | undefined;
  overriddenLayers: () => OverriddenLayer[];
};

export type DefaultInfobox = {
  title?: string;
  content:
    | {
        type: "table";
        value: { key: string; value: string }[];
      }
    | { type: "html"; value: string };
};

export type OverriddenLayer = Omit<Layer, "type" | "children">;

export type LayerSelectionReason = {
  reason?: string;
  defaultInfobox?: DefaultInfobox;
};

export type FeatureSelectionReason = {
  reason?: string;
  defaultInfobox?: DefaultInfobox;
};

export default function useHooks({
  layers,
  ref,
  hiddenLayers,
  selectedLayer: initialSelectedLayer,
  requestingRenderMode,
  onLayerSelect,
  engineRef,
}: {
  layers?: Layer[];
  ref?: ForwardedRef<Ref>;
  hiddenLayers?: string[];
  selectedLayer?: {
    layerId?: string;
    featureId?: string;
    selectionReason?: LayerSelectionReason;
  };
  requestingRenderMode?: MutableRefObject<RequestingRenderMode>;
  onLayerSelect?: (
    layerId: string | undefined,
    featureId: string | undefined,
    layer: (() => Promise<ComputedLayer | undefined>) | undefined,
    reason: LayerSelectionReason | undefined,
    info: SelectedFeatureInfo | undefined,
  ) => void;
  engineRef?: RefObject<EngineRef>;
}) {
  const layerMap = useMemo(() => new Map<string, Layer>(), []);
  const [overriddenLayers, setOverridenLayers] = useState<OverriddenLayer[]>([]);
  const atomMap = useMemo(() => new Map<string, Atom>(), []);
  const lazyLayerMap = useMemo(() => new Map<string, LazyLayer>(), []);

  const [hiddenLayerIds, { add: hideLayer, remove: showLayer }] = useSet<string>();
  const isHidden = useCallback(
    (id: string) => hiddenLayerIds.has(id) || !!hiddenLayers?.includes(id),
    [hiddenLayerIds, hiddenLayers],
  );

  const layersRef = useGet(layers);
  const [tempLayers, setTempLayers] = useState<Layer[]>([]);
  const tempLayersRef = useRef<Layer[]>([]);
  const flattenedLayers = useMemo((): Layer[] => {
    const newLayers = [...flattenLayers(layers ?? []), ...flattenLayers(tempLayers)];
    // apply overrides
    return newLayers.map(l => {
      const ol: any = overriddenLayers.find(ll => ll.id === l.id);
      if (!ol) return l;

      // prevents unnecessary copying of data value
      const dataValue = ol.data?.value ?? (l.type === "simple" ? l.data?.value : undefined);
      const res = deepAssign(
        {
          ...l,
          ...(l.type === "simple" && l.data ? { data: omit(l.data, "value") } : {}),
        },
        { ...ol, ...(ol.data ? { data: omit(ol.data, "value") } : {}) },
      );

      if (dataValue && res.data) {
        res.data.value = dataValue;
      }

      return res;
    });
  }, [tempLayers, layers, overriddenLayers]);

  const getComputedLayer = useAtomValue(
    useMemo(
      () =>
        atom(get => (layerId: string) => {
          const atoms = atomMap.get(layerId);
          if (!atoms) return;
          const cl = get(atoms);
          return cl;
        }),
      [atomMap],
    ),
  );

  const lazyComputedLayerPrototype = useMemo<object>(() => {
    return objectFromGetter(
      // id and layer should not be accessible
      computedLayerKeys,
      function (key) {
        const id: string | undefined = (this as any).id;
        if (!id || typeof id !== "string") throw new Error("layer ID is not specified");

        const layer = getComputedLayer(id);
        if (!layer) return undefined;
        return (layer as any)[key];
      },
    );
  }, [getComputedLayer]);

  const lazyLayerPrototype = useMemo<object>(() => {
    return objectFromGetter(layerKeys, function (key) {
      const id: string | undefined = (this as any).id;
      if (!id || typeof id !== "string") throw new Error("layer ID is not specified");

      const layer = layerMap.get(id);
      if (!layer) return undefined;

      // compat
      if (key === "pluginId") return layer.compat?.extensionId ? "reearth" : undefined;
      else if (key === "extensionId") return layer.compat?.extensionId;
      // TODO: Support normal layer's properties
      else if (key === "properties") return layer.type === "simple" ? layer.properties : undefined;
      else if (key === "property") return layer.compat?.property;
      else if (key === "propertyId") return layer.compat?.propertyId;
      else if (key === "isVisible") return layer.visible;
      // computed
      else if (key === "computed") {
        const computedLayer = getComputedLayer(layer.id);
        if (!computedLayer) return undefined;
        const computed = Object.create(lazyComputedLayerPrototype);
        computed.id = id;
        return computed;
      }

      return (layer as any)[key];
    });
  }, [getComputedLayer, layerMap, lazyComputedLayerPrototype]);

  const findById = useCallback(
    (layerId: string): LazyLayer | undefined => {
      const lazyLayer = lazyLayerMap.get(layerId);
      if (lazyLayer) return lazyLayer;

      if (!layerMap.has(layerId)) return;

      const l = Object.create(lazyLayerPrototype);
      l.id = layerId;
      lazyLayerMap.set(layerId, l);

      return l;
    },
    [layerMap, lazyLayerMap, lazyLayerPrototype],
  );

  const findByIds = useCallback(
    (...ids: string[]): (LazyLayer | undefined)[] => {
      return ids.map(id => findById(id));
    },
    [findById],
  );

  const add = useCallback(
    (layer: NaiveLayer): LazyLayer | undefined => {
      if (!isValidLayer(layer)) return;

      const rawLayer = compat(layer);
      if (!rawLayer) return;

      const newLayer = { ...rawLayer, id: uuidv4() };

      // generate ids for layers and blocks
      walkLayers([newLayer], l => {
        if (!l.id) {
          l.id = uuidv4();
        }
        l.infobox?.blocks?.forEach(b => {
          if (b.id) return;
          b.id = uuidv4();
        });
        layerMap.set(l.id, l);
        atomMap.set(l.id, computeAtom());
      });

      tempLayersRef.current = [...tempLayersRef.current, newLayer];
      setTempLayers(layers => [...layers, newLayer]);

      const newLazyLayer = findById(newLayer.id);
      if (!newLazyLayer) throw new Error("layer not found");

      return newLazyLayer;
    },
    [atomMap, findById, layerMap],
  );

  const addAll = useCallback(
    (...layers: NaiveLayer[]): (LazyLayer | undefined)[] => {
      return layers.map(l => add(l));
    },
    [add],
  );

  const replace = useCallback(
    (...layers: Layer[]) => {
      const validLayers = layers
        .filter(isValidLayer)
        .map(compat)
        .filter((l): l is Layer => !!l);
      setTempLayers(currentLayers => {
        replaceLayers(currentLayers, l => {
          const i = validLayers.findIndex(ll => ll.id === l.id);
          if (i >= 0) {
            const newLayer = { ...validLayers[i] };
            tempLayersRef.current[i] = newLayer;
            layerMap.set(newLayer.id, newLayer);
            return newLayer;
          }
          return;
        });
        return [...currentLayers];
      });
    },
    [layerMap],
  );

  const overriddenLayersRef = useRef(overriddenLayers);

  const override = useCallback(
    (id: string, layer?: (Partial<Layer> & { property?: any }) | null) => {
      const originalLayer = layerMap.get(id);
      if (!originalLayer) return;

      const overriddenLayer: any = overriddenLayersRef.current.find(l => l.id === id);
      // prevents unnecessary copying of data value
      const dataValue = (layer as any)?.data?.value ?? overriddenLayer?.data?.value;
      const res = deepAssign(
        {
          ...(overriddenLayer || {}),
          ...(overriddenLayer?.data ? { data: omit(overriddenLayer.data, "value") } : {}),
        },
        {
          ...(layer || {}),
          ...((layer as any)?.data ? { data: omit((layer as any).data, "value") } : {}),
        },
      );

      if (dataValue && res.data) {
        res.data.value = dataValue;
      }

      const property = layer?.property;
      const rawLayer = compat({
        ...(originalLayer.compat && property
          ? {
              type: originalLayer.type === "group" ? "group" : "item",
              extensionId: originalLayer.compat.extensionId,
              property: {
                default: {
                  ...(originalLayer.compat.property?.default || {}),
                  ...(property.default || {}),
                },
              },
            }
          : {}),
        ...(!originalLayer.compat && property ? { property } : {}),
        ...res,
      });

      if (!rawLayer) return;

      if (
        originalLayer.type === "simple" &&
        originalLayer.data?.value &&
        // If data isn't cachable, reuse layer id for performance.
        DATA_CACHE_KEYS.some(k => !originalLayer.data?.[k]) &&
        Object.isExtensible(originalLayer.data.value) &&
        rawLayer.type === "simple" &&
        rawLayer?.data?.value
      ) {
        // If layer property is overridden, feature is legacy layer.
        // So we can set layer id to prevent unnecessary render.
        rawLayer.data.value.id = id;
      }

      const layer2 = { id, ...omit(rawLayer, "id", "type", "children") } as Layer;
      const currentOverriddenlayers = overriddenLayersRef.current;
      const i = currentOverriddenlayers.findIndex(l => l.id === id);
      const updated =
        i < 0
          ? [...currentOverriddenlayers, layer2]
          : [
              ...currentOverriddenlayers.slice(0, i),
              layer2,
              ...currentOverriddenlayers.slice(i + 1),
            ];
      overriddenLayersRef.current = updated;
      setOverridenLayers(updated);
    },
    [layerMap],
  );

  const updateStyle = useCallback(
    (layerId: string) => {
      const overriddenLayer = overriddenLayersRef.current.find(l => l.id === layerId);
      override(layerId, { _updateStyle: (overriddenLayer?._updateStyle ?? -1) + 1 });
    },
    [override],
  );

  const { select, selectFeature, selectFeatures, selectedLayer, selectedFeature } = useSelection({
    initialSelectedLayer,
    getLazyLayer: findById,
    onLayerSelect,
    updateStyle,
    engineRef,
  });

  const deleteLayer = useCallback(
    (...ids: string[]) => {
      const selectedId = ids.find(id => id === initialSelectedLayer?.layerId);
      if (selectedId) {
        // Reset selected layer
        select();
      }
      setTempLayers(layers => {
        const deleted: Layer[] = [];
        const newLayers = filterLayers(layers, l => {
          if (ids.includes(l.id)) {
            deleted.push(l);
            return true;
          }
          return false;
        });
        deleted
          .map(l => l.id)
          .forEach(id => {
            layerMap.delete(id);
            atomMap.delete(id);
            lazyLayerMap.delete(id);
            showLayer(id);
          });
        tempLayersRef.current = tempLayersRef.current.filter(
          l => !deleted.find(ll => ll.id === l.id),
        );
        return newLayers;
      });
      const currentOverriddenlayers = overriddenLayersRef.current;
      const updated = currentOverriddenlayers.filter(l => !ids.includes(l.id));
      overriddenLayersRef.current = updated;
      setOverridenLayers(updated);
    },
    [layerMap, atomMap, lazyLayerMap, initialSelectedLayer, showLayer, select],
  );

  const isLayer = useCallback(
    (obj: any): obj is LazyLayer => {
      return typeof obj === "object" && Object.getPrototypeOf(obj) === lazyLayerPrototype;
    },
    [lazyLayerPrototype],
  );

  const rootLayers = useCallback(() => {
    return [...(layersRef() ?? []), ...tempLayersRef.current]
      .map(l => findById(l.id))
      .filter((l): l is LazyLayer => !!l);
  }, [findById, layersRef]);

  const walk = useCallback(
    <T>(fn: (layer: LazyLayer, index: number, parents: LazyLayer[]) => T | void): T | undefined => {
      return walkLayers([...(layersRef() ?? []), ...tempLayersRef.current], (l, i, p) => {
        const ll = findById(l.id);
        if (!ll) return;
        return fn(
          ll,
          i,
          p.map(l => findById(l.id)).filter((l): l is LazyLayer => !!l),
        );
      });
    },
    [findById, layersRef],
  );

  const find = useCallback(
    (
      fn: (layer: LazyLayer, index: number, parents: LazyLayer[]) => boolean,
    ): LazyLayer | undefined => {
      return walk((...args) => (fn(...args) ? args[0] : undefined));
    },
    [walk],
  );

  const findAll = useCallback(
    (fn: (layer: LazyLayer, index: number, parents: LazyLayer[]) => boolean): LazyLayer[] => {
      const res: LazyLayer[] = [];
      walk((...args) => {
        if (fn(...args)) res.push(args[0]);
      });
      return res;
    },
    [walk],
  );

  const findByTags = useCallback(
    (...tagIds: string[]): LazyLayer[] => {
      return findAll(
        l =>
          !!l.tags?.some(
            t => tagIds.includes(t.id) || !!t.tags?.some(tt => tagIds.includes(tt.id)),
          ),
      );
    },
    [findAll],
  );

  const findByTagLabels = useCallback(
    (...tagLabels: string[]): LazyLayer[] => {
      return findAll(
        l =>
          !!l.tags?.some(
            t => tagLabels.includes(t.label) || !!t.tags?.some(tt => tagLabels.includes(tt.label)),
          ),
      );
    },
    [findAll],
  );

  const hideLayers = useCallback(
    (...layers: string[]) => {
      for (const l of layers) {
        hideLayer(l);
      }
    },
    [hideLayer],
  );

  const showLayers = useCallback(
    (...layers: string[]) => {
      for (const l of layers) {
        showLayer(l);
      }
    },
    [showLayer],
  );

  const overriddenLayersGetter = useCallback(() => overriddenLayers, [overriddenLayers]);

  useImperativeHandle(
    ref,
    () => ({
      findById,
      add,
      addAll,
      replace,
      override,
      deleteLayer,
      findByIds,
      isLayer,
      layers: rootLayers,
      walk,
      find,
      findAll,
      findByTags,
      findByTagLabels,
      hide: hideLayers,
      show: showLayers,
      select,
      selectFeature,
      selectFeatures,
      selectedLayer,
      selectedFeature,
      overriddenLayers: overriddenLayersGetter,
    }),
    [
      findById,
      add,
      addAll,
      replace,
      override,
      deleteLayer,
      findByIds,
      isLayer,
      rootLayers,
      walk,
      find,
      findAll,
      findByTags,
      findByTagLabels,
      hideLayers,
      showLayers,
      select,
      selectFeature,
      selectFeatures,
      selectedLayer,
      selectedFeature,
      overriddenLayersGetter,
    ],
  );

  const prevLayers = useRef<Layer[] | undefined>([]);
  useLayoutEffect(() => {
    const ids = new Set<string>();

    walkLayers(layers ?? [], l => {
      ids.add(l.id);
      if (!atomMap.has(l.id)) {
        atomMap.set(l.id, computeAtom());
      }
      layerMap.set(l.id, l);
    });

    const deleted = prevLayers.current?.filter(l => !ids.has(l.id)).map(l => l.id);
    deleted?.forEach(k => {
      atomMap.delete(k);
      layerMap.delete(k);
      lazyLayerMap.delete(k);
      showLayer(k);
    });
    const currentOverriddenlayers = overriddenLayersRef.current;
    const updated = currentOverriddenlayers.filter(l => !deleted?.includes(l.id));
    overriddenLayersRef.current = updated;
    setOverridenLayers(updated);

    prevLayers.current = layers;
  }, [atomMap, layers, layerMap, lazyLayerMap, setOverridenLayers, showLayer]);

  useEffect(() => {
    if (!requestingRenderMode || requestingRenderMode.current === FORCE_REQUEST_RENDER) return;
    requestingRenderMode.current = REQUEST_RENDER_ONCE;
  }, [flattenedLayers, overriddenLayers, hiddenLayerIds, requestingRenderMode]);

  return { atomMap, flattenedLayers, isHidden };
}

function flattenLayers(layers: Layer[]): Layer[] {
  return layers.flatMap(l =>
    l.type === "group" && Array.isArray(l.children) ? flattenLayers(l.children) : [l],
  );
}

function walkLayers<T>(
  layers: Layer[],
  cb: (layer: Layer, i: number, parent: Layer[]) => T | void,
): T | undefined {
  for (let i = 0; i < layers.length; i++) {
    const l = layers[i];
    const res = cb(l, i, layers);
    if (typeof res !== "undefined") {
      return res;
    }
    if (l.type === "group" && Array.isArray(l.children)) {
      const res = walkLayers(l.children, cb);
      if (typeof res !== "undefined") {
        return res;
      }
    }
  }
  return;
}

function replaceLayers(
  layers: Layer[],
  cb: (layer: Layer, i: number, parent: Layer[]) => Layer | void,
): Layer[] {
  for (let i = 0; i < layers.length; i++) {
    const l = layers[i];
    const nl = cb(l, i, layers);
    if (nl) {
      layers[i] = nl;
    }
    if (l.type === "group" && Array.isArray(l.children)) {
      l.children = replaceLayers(l.children, cb);
    }
  }
  return layers;
}

function filterLayers(
  layers: Layer[],
  cb: (layer: Layer, i: number, parent: Layer[]) => boolean,
): Layer[] {
  const newLayers: Layer[] = [];
  for (let i = 0; i < layers.length; i++) {
    const l = layers[i];
    if (!cb(l, i, layers)) {
      newLayers.push(l);
    }
    if (l.type === "group" && Array.isArray(l.children)) {
      l.children = filterLayers(l.children, cb);
    }
  }
  return newLayers;
}

function isValidLayer(l: unknown): l is Layer {
  return !!l && typeof l === "object" && ("type" in l || "extensionId" in l);
}

function compat(layer: unknown): Layer | undefined {
  if (!layer || typeof layer !== "object") return;
  return "extensionId" in layer || "property" in layer
    ? convertLegacyLayer(layer as any)
    : (layer as Layer);
}

type SelectedLayer = [
  { layerId?: string; featureId?: string; reason?: LayerSelectionReason } | undefined,
  ComputedFeature | undefined,
];
function useSelection({
  initialSelectedLayer,
  engineRef,
  // flattenedLayers,
  getLazyLayer,
  onLayerSelect,
  updateStyle,
}: {
  initialSelectedLayer?: {
    layerId?: string;
    featureId?: string;
    reason?: LayerSelectionReason;
  };
  // flattenedLayers?: Layer[];
  getLazyLayer: (layerId: string) => LazyLayer | undefined;
  onLayerSelect?: (
    layerId: string | undefined,
    featureId: string | undefined,
    layer: (() => Promise<ComputedLayer | undefined>) | undefined,
    reason: LayerSelectionReason | undefined,
    info: SelectedFeatureInfo | undefined,
  ) => void;
  engineRef?: RefObject<EngineRef>;
  updateStyle: (layerId: string) => void;
}) {
  const [selectedLayer, selectedComputedFeature]: SelectedLayer = useMemo(
    () => [
      initialSelectedLayer
        ? {
            layerId: initialSelectedLayer?.layerId,
            featureId: initialSelectedLayer?.featureId,
            reason: initialSelectedLayer?.reason,
          }
        : undefined,
      initialSelectedLayer?.layerId && initialSelectedLayer.featureId
        ? engineRef?.current?.findComputedFeatureById(
            initialSelectedLayer.layerId,
            initialSelectedLayer.featureId,
          )
        : undefined,
    ],
    [initialSelectedLayer, engineRef],
  );

  const selectedLayerForRef = useCallback(
    () => (selectedLayer?.layerId ? getLazyLayer(selectedLayer.layerId) : undefined),
    [getLazyLayer, selectedLayer?.layerId],
  );

  const selectedFeatureForRef = useCallback(
    () => selectedComputedFeature,
    [selectedComputedFeature],
  );

  const select = useCallback(
    (layerId?: unknown, options?: LayerSelectionReason, info?: SelectedFeatureInfo) => {
      if (typeof layerId === "string") {
        onLayerSelect?.(
          layerId,
          undefined,
          layerId
            ? () =>
                new Promise(resolve => {
                  // Wait until computed feature is ready
                  queueMicrotask(() => {
                    resolve(getLazyLayer(layerId)?.computed);
                  });
                })
            : undefined,
          options,
          info,
        );
      } else if (options && selectedLayer?.layerId) {
        onLayerSelect?.(
          selectedLayer.layerId,
          selectedLayer?.featureId,
          () =>
            new Promise(resolve => {
              // Wait until computed feature is ready
              queueMicrotask(() => {
                resolve(getLazyLayer(selectedLayer.layerId ?? "")?.computed);
              });
            }),
          options,
          info,
        );
      } else {
        onLayerSelect?.(undefined, undefined, undefined, undefined, undefined);
      }
    },
    [selectedLayer, getLazyLayer, onLayerSelect],
  );

  const selectedFeatureIds = useRef<{ layerId: string; featureIds: string[] }[]>([]);

  const updateSelectedLayerForFeature = useCallback(
    (
      layers: {
        layerId?: string;
        featureId?: string[];
      }[],
      options?: LayerSelectionReason,
      info?: SelectedFeatureInfo,
    ) => {
      if (layers.length === 1) {
        const [{ layerId, featureId }] = layers;
        // TODO: Support multi select feature for ReEarth
        if (typeof layerId === "string" && (!featureId || featureId.length === 1)) {
          onLayerSelect?.(
            layerId,
            featureId?.[0],
            layerId
              ? () =>
                  new Promise(resolve => {
                    // Wait until computed feature is ready
                    queueMicrotask(() => {
                      resolve(getLazyLayer(layerId)?.computed);
                    });
                  })
              : undefined,
            options,
            info,
          );
        } else if (options) {
          onLayerSelect?.(
            selectedLayer?.layerId,
            selectedLayer?.featureId,
            layerId
              ? () =>
                  new Promise(resolve => {
                    // Wait until computed feature is ready
                    queueMicrotask(() => {
                      resolve(getLazyLayer(layerId)?.computed);
                    });
                  })
              : undefined,
            options,
            info,
          );
        } else {
          onLayerSelect?.(undefined, undefined, undefined, undefined, undefined);
        }
      } else {
        onLayerSelect?.(undefined, undefined, undefined, undefined, undefined);
      }
    },
    [selectedLayer, onLayerSelect, getLazyLayer],
  );

  const updateEngineFeatures = useCallback(
    (
      layers: {
        layerId?: string;
        featureId?: string[];
      }[],
    ): boolean => {
      let shouldUpdate = false;
      for (const { layerId, featureId } of layers) {
        if (!layerId || !featureId) continue;

        let selectedFeatureIdsIndex = selectedFeatureIds.current.findIndex(
          f => f.layerId === layerId,
        );
        if (selectedFeatureIdsIndex === -1) {
          selectedFeatureIdsIndex =
            selectedFeatureIds.current.push({
              layerId,
              featureIds: [],
            }) - 1;
        }

        if (featureId.length) {
          engineRef?.current?.selectFeatures(layerId, featureId);
          selectedFeatureIds.current[selectedFeatureIdsIndex].featureIds =
            selectedFeatureIds.current[selectedFeatureIdsIndex].featureIds.concat(featureId);
          shouldUpdate = true;
        }
      }
      return shouldUpdate;
    },
    [engineRef],
  );

  const selectFeatures = useCallback(
    (
      layers: {
        layerId?: string;
        featureId?: string[];
      }[],
      options?: LayerSelectionReason,
      info?: SelectedFeatureInfo,
    ) => {
      let shouldUpdate = false;
      selectedFeatureIds.current.forEach(id => {
        engineRef?.current?.unselectFeatures(id.layerId, id.featureIds);
        shouldUpdate = true;
      });

      const prevSelectedFeatureIds = selectedFeatureIds.current;
      selectedFeatureIds.current = [];

      updateSelectedLayerForFeature(layers, options, info);

      shouldUpdate = updateEngineFeatures(layers) || shouldUpdate;

      if (!shouldUpdate) return;

      for (const { layerId } of [...layers, ...prevSelectedFeatureIds]) {
        if (!layerId) continue;
        // Wait 1 frame for cesium to synchronize the updated value.
        requestAnimationFrame(() => updateStyle(layerId));
      }
    },
    [engineRef, updateStyle, updateEngineFeatures, updateSelectedLayerForFeature],
  );

  const selectFeature = useCallback(
    (
      layerId: string | undefined,
      featureId: string | undefined,
      options?: LayerSelectionReason,
      info?: SelectedFeatureInfo,
    ) => {
      if (!layerId || !featureId) return;
      onLayerSelect?.(
        layerId,
        featureId,
        layerId
          ? () =>
              new Promise(resolve => {
                // Wait until computed feature is ready
                queueMicrotask(() => {
                  resolve(getLazyLayer(layerId)?.computed);
                });
              })
          : undefined,
        options,
        info,
      );
    },
    [getLazyLayer, onLayerSelect],
  );

  return {
    selectedLayer: selectedLayerForRef,
    selectedFeature: selectedFeatureForRef,
    select,
    selectFeature,
    selectFeatures,
  };
}
