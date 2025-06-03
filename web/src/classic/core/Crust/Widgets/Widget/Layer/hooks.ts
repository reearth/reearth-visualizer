import { Math as CesiumMath } from "cesium";
import { useEffect, useMemo, useCallback, useState, useRef } from "react";

import { Camera as CameraValue } from "@reearth/classic/util/value";
import type { Layer as LayerPlugin } from "@reearth/classic/components/molecules/Visualizer";

import type { CommonReearth } from "../../../Plugins/api";
import { type Layer as CoreLayer } from "@reearth/classic/core/mantle";

import { Layer } from "@reearth/classic/components/molecules/EarthEditor/OutlinePane";
import {
  useGetLayersFromLayerIdQuery,
  useUpdateLayerMutation,
  Maybe,
  GetLayersFromLayerIdQuery,
} from "@reearth/classic/gql";
import { useLang, useT } from "@reearth/services/i18n";
import {
  useSelected,
  useSelectedBlock,
  useRootLayerId,
  useWidgetAlignEditorActivated,
  useZoomedLayerId,
  useSelectedWidgetArea,
  useRootCoreLayer,
  usePublishedPage,
} from "@reearth/services/state";
import { usePluginContext } from "../../../Plugins/context";
import { LookAtDestination } from "../types";
import { CameraOptions } from "@reearth/classic/core/Map";

type __typename = { __typename?: "LayerGroup" | "LayerItem" | undefined };
type autoOrbitType = (
  destination: LookAtDestination,
  options?: CameraOptions & { autoOrbit?: boolean }
) =>
  | { stopOrbit: () => void; handleToggleOrbit: () => void }
  | undefined
  | void;

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
  onAutoOrbit,
}: {
  duration?: number;
  camera?: CameraValue;
  range?: number;
  autoOrbit?: boolean;
  onAutoOrbit?: autoOrbitType;
}) => {
  const t = useT();
  const [publishedPage] = usePublishedPage();
  const [rootLayer, setRootCoreLayer] = useRootCoreLayer();
  const [selected, select] = useSelected();
  const [, zoomToLayer] = useZoomedLayerId();
  const [, selectBlock] = useSelectedBlock();
  const [rootLayerId] = useRootLayerId();
  const [, toggleWidgetAlignEditor] = useWidgetAlignEditorActivated();
  const [, selectWidgetArea] = useSelectedWidgetArea();
  const [rerender, setRerender] = useState(0);

  const [selectedLayerToMoveCamera, selectLayerToMoveCamera] = useState<{
    layer?: LayerPlugin;
    duration: number;
    camera: CameraValue;
    range: number;
    noCameraFlight?: boolean;
    autoOrbit?: boolean;
  }>();

  const { reearth } = usePluginContext() ?? {};
  const {
    findById: findLayerById,
    selected: selectedLayerFromContext,
    select: selectLayerFromContext,
  } = reearth?.layers ?? {};

  const timeout = useRef<number>();

  const handleAutoOrbit = useCallback<autoOrbitType>(
    (...args: Parameters<autoOrbitType>) => {
      // Prioritize camera flight by the photo overlay
      timeout.current = window.setTimeout(() => {
        stopOrbiting = reearth?.visualizer.camera?.autoOrbit?.(...args);
      }, 100);
    },
    [reearth?.visualizer.camera]
  );

  const handleCancelOrbit = useCallback(() => {
    if (stopOrbiting?.stopOrbit) {
      stopOrbiting?.stopOrbit();
    }
  }, [stopOrbiting]);

  useEffect(
    () => () => {
      window.clearTimeout(timeout.current);
      handleCancelOrbit();
    },
    []
  );
  const { data, loading } = !publishedPage
    ? useGetLayersFromLayerIdQuery({
        variables: { layerId: rootLayerId ?? "" },
        skip: !rootLayerId,
      })
    : useMemo(
        () => ({
          data: { layer: rootLayer },
          loading: false,
        }),
        [JSON.stringify(rootLayer), rerender]
      );

  const layers = useMemo(() => {
    const trueLayer =
      data?.layer instanceof Array ? (data?.layer[0] as any) : [];
    const normLayer = publishedPage
      ? normalisedLayer((trueLayer?.children as CoreLayer[]) || [])
      : (
          data?.layer as {
            __typename?: "LayerGroup" | undefined;
            layers?: LayerPlugin[];
          }
        )?.layers;
    return (
      normLayer
        ?.map((l: LayerPlugin) => convertLayer(l as GQLLayer))
        .filter((l: Layer | undefined): l is Layer => !!l)
        .reverse() ?? []
    );
  }, [
    JSON.stringify(rootLayer),
    JSON.stringify(data?.layer),
    publishedPage,
    rerender,
  ]);

  let updateLayerVisibility = useCallback(
    (layerId: string, visible: boolean) => {
      if (visible) {
        reearth?.layers.show && reearth?.layers?.show(layerId);
      } else {
        reearth?.layers.hide && reearth?.layers.hide(layerId);
      }
      changeVisibility(rootLayer, "id", layerId, "visible", visible);
      setRootCoreLayer(rootLayer);
      setRerender((prev) => prev + 1);
    },
    [
      JSON.stringify(rootLayer),
      reearth?.layers,
      JSON.stringify(data?.layer),
      publishedPage,
    ]
  );

  if (!publishedPage) {
    const [updateLayerMutation] = useUpdateLayerMutation();
    updateLayerVisibility = useCallback(
      (layerId: string, visible: boolean) => {
        updateLayerMutation({
          variables: {
            layerId,
            visible,
          },
        });
      },
      [updateLayerMutation]
    );
  }

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
      selectLayerFromContext?.(id);
    },
    [autoOrbit, camera, duration, findLayerById, range, selectLayerFromContext]
  );

  const selectLayer = useCallback(
    (id: string) => {
      select({ type: "layer", layerId: id });
      selectBlock(undefined);
      selectAt(id);
    },
    [select, selectBlock, selectAt, stopOrbiting]
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
        : undefined
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

    if (typeof position.lat !== "number" && typeof position.lng !== "number")
      return;

    handleAutoOrbit(
      {
        ...position,
        heading: selectedLayerToMoveCamera.camera.heading,
        pitch: selectedLayerToMoveCamera.camera.pitch,
        range: selectedLayerToMoveCamera.range,
      },
      {
        duration: selectedLayerToMoveCamera.duration,
        autoOrbit: selectedLayerToMoveCamera.autoOrbit,
      }
    );

    // stopOrbiting = onAutoOrbit?.({
    //   ...position,
    //   heading: selectedLayerToMoveCamera.camera.heading,
    //   pitch: selectedLayerToMoveCamera.camera.pitch,
    //   range: selectedLayerToMoveCamera.range,
    // },
    // {
    //   duration: selectedLayerToMoveCamera.duration,
    //   autoOrbit: selectedLayerToMoveCamera.autoOrbit,
    // })
  }, [selectedLayerToMoveCamera]);

  useEffect(() => {
    if (selected?.type !== "widgets") {
      toggleWidgetAlignEditor(false);
      selectWidgetArea();
    }
  }, [selected?.type, toggleWidgetAlignEditor, selectWidgetArea]);

  return {
    rootLayerId: rootLayerId || "rootlayerId",
    layers,
    selectedType: selected?.type,
    selectedLayerId: selected?.type === "layer" ? selected.layerId : undefined,
    loading: loading,
    selectLayer,
    updateLayerVisibility,
    zoomToLayer,
    handleCancelOrbit,
  };
};

