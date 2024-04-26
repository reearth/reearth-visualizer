import { Math as CesiumMath } from "cesium";
import { useEffect, useMemo, useCallback, useState, useRef } from "react";

import { Camera as CameraValue } from "@reearth/classic/util/value";
import type { Layer as LayerPlugin } from "../../Plugin";

import { useContext } from "../../Plugin";
import type { CommonReearth } from "../../Plugin/api";

import {
  Format,
  Layer,
} from "@reearth/classic/components/molecules/EarthEditor/OutlinePane";
import {
  useGetLayersFromLayerIdQuery,
  useMoveLayerMutation,
  useUpdateLayerMutation,
  useRemoveLayerMutation,
  useImportLayerMutation,
  useAddLayerGroupMutation,
  LayerEncodingFormat,
  Maybe,
  GetLayersFromLayerIdQuery,
} from "@reearth/classic/gql";
import deepFind from "@reearth/classic/util/deepFind";
import deepGet from "@reearth/classic/util/deepGet";
import { useLang, useT } from "@reearth/services/i18n";
import {
  useSelected,
  useSelectedBlock,
  useRootLayerId,
  useWidgetAlignEditorActivated,
  useZoomedLayerId,
  useSelectedWidgetArea,
} from "@reearth/services/state";

const convertFormat = (format: Format) => {
  if (format === "kml") return LayerEncodingFormat.Kml;
  if (format === "czml") return LayerEncodingFormat.Czml;
  if (format === "geojson") return LayerEncodingFormat.Geojson;
  if (format === "shape") return LayerEncodingFormat.Shape;
  if (format === "reearth") return LayerEncodingFormat.Reearth;

  return undefined;
};

const defaultRange = 50000;
const defaultDuration = 3;
const defaultCamera = {
  lat: 0,
  lng: 0,
  height: 0,
  heading: CesiumMath.toRadians(0),
  pitch: CesiumMath.toRadians(-30),
  roll: 0,
  fov: CesiumMath.toRadians(60),
};

let stopOrbiting:
  | void
  | {
      stopOrbit: () => void;
      handleToggleOrbit: () => void;
    }
  | undefined = undefined;

