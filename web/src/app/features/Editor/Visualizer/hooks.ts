import type {
  Alignment,
  Location
} from "@reearth/app/features/Visualizer/Crust";
import {
  convertData,
  sceneProperty2ViewerPropertyMapping
} from "@reearth/app/utils/convert-object";
import { DeviceType } from "@reearth/app/utils/device";
import { Camera, toWidgetAlignSystemType } from "@reearth/app/utils/value";
import type { LatLng, ComputedLayer, ComputedFeature } from "@reearth/core";
import {
  useInfoboxBlockMutations,
  useInstallableInfoboxBlocks
} from "@reearth/services/api/infobox";
import { useNLSLayers } from "@reearth/services/api/layer";
import { useLayerStyles } from "@reearth/services/api/layerStyle";
import { usePropertyMutations } from "@reearth/services/api/property";
import { useStoryBlockMutations } from "@reearth/services/api/storytelling";
import { useWidgetMutations } from "@reearth/services/api/widget";
import { config } from "@reearth/services/config";
import { useAtomValue } from "jotai";
import {
  useMemo,
  useEffect,
  useCallback,
  useState,
  MutableRefObject,
  useRef
} from "react";

import { useCurrentCamera } from "../atoms";
import type { LayerSelectProps, SelectedLayer } from "../hooks/useLayers";
import useScene from "../hooks/useScene";
import {
  PhotoOverlayPreviewAtom,
  SketchFeatureTooltipAtom
} from "../Map/state";

import { convertWidgets, processLayers, processProperty } from "./convert";
import { convertStory } from "./convert-story";
import { ViewerProperty } from "./type";