type GQLLayer = Omit<
  NonNullable<GetLayersFromLayerIdQuery["layer"]>,
  "layers"
> & {
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
        icon:
          layer.pluginId === "reearth"
            ? layer.extensionId ?? undefined
            : undefined,
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

const normalisedLayer = (
  layerRaw: any[]
): (LayerPlugin & __typename)[] | undefined => {
  if (!layerRaw || !layerRaw?.length) return;
  return layerRaw.map((l) => {
    return {
      ...l,
      pluginId: "reearth",
      extensionId: l?.compat?.extensionId,
      isVisible: l?.visible,
      name: l?.title,
      __typename: !l?.compat
        ? "LayerGroup"
        : l?.children && l?.children.length > 0
        ? "LayerGroup"
        : "LayerItem",
      linkedDatasetSchemaId: l?.compat && l?.children && l?.children.length > 0,
      layers:
        l?.children && l?.children.length > 0
          ? normalisedLayer(l.children)
          : l?.children,
    };
  });
};

function searchTreeNode(
  data: any,
  key: string,
  match: string | number,
  modifyField: any,
  modifyValue: any
) {
  const stack: any[] = [];
  data.map((item: any) => stack.push(item));
  while (stack.length > 0) {
    const node = stack.pop();
    if (node[key] === match) {
      if (!modifyField) return;
      node[modifyField] = modifyValue;
      return node;
    } else if (node.children) {
      node.children.map((child: any) => stack.push(child));
    }
  }
  return null;
}

function changeVisibility(
  data: any,
  key: string,
  match: string | number,
  modifyField: any,
  modifyValue: any
) {
  const stack: any[] = [];
  data.map((item: any) => stack.push(item));
  while (stack.length > 0) {
    const node = stack.pop();
    if (node[key] === match) {
      node[modifyField] = modifyValue;
      if (node.children) {
        node.children.forEach((child: any) => stack.push(child));
        modifyTreeNode(node.children, modifyField, modifyValue);
      }
    } else if (node.children) {
      node.children.forEach((child: any) => stack.push(child));
    }
  }
}

function modifyTreeNode(data: any, modifyField: any, modifyValue: any) {
  const stack: any[] = [];
  data.map((item: any) => stack.push(item));
  while (stack.length > 0) {
    const node = stack.pop();
    if (node) {
      node[modifyField] = modifyValue;
    }
    if (node.children) {
      node.children.map((child: any) => stack.push(child));
    }
  }
  return null;
}