export default ({
  duration = defaultDuration,
  range = defaultRange,
  camera = defaultCamera,
  autoOrbit,
}: {
  duration?: number;
  camera?: CameraValue;
  range?: number;
  autoOrbit?: boolean;
}) => {
  const t = useT();
  const [selected, select] = useSelected();
  const [, zoomToLayer] = useZoomedLayerId();
  const [, selectBlock] = useSelectedBlock();
  const [rootLayerId] = useRootLayerId();
  const [, toggleWidgetAlignEditor] = useWidgetAlignEditorActivated();
  const [, selectWidgetArea] = useSelectedWidgetArea();

  const [selectedLayerToMoveCamera, selectLayerToMoveCamera] = useState<{
    layer?:LayerPlugin;
    duration: number;
    camera: CameraValue;
    range: number;
    noCameraFlight?: boolean;
    autoOrbit?: boolean;
  }>();

  const { reearth } = useContext() ?? {};
  const {
    findById: findLayerById,
    selected: selectedLayerFromContext,
    select: selectLayerFromContext,
  } = reearth?.layers ?? {};

  const timeout = useRef<number>();

  const { data, loading } = useGetLayersFromLayerIdQuery({
    variables: { layerId: rootLayerId ?? "" },
    skip: !rootLayerId,
  });

  const handleAutoOrbit = useCallback(
    (...args: Parameters<CommonReearth["visualizer"]["camera"]["autoOrbit"]>) => {
      // Prioritize camera flight by the photo overlay
      timeout.current = window.setTimeout(() => {
        stopOrbiting = reearth?.visualizer.camera.autoOrbit(...args);
      }, 100);
    },
    [reearth?.visualizer.camera],
  );

  const handleCancelOrbit = useCallback(() => {
    if(stopOrbiting?.stopOrbit) {
      stopOrbiting?.stopOrbit();
    }
  },[stopOrbiting]);

  useEffect(
    () => () => {
      window.clearTimeout(timeout.current);
      handleCancelOrbit();
    },
    [],
  );

  const layers = useMemo(
    () =>
      (data?.layer?.__typename === "LayerGroup" ? data.layer.layers : undefined)
        ?.map(l => convertLayer(l as GQLLayer))
        .filter((l): l is Layer => !!l)
        .reverse() ?? [],
    [data?.layer],
  );

  const [moveLayerMutation] = useMoveLayerMutation();
  const [updateLayerMutation] = useUpdateLayerMutation();
  const [removeLayerMutation] = useRemoveLayerMutation();
  const [importLayerMutation] = useImportLayerMutation();
  const [addLayerGroupMutation] = useAddLayerGroupMutation();

  const selectAt = useCallback(
    (id: string) => {
      const layer = id ? findLayerById?.(id) : undefined;
      selectLayerToMoveCamera({
        layer,
        duration,
        camera,
        range,
        autoOrbit,
      });
      selectLayerFromContext?.(id, { reason: "storytelling" });
    },
    [autoOrbit, camera, duration, findLayerById, range, selectLayerFromContext],
  );

  const selectLayer = useCallback(
    (id: string) => {
      select({ type: "layer", layerId: id });
      selectBlock(undefined);
      selectAt(id);
    },
    [select, selectBlock, selectAt, stopOrbiting],
  );

  useEffect(() => {
    const id = selectedLayerFromContext?.id;
    const layer = id ? findLayerById?.(id) : undefined;
    handleCancelOrbit();
    selectLayerToMoveCamera(
      layer
        ? {
            layer: selectedLayerFromContext,
            duration,
            camera,
            range,
            noCameraFlight: true,
            autoOrbit,
          }
        : undefined,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLayerFromContext, selected, stopOrbiting]); // ignore camera, duration, range, stories

  useEffect(() => {
    if (
      !selectedLayerToMoveCamera?.layer ||
      selectedLayerToMoveCamera.noCameraFlight ||
      // Photooverlays have own camera flight and that is the priority here.
      isPhotoOverlay(selectedLayerToMoveCamera.layer)
    ) {
      return;
    }

    const p = selectedLayerToMoveCamera.layer?.property?.default;

    const position = {
      lat: (p?.location?.lat ?? p?.position?.lat) as number | undefined,
      lng: (p?.location?.lng ?? p?.position?.lng) as number | undefined,
      height: (p?.height as number | undefined) ?? 0,
    };

    if (typeof position.lat !== "number" && typeof position.lng !== "number") return;

    handleAutoOrbit({
      ...position,
      heading: selectedLayerToMoveCamera.camera.heading,
      pitch: selectedLayerToMoveCamera.camera.pitch,
      range: selectedLayerToMoveCamera.range,
    },
    {
      duration: selectedLayerToMoveCamera.duration,
      autoOrbit: selectedLayerToMoveCamera.autoOrbit,
    });

  }, [selectedLayerToMoveCamera, handleAutoOrbit]);

  useEffect(() => {
    if (selected?.type !== "widgets") {
      toggleWidgetAlignEditor(false);
      selectWidgetArea();
    }
  }, [selected?.type, toggleWidgetAlignEditor, selectWidgetArea]);

  const moveLayer = useCallback(
    async (
      layerId: string,
      destLayerId: string,
      destIndex: number,
      destChildrenCount: number,
      parentId: string,
    ) => {
      const i = Math.max(0, destChildrenCount - destIndex - (parentId === destLayerId ? 1 : 0));
      await moveLayerMutation({
        variables: {
          layerId,
          destLayerId,
          index: i,
        },
        refetchQueries: ["GetLayers"],
      });
    },
    [moveLayerMutation],
  );

  const renameLayer = useCallback(
    (layerId: string, name: string) => {
      updateLayerMutation({
        variables: {
          layerId,
          name,
        },
      });
    },
    [updateLayerMutation],
  );

  const updateLayerVisibility = useCallback(
    (layerId: string, visible: boolean) => {
      updateLayerMutation({
        variables: {
          layerId,
          visible,
        },
      });
    },
    [updateLayerMutation],
  );

  const removeLayer = useCallback(
    async (layerId: string) => {
      await removeLayerMutation({
        variables: {
          layerId,
        },
        refetchQueries: ["GetLayers"],
      });
      select(undefined);
    },
    [removeLayerMutation, select],
  );

  const importLayer = useCallback(
    (file: File, format: Format) => {
      const f = convertFormat(format);
      if (rootLayerId && f) {
        importLayerMutation({
          variables: {
            layerId: rootLayerId,
            file,
            format: f,
          },
          refetchQueries: ["GetLayers"],
        });
      }
    },
    [rootLayerId, importLayerMutation],
  );

  const addLayerGroup = useCallback(() => {
    if (!rootLayerId) return;

    const layers: (Maybe<GQLLayer> | undefined)[] =
      data?.layer?.__typename === "LayerGroup" ? (data.layer.layers as GQLLayer[]) : [];
    const children = (l: Maybe<GQLLayer> | undefined) =>
      l?.__typename == "LayerGroup" ? l.layers : undefined;

    const layerIndex =
      selected?.type === "layer"
        ? deepFind<Maybe<GQLLayer> | undefined>(
            layers,
            l => l?.id === selected.layerId,
            children,
          )[1]
        : undefined;
    const parentLayer = layerIndex?.length
      ? deepGet<Maybe<GQLLayer> | undefined>(layers, layerIndex.slice(0, -1), children)
      : undefined;
    if ((layerIndex && layerIndex.length > 5) || parentLayer?.linkedDatasetSchemaId) return;

    addLayerGroupMutation({
      variables: {
        parentLayerId: parentLayer?.id ?? rootLayerId,
        index: layerIndex?.[layerIndex.length - 1],
        name: t("Folder"),
      },
      refetchQueries: ["GetLayers"],
    });
  }, [rootLayerId, data?.layer, selected, addLayerGroupMutation, t]);

  const handleDrop = useCallback(
    (layerId: string, index: number, childrenCount: number) => ({
      type: "layer",
      layerId,
      index: Math.max(0, childrenCount - index),
    }),
    [],
  );

  return {
    rootLayerId,
    layers,
    selectedType: selected?.type,
    selectedLayerId: selected?.type === "layer" ? selected.layerId : undefined,
    loading: loading,
    selectLayer,
    moveLayer,
    renameLayer,
    removeLayer,
    updateLayerVisibility,
    importLayer,
    addLayerGroup,
    handleDrop,
    zoomToLayer,
    handleCancelOrbit,
  };
};

type GQLLayer = Omit<NonNullable<GetLayersFromLayerIdQuery["layer"]>, "layers"> & {
  linkedDatasetSchemaId?: string | null;
  linkedDatasetId?: string | null;
  layers?: (GQLLayer | null | undefined)[];
};

const convertLayer = (layer: Maybe<GQLLayer> | undefined): Layer | undefined =>
  !layer
    ? undefined
    : layer.__typename === "LayerGroup"
    ? {
        id: layer.id,
        title: layer.name,
        type: "group",
        visible: layer.isVisible,
        linked: !!layer.linkedDatasetSchemaId,
        children: layer.layers
          ?.map(convertLayer)
          .filter((l): l is Layer => !!l)
          .reverse(),
      }
    : layer.__typename === "LayerItem"
    ? {
        id: layer.id,
        title: layer.name,
        visible: layer.isVisible,
        linked: !!layer.linkedDatasetId,
        icon: layer.pluginId === "reearth" ? layer.extensionId ?? undefined : undefined,
        type: "item",
      }
    : undefined;

function isPhotoOverlay(layer: LayerPlugin): boolean {
  return (
    layer.pluginId === "reearth" &&
    layer.extensionId === "photooverlay" &&
    !!layer.property?.default?.camera
  );
}
