import { Rectangle, Cartographic, Math as CesiumMath } from "cesium";
import { omit } from "lodash";
import { useRef, useEffect, useMemo, useState, useCallback, RefObject } from "react";
import { initialize, pageview } from "react-ga";
import { useSet, useUpdate } from "react-use";

import { useDrop, DropOptions } from "@reearth/util/use-dnd";
import { Camera, LatLng, ValueTypes, ValueType } from "@reearth/util/value";

import type {
  OverriddenInfobox,
  Ref as EngineRef,
  SceneProperty,
  SelectLayerOptions,
} from "./Engine";
import type { Props as InfoboxProps, Block } from "./Infobox";
import { LayerStore, Layer } from "./Layers";
import type { ProviderProps } from "./Plugin";
import type { CameraOptions, FlyToDestination, LookAtDestination, Tag } from "./Plugin/types";
import { mergeProperty } from "./utils";

export default ({
  engineType,
  rootLayerId,
  isEditable,
  isBuilt,
  isPublished,
  rootLayer,
  selectedLayerId: outerSelectedLayerId,
  selectedBlockId: outerSelectedBlockId,
  camera,
  sceneProperty,
  tags,
  onLayerSelect,
  onBlockSelect,
  onBlockChange,
  onCameraChange,
  onLayerDrop,
}: {
  engineType?: string;
  rootLayerId?: string;
  isEditable?: boolean;
  isBuilt?: boolean;
  isPublished?: boolean;
  rootLayer?: Layer;
  selectedLayerId?: string;
  selectedBlockId?: string;
  camera?: Camera;
  sceneProperty?: SceneProperty;
  tags?: Tag[];
  onLayerSelect?: (id?: string) => void;
  onBlockSelect?: (id?: string) => void;
  onBlockChange?: <T extends keyof ValueTypes>(
    blockId: string,
    schemaGroupId: string,
    fid: string,
    v: ValueTypes[T],
    vt: T,
    selectedLayer?: Layer,
  ) => void;
  onCameraChange?: (c: Camera) => void;
  onLayerDrop?: (layer: Layer, key: string, latlng: LatLng) => void;
}) => {
  const engineRef = useRef<EngineRef>(null);

  const [overriddenSceneProperty, overrideSceneProperty] = useState<{ [pluginId: string]: any }>(
    {},
  );

  const handleScenePropertyOverride = useCallback((pluginId: string, property: any) => {
    overrideSceneProperty(p =>
      pluginId && property ? { ...p, [pluginId]: property } : omit(p, pluginId),
    );
  }, []);

  const mergedSceneProperty = useMemo(() => {
    return Object.values(overriddenSceneProperty).reduce(
      (p, v) => mergeProperty(p, v),
      sceneProperty,
    );
  }, [sceneProperty, overriddenSceneProperty]);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const { ref: dropRef, isDroppable } = useDrop(
    useMemo(
      (): DropOptions => ({
        accept: ["primitive"],
        drop(_item, context) {
          if (!rootLayerId || !isEditable) return;
          const loc = context.position
            ? engineRef.current?.getLocationFromScreenXY(context.position.x, context.position.y)
            : undefined;
          return {
            type: "earth",
            layerId: rootLayerId,
            position: loc ? { lat: loc.lat, lng: loc.lng, height: loc.height } : undefined,
          };
        },
        wrapperRef,
      }),
      [rootLayerId, isEditable],
    ),
  );
  dropRef(wrapperRef);

  const {
    selectedLayer,
    selectedLayerId,
    layerOverriddenProperties,
    layerSelectionReason,
    layerOverridenInfobox,
    infobox,
    layers,
    selectLayer,
    hideLayers,
    isLayerHidden,
    showLayers,
    addLayer,
    overrideLayerProperty,
  } = useLayers({
    rootLayer,
    selected: outerSelectedLayerId,
    onSelect: onLayerSelect,
  });

  // selected block
  const [selectedBlockId, selectBlock] = useInnerState<string>(outerSelectedBlockId, onBlockSelect);

  useEffect(() => {
    if (!isEditable || !isBuilt) {
      selectBlock();
    }
  }, [isEditable, isBuilt, selectBlock]);

  const changeBlock = useCallback(
    <T extends ValueType>(
      blockId: string,
      schemaItemId: string,
      fieldId: string,
      value: ValueTypes[T],
      type: T,
    ) => {
      onBlockChange?.(blockId, schemaItemId, fieldId, value, type, selectedLayer);
    },
    [onBlockChange, selectedLayer],
  );

  // camera
  const [innerCamera, setInnerCamera] = useState(camera);
  useEffect(() => {
    setInnerCamera(camera);
  }, [camera]);

  const updateCamera = useCallback(
    (camera: Camera) => {
      setInnerCamera(camera);
      onCameraChange?.(camera);
    },
    [onCameraChange],
  );

  // dnd
  const [isLayerDragging, setIsLayerDragging] = useState(false);
  const handleLayerDrag = useCallback(() => {
    setIsLayerDragging(true);
  }, []);
  const handleLayerDrop = useCallback(
    (id: string, key: string, latlng: LatLng | undefined) => {
      setIsLayerDragging(false);
      const layer = layers.findById(id);
      if (latlng && layer) onLayerDrop?.(layer, key, latlng);
    },
    [onLayerDrop, layers],
  );

  // GA
  const { enableGA, trackingId } = sceneProperty?.googleAnalytics || {};

  useEffect(() => {
    if (!isPublished || !enableGA || !trackingId) return;
    initialize(trackingId);
    pageview(window.location.pathname);
  }, [isPublished, enableGA, trackingId]);

  const providerProps: ProviderProps = useProviderProps(
    {
      engineName: engineType || "",
      mergedSceneProperty,
      tags,
      camera: innerCamera,
      selectedLayer,
      layerSelectionReason,
      layerOverridenInfobox,
      layerOverriddenProperties,
      showLayer: showLayers,
      hideLayer: hideLayers,
      addLayer,
      selectLayer,
      overrideLayerProperty,
    },
    engineRef,
    layers,
  );

  useEffect(() => {
    engineRef.current?.requestRender();
  });

  const handleInfoboxMaskClick = useCallback(() => {
    selectLayer(undefined);
  }, [selectLayer]);

  return {
    engineRef,
    wrapperRef,
    isDroppable,
    providerProps,
    selectedLayerId,
    selectedLayer,
    layers,
    layerSelectionReason,
    layerOverriddenProperties,
    isLayerDragging,
    selectedBlockId,
    innerCamera,
    infobox,
    mergedSceneProperty,
    isLayerHidden,
    selectLayer,
    selectBlock,
    changeBlock,
    updateCamera,
    handleLayerDrag,
    handleLayerDrop,
    handleInfoboxMaskClick,
    overrideSceneProperty: handleScenePropertyOverride,
  };
};

