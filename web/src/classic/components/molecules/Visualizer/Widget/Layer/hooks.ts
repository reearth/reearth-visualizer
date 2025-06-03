import { Math as CesiumMath } from "cesium";
import { useEffect, useMemo, useCallback, useState, useRef } from "react";

import { Camera as CameraValue } from "@reearth/classic/util/value";
import type { Layer as LayerPlugin } from "../../Plugin";

import { useContext } from "../../Plugin";
import type { CommonReearth } from "../../Plugin/api";

import { Layer } from "@reearth/classic/components/molecules/EarthEditor/OutlinePane";
import {
  useGetLayersFromLayerIdQuery,
  useUpdateLayerMutation,
  Maybe,
  GetLayersFromLayerIdQuery,
  useGetLayersQuery,
} from "@reearth/classic/gql";
import { useLang, useT } from "@reearth/services/i18n";
import {
  useSelected,
  useSelectedBlock,
  useRootLayerId,
  useWidgetAlignEditorActivated,
  useZoomedLayerId,
  useSelectedWidgetArea,
  useRootLayer,
  usePublishedPage,
  useSceneId,
} from "@reearth/services/state";

type __typename = { __typename?: "LayerGroup" | "LayerItem" | undefined };

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
  const lang = useLang();
  const [sceneId] = useSceneId();
  const [publishedPage] = usePublishedPage();
  const [rootLayer, setRootLayer] = useRootLayer();
  const [selected, select] = useSelected();
  const [, zoomToLayer] = useZoomedLayerId();
  const [, selectBlock] = useSelectedBlock();
  const [rootLayerId] = useRootLayerId();
  const [, toggleWidgetAlignEditor] = useWidgetAlignEditorActivated();
  const [, selectWidgetArea] = useSelectedWidgetArea();

  const [selectedLayerToMoveCamera, selectLayerToMoveCamera] = useState<{
    layer?: LayerPlugin;
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

  const { data: layerData, loading } = !publishedPage
    ? useGetLayersQuery({
        variables: { sceneId: sceneId ?? "", lang: lang },
        skip: !sceneId,
      })
    : { data: undefined, loading: false };

  const timeout = useRef<number>();

  const handleAutoOrbit = useCallback(
    (
      ...args: Parameters<CommonReearth["visualizer"]["camera"]["autoOrbit"]>
    ) => {
      // Prioritize camera flight by the photo overlay
      timeout.current = window.setTimeout(() => {
        stopOrbiting = reearth?.visualizer.camera.autoOrbit(...args);
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
  const { data } = !publishedPage
    ? {
        data: {
          layer:
            layerData?.node && "rootLayer" in layerData.node
              ? (layerData.node as { rootLayer?: { layers?: any[] } }).rootLayer
              : undefined,
        },
      }
    : useMemo(
        () => ({
          data: { layer: rootLayer?.children },
          loading: false,
        }),
        [rootLayer?.children]
      );
  const layers = useMemo(() => {
    const normLayer = publishedPage
      ? normalisedLayer((data?.layer as LayerPlugin[]) || [])
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
    rootLayer?.children,
    JSON.stringify(rootLayer?.children),
    data?.layer,
    publishedPage,
  ]);

  let updateLayerVisibility = useCallback(
    (layerId: string, visible: boolean) => {
      if (visible) {
        reearth?.layers.show(layerId);
      } else {
        reearth?.layers.hide(layerId);
      }
      changeVisibility(
        rootLayer?.children,
        "id",
        layerId,
        "isVisible",
        visible
      );
      setRootLayer(rootLayer);
    },
    [reearth?.layers, data?.layer, publishedPage]
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
      selectLayerFromContext?.(id, { reason: "storytelling" });
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
  }, [selectedLayerToMoveCamera, handleAutoOrbit]);

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
  property?: {
    items?: {
      schemaGroupId: string;
      fields?: {
        fieldId: string;
        value: any;
      }[];
    }[];
  } | null;
  merged?: {
    property?: {
      groups?: {
        schemaGroupId: string;
        fields?: {
          fieldId: string;
          actualValue: any;
        }[];
      }[];
    } | null;
  } | null;
};

const hideLayerItems = [
  "resource",
  "model",
  "ellipsoid",
  "photooverlay",
  "tileset",
];

const isHideLayerItem = (pluginId: string = ""): boolean => {
  return hideLayerItems.includes(pluginId);
};

const convertProperty = (
  layer: Maybe<GQLLayer> | undefined
): any | undefined => {
  const proterty: any = {};
  const { linkedDatasetSchemaId, linkedDatasetId, merged, property } =
    layer ?? {};

  if ((linkedDatasetSchemaId || linkedDatasetId) && merged?.property?.groups) {
    const groups = merged?.property?.groups ?? [];
    groups.forEach(({ schemaGroupId, fields }) => {
      if (!proterty[schemaGroupId]) {
        proterty[schemaGroupId] = {};
      }
      fields?.forEach((f) => {
        proterty[schemaGroupId][f?.fieldId] = f?.actualValue;
      });
    });
    return proterty;
  }

  if (!property) return undefined;
  if (!property?.items) return property;
  if (!property?.items?.length) return proterty;
  property.items.forEach(({ schemaGroupId, fields }) => {
    if (!proterty[schemaGroupId]) {
      proterty[schemaGroupId] = {};
    }
    fields?.forEach((f) => {
      proterty[schemaGroupId][f?.fieldId] = f?.value;
    });
  });
  return proterty;
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
    ? isHideLayerItem(
        layer.pluginId === "reearth"
          ? layer.extensionId ?? undefined
          : undefined
      )
      ? undefined
      : {
          id: layer.id,
          title: layer.name,
          visible: layer.isVisible,
          linked: !!layer.linkedDatasetId,
          icon:
            layer.pluginId === "reearth"
              ? layer.extensionId ?? undefined
              : undefined,
          type: "item",
          property: convertProperty(layer) ?? undefined,
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
  layerRaw: LayerPlugin[]
): (LayerPlugin & __typename)[] | undefined => {
  if (!layerRaw || !layerRaw?.length) return;
  return layerRaw.map((l) => {
    return {
      ...l,
      name: l?.title,
      __typename: !l?.extensionId
        ? "LayerGroup"
        : l?.children && l?.children.length > 0
        ? "LayerGroup"
        : "LayerItem",
      linkedDatasetSchemaId:
        l?.extensionId && l?.children && l?.children.length > 0,
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