export default ({
  sceneId,
  storyId,
  isBuilt,
  showStoryPanel,
  selectedLayer,
  isVisualizerResizing,
  onCoreLayerSelect,
  onVisualizerReady,
  setSelectedStoryPageId,
  forceDevice
}: {
  sceneId?: string;
  storyId?: string;
  isBuilt?: boolean;
  showStoryPanel?: boolean;
  selectedLayer?: SelectedLayer | undefined;
  isVisualizerResizing?: MutableRefObject<boolean>;
  onCoreLayerSelect: (props: LayerSelectProps) => void;
  onVisualizerReady: (value: boolean) => void;
  setSelectedStoryPageId: (value: string | undefined) => void;
  forceDevice?: DeviceType;
}) => {
  const { updateWidget, updateWidgetAlignSystem } = useWidgetMutations();
  const { createStoryBlock, deleteStoryBlock } = useStoryBlockMutations();
  const {
    updatePropertyValue,
    addPropertyItem,
    movePropertyItem,
    removePropertyItem
  } = usePropertyMutations();

  const { createInfoboxBlock, deleteInfoboxBlock, moveInfoboxBlock } =
    useInfoboxBlockMutations();

  const [currentCamera, setCurrentCamera] = useCurrentCamera();
  const handleCameraUpdate = useCallback(
    (camera: Camera) => {
      setCurrentCamera(camera);
    },
    [setCurrentCamera]
  );

  const { nlsLayers } = useNLSLayers({ sceneId });
  const { layerStyles } = useLayerStyles({ sceneId });
  const { scene } = useScene({ sceneId });

  const [zoomedLayerId, zoomToLayer] = useState<string | undefined>(undefined);
  const [initialCamera, setInitialCamera] = useState<Camera | undefined>(
    undefined
  );
  const isInitialized = useRef(false);

  // Workaround: Temporarily disable terrain when terrain is enabled
  // We don't know the root cause yet, but it seems that terrain is not loaded properly when terrain is enabled on Editor
  const [tempDisableTerrain, setTempDisableTerrain] = useState(true);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setTempDisableTerrain(false);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, []);

  const prevFOV = useRef<number | undefined>(undefined);
  const fovTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { viewerProperty, cesiumIonAccessToken } = useMemo(() => {
    const sceneProperty = processProperty(scene?.property);
    const cesiumIonAccessToken = sceneProperty?.default?.ion;

    const initialCamera =
      sceneProperty?.camera?.camera || sceneProperty?.camera?.fov
        ? {
            ...(sceneProperty?.camera?.camera ?? {}),
            ...(sceneProperty?.camera?.fov
              ? { fov: sceneProperty.camera.fov }
              : {})
          }
        : undefined;
    if (initialCamera) {
      setInitialCamera(initialCamera);
    }

    // Clear previous timeout
    if (fovTimeoutRef.current) {
      clearTimeout(fovTimeoutRef.current);
    }

    fovTimeoutRef.current = setTimeout(() => {
      if (initialCamera?.fov && initialCamera.fov !== prevFOV.current) {
        prevFOV.current = initialCamera.fov;
        setCurrentCamera((c) =>
          !c ? undefined : { ...c, fov: initialCamera.fov }
        );
      }
      fovTimeoutRef.current = null;
    }, 0);

    const viewerProperty = sceneProperty
      ? (convertData(
          sceneProperty,
          sceneProperty2ViewerPropertyMapping
        ) as ViewerProperty)
      : undefined;

    if (
      viewerProperty &&
      tempDisableTerrain &&
      viewerProperty.terrain &&
      viewerProperty.terrain.enabled
    ) {
      viewerProperty.terrain.enabled = false;
    }

    return {
      viewerProperty,
      cesiumIonAccessToken
    };
  }, [scene?.property, tempDisableTerrain, setCurrentCamera]);

  // Cleanup fovTimeoutRef on unmount
  useEffect(() => {
    return () => {
      if (fovTimeoutRef.current) {
        clearTimeout(fovTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;
    setCurrentCamera(initialCamera);
  }, [initialCamera, setCurrentCamera]);

  const { installableInfoboxBlocks } = useInstallableInfoboxBlocks({
    sceneId
  });

  const infoboxBlockNames = useMemo(
    () =>
      installableInfoboxBlocks
        ?.map((ib) => ({ [ib.extensionId]: ib.name }))
        .filter((bn): bn is Record<string, string> => !!bn)
        .reduce((result, obj) => {
          Object.assign(result, obj);
          return result;
        }, {}),
    [installableInfoboxBlocks]
  );

  const processedLayers = useMemo(
    () => processLayers(nlsLayers, layerStyles, undefined, infoboxBlockNames),
    [nlsLayers, layerStyles, infoboxBlockNames]
  );

  const layers = useMemo(() => {
    if (!showStoryPanel) return processedLayers;
    return processedLayers?.map((layer) => ({
      ...layer,
      visible: true
    }));
  }, [processedLayers, showStoryPanel]);
  const handleCoreLayerSelect = useCallback(
    (
      layerId?: string,
      computedLayer?: ComputedLayer,
      computedFeature?: ComputedFeature
    ) => {
      if (
        (!layerId && !computedFeature && !selectedLayer) ??
        (layerId === selectedLayer?.layer?.id || !computedFeature)
      )
        return;

      if (layerId) {
        onCoreLayerSelect({ layerId, computedLayer, computedFeature });
      } else {
        onCoreLayerSelect(undefined);
      }
    },
    [selectedLayer, onCoreLayerSelect]
  );

  const handleLayerDrop = useCallback(
    async (_propertyId: string, propertyKey: string, _position?: LatLng) => {
      // propertyKey will be "default.location" for example
      const [_schemaGroupId, _fieldId] = propertyKey.split(".", 2);
    },
    []
  );

  // Device for WAS
  const [detectedDevice, setDetectedDevice] = useState<DeviceType>("desktop");

  const handleDeviceChange = useCallback(
    (device: DeviceType) => {
      setDetectedDevice(device);
    },
    [setDetectedDevice]
  );

  const device = forceDevice !== undefined ? forceDevice : detectedDevice;

  // Widgets
  const widgets = useMemo(() => convertWidgets(scene, device), [scene, device]);

  const handleWidgetUpdate = useCallback(
    async (
      id: string,
      update: { location?: Location; extended?: boolean; index?: number }
    ) => {
      const type = toWidgetAlignSystemType(device);
      await updateWidget(id, update, sceneId, type);
    },
    [sceneId, updateWidget, device]
  );

  const handleWidgetAlignSystemUpdate = useCallback(
    async (location: Location, align: Alignment) => {
      const type = toWidgetAlignSystemType(device);
      await updateWidgetAlignSystem(
        {
          zone: location.zone,
          section: location.section,
          area: location.area,
          align
        },
        sceneId,
        type
      );
    },
    [sceneId, updateWidgetAlignSystem, device]
  );

  // Plugin
  const pluginProperty = useMemo(
    () =>
      scene?.plugins.reduce<Record<string, unknown>>((a, b) => {
        a[b.pluginId] = processProperty(b.property);
        return a;
      }, {}),
    [scene?.plugins]
  );

  const handleInfoboxBlockCreate = useCallback(
    async (pluginId: string, extensionId: string, index?: number) => {
      if (!selectedLayer?.layer?.id) return;
      await createInfoboxBlock({
        layerId: selectedLayer.layer.id,
        pluginId,
        extensionId,
        index
      });
    },
    [selectedLayer, createInfoboxBlock]
  );

  const handleInfoboxBlockMove = useCallback(
    async (id: string, targetIndex: number) => {
      if (!selectedLayer?.layer?.id) return;
      await moveInfoboxBlock({
        layerId: selectedLayer.layer.id,
        infoboxBlockId: id,
        index: targetIndex
      });
    },
    [selectedLayer, moveInfoboxBlock]
  );

  const handleInfoboxBlockRemove = useCallback(
    async (id?: string) => {
      if (!selectedLayer?.layer?.id || !id) return;
      await deleteInfoboxBlock({
        layerId: selectedLayer.layer.id,
        infoboxBlockId: id
      });
    },
    [selectedLayer, deleteInfoboxBlock]
  );

  // Story
  const story = useMemo(() => convertStory(scene, storyId), [storyId, scene]);

  const handleStoryPageChange = useCallback(
    (pageId?: string) => {
      if (isVisualizerResizing?.current) return;
      setSelectedStoryPageId(pageId);
    },
    [isVisualizerResizing, setSelectedStoryPageId]
  );

  const handleStoryBlockCreate = useCallback(
    async (
      pageId?: string,
      extensionId?: string,
      pluginId?: string,
      index?: number
    ) => {
      if (!extensionId || !pluginId || !storyId || !pageId) return;
      await createStoryBlock({
        pluginId,
        extensionId,
        storyId,
        pageId,
        index
      });
    },
    [storyId, createStoryBlock]
  );

  const handleStoryBlockDelete = useCallback(
    async (pageId?: string, blockId?: string) => {
      if (!blockId || !storyId || !pageId) return;
      await deleteStoryBlock({ blockId, pageId, storyId });
    },
    [storyId, deleteStoryBlock]
  );

  const handlePropertyValueUpdate = useCallback(
    async (
      propertyId?: string,
      schemaItemId?: string,
      fieldId?: string,
      itemId?: string,
      vt?: unknown,
      v?: unknown
    ) => {
      if (!propertyId || !schemaItemId || !fieldId || !vt) return;
      await updatePropertyValue(
        propertyId,
        schemaItemId,
        itemId,
        fieldId,
        "en",
        v as string | number | boolean | unknown[] | undefined,
        vt as keyof import("@reearth/core").ValueTypes
      );
    },
    [updatePropertyValue]
  );

  const handlePropertyItemAdd = useCallback(
    async (propertyId?: string, schemaGroupId?: string) => {
      if (!propertyId || !schemaGroupId) return;
      await addPropertyItem(propertyId, schemaGroupId);
    },
    [addPropertyItem]
  );

  const handlePropertyItemMove = useCallback(
    async (
      propertyId?: string,
      schemaGroupId?: string,
      itemId?: string,
      index?: number
    ) => {
      if (!propertyId || !schemaGroupId || !itemId || index === undefined)
        return;
      await movePropertyItem(propertyId, schemaGroupId, itemId, index);
    },
    [movePropertyItem]
  );

  const handlePropertyItemDelete = useCallback(
    async (propertyId?: string, schemaGroupId?: string, itemId?: string) => {
      if (!propertyId || !schemaGroupId || !itemId) return;
      await removePropertyItem(propertyId, schemaGroupId, itemId);
    },
    [removePropertyItem]
  );

  const engineMeta = useMemo(
    () => ({
      cesiumIonAccessToken:
        typeof cesiumIonAccessToken === "string" && cesiumIonAccessToken
          ? cesiumIonAccessToken
          : config()?.cesiumIonAccessToken
    }),
    [cesiumIonAccessToken]
  );

  // TODO: Use GQL value
  const title = "TITLE";
  useEffect(() => {
    if (!isBuilt || !title) return;
    document.title = title;
  }, [isBuilt, title]);

  const handleMount = useCallback(
    () => onVisualizerReady(true),
    [onVisualizerReady]
  );

  // photoOverlay
  const photoOverlayPreview = useAtomValue(PhotoOverlayPreviewAtom);

  // sketch
  const sketchFeatureTooltip = useAtomValue(SketchFeatureTooltipAtom);

  return {
    viewerProperty,
    pluginProperty,
    layers,
    nlsLayers,
    widgets,
    story,
    engineMeta,
    zoomedLayerId,
    installableInfoboxBlocks,
    currentCamera,
    initialCamera,
    photoOverlayPreview,
    sketchFeatureTooltip,
    handleCameraUpdate,
    handleCoreLayerSelect,
    handleLayerDrop,
    handleStoryPageChange,
    handleStoryBlockCreate,
    handleStoryBlockDelete,
    handleInfoboxBlockCreate,
    handleInfoboxBlockMove,
    handleInfoboxBlockRemove,
    handleWidgetUpdate,
    handleWidgetAlignSystemUpdate,
    handlePropertyValueUpdate,
    handlePropertyItemAdd,
    handlePropertyItemDelete,
    handlePropertyItemMove,
    handleMount,
    zoomToLayer,
    handleDeviceChange
  };
};