function useLayers({
  rootLayer,
  selected: outerSelectedPrimitiveId,
  onSelect,
}: {
  rootLayer?: Layer;
  selected?: string;
  onSelect?: (id?: string, options?: SelectLayerOptions) => void;
}) {
  const [selectedLayerId, innerSelectLayer] = useState<string | undefined>();
  const [layerSelectionReason, setSelectionReason] = useState<string | undefined>();
  const [layerOverridenInfobox, setPrimitiveOverridenInfobox] = useState<OverriddenInfobox>();
  const [layers] = useState<LayerStore>(() => new LayerStore(rootLayer));
  const forceUpdate = useUpdate();

  useEffect(() => {
    layers.setRootLayer(rootLayer);
    forceUpdate();
  }, [layers, rootLayer, forceUpdate]);

  const selectedLayer = useMemo(
    () => (selectedLayerId ? layers?.findById(selectedLayerId) : undefined),
    [selectedLayerId, layers],
  );

  const selectLayer = useCallback(
    (id?: string, { reason, overriddenInfobox }: SelectLayerOptions = {}) => {
      if (!id || !layers.findById(id)) return;
      innerSelectLayer(id);
      onSelect?.(id);
      setSelectionReason(reason);
      setPrimitiveOverridenInfobox(overriddenInfobox);
    },
    [onSelect, layers],
  );

  const addLayer = useCallback(
    (layer: Layer, parentId?: string, creator?: string) => {
      const id = layers.add(layer, parentId, creator);
      forceUpdate();
      return id;
    },
    [layers, forceUpdate],
  );

  const blocks = useMemo(
    (): Block[] | undefined => overridenInfoboxBlocks(layerOverridenInfobox),
    [layerOverridenInfobox],
  );

  const infobox = useMemo<
    | Pick<InfoboxProps, "infoboxKey" | "title" | "visible" | "layer" | "blocks" | "isEditable">
    | undefined
  >(
    () =>
      selectedLayer
        ? {
            infoboxKey: selectedLayer.id,
            title: layerOverridenInfobox?.title || selectedLayer.title,
            isEditable: !layerOverridenInfobox && !!selectedLayer.infobox,
            visible: !!selectedLayer?.infobox,
            layer: selectedLayer,
            blocks,
          }
        : undefined,
    [selectedLayer, layerOverridenInfobox, blocks],
  );

  const [, { add: hideLayer, remove: showLayer, has: isLayerHidden }] = useSet<string>();
  const showLayers = useCallback(
    (...ids: string[]) => {
      for (const id of ids) {
        showLayer(id);
      }
    },
    [showLayer],
  );
  const hideLayers = useCallback(
    (...ids: string[]) => {
      for (const id of ids) {
        hideLayer(id);
      }
    },
    [hideLayer],
  );

  useEffect(() => {
    innerSelectLayer(outerSelectedPrimitiveId);
    setSelectionReason(undefined);
    setPrimitiveOverridenInfobox(undefined);
  }, [outerSelectedPrimitiveId]);

  const [layerOverriddenProperties, setLayeroverriddenProperties] = useState<{
    [id in string]: any;
  }>({});
  const overrideLayerProperty = useCallback((id: string, property: any) => {
    if (!id) return;
    if (typeof property !== "object") {
      setLayeroverriddenProperties(p => {
        delete p[id];
        return { ...p };
      });
      return;
    }
    setLayeroverriddenProperties(p => ({
      ...p,
      [id]: property,
    }));
  }, []);

  return {
    layers,
    selectedLayer,
    selectedLayerId,
    layerSelectionReason,
    layerOverridenInfobox,
    layerOverriddenProperties,
    infobox,
    isLayerHidden,
    selectLayer,
    showLayers,
    hideLayers,
    addLayer,
    overrideLayerProperty,
  };
}

function useInnerState<T>(
  value: T | undefined,
  onChange: ((value?: T) => void) | undefined,
): readonly [T | undefined, (value?: T) => void] {
  const [innerState, innerSetState] = useState<T>();

  const setState = useCallback(
    (newValue?: T) => {
      innerSetState(newValue);
      onChange?.(newValue);
    },
    [onChange],
  );

  useEffect(() => {
    innerSetState(value);
  }, [value]);

  return [innerState, setState];
}

function overridenInfoboxBlocks(
  overriddenInfobox: OverriddenInfobox | undefined,
): Block[] | undefined {
  return overriddenInfobox && Array.isArray(overriddenInfobox?.content)
    ? [
        {
          id: "content",
          pluginId: "reearth",
          extensionId: "dlblock",
          property: {
            items: overriddenInfobox.content.map((c, i) => ({
              id: i,
              item_title: c.key,
              item_datastr: String(c.value),
              item_datatype: "string",
            })),
          },
        },
      ]
    : undefined;
}

function useProviderProps(
  props: Omit<
    ProviderProps,
    | "engine"
    | "flyTo"
    | "lookAt"
    | "zoomIn"
    | "zoomOut"
    | "layers"
    | "layersInViewport"
    | "viewport"
  >,
  engineRef: RefObject<EngineRef>,
  layers: LayerStore,
): ProviderProps {
  const isMarshalable = useCallback(
    (obj: any): boolean | "json" => {
      const im = engineRef.current?.isMarshalable ?? false;
      return typeof im === "function" ? im(obj) : im;
    },
    [engineRef],
  );

  const engine = useMemo(
    () => ({
      get api() {
        return engineRef.current?.pluginApi;
      },
      isMarshalable,
      get builtinPrimitives() {
        return engineRef.current?.builtinPrimitives;
      },
    }),
    [engineRef, isMarshalable],
  );

  const flyTo = useCallback(
    (dest: FlyToDestination, options?: CameraOptions) => {
      engineRef.current?.flyTo(dest, options);
    },
    [engineRef],
  );

  const lookAt = useCallback(
    (dest: LookAtDestination, options?: CameraOptions) => {
      engineRef.current?.lookAt(dest, options);
    },
    [engineRef],
  );

  const viewport = useCallback(() => {
    return engineRef.current?.getViewport();
  }, [engineRef]);

  const layersInViewport = useCallback(() => {
    const rect = engineRef.current?.getViewport();
    return layers.findAll(
      layer =>
        rect &&
        layer.property?.default?.location &&
        typeof layer.property.default.location.lng === "number" &&
        typeof layer.property.default.location.lat === "number" &&
        Rectangle.contains(
          new Rectangle(
            CesiumMath.toRadians(rect.west),
            CesiumMath.toRadians(rect.south),
            CesiumMath.toRadians(rect.east),
            CesiumMath.toRadians(rect.north),
          ),
          Cartographic.fromDegrees(
            layer.property.default.location.lng,
            layer.property.default.location.lat,
          ),
        ),
    );
  }, [engineRef, layers]);

  const zoomIn = useCallback(
    (amount: number) => {
      engineRef.current?.zoomIn(amount);
    },
    [engineRef],
  );

  const zoomOut = useCallback(
    (amount: number) => {
      engineRef.current?.zoomOut(amount);
    },
    [engineRef],
  );

  return {
    ...props,
    engine,
    flyTo,
    lookAt,
    zoomIn,
    zoomOut,
    layers,
    layersInViewport,
    viewport,
  };
}
