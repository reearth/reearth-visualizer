import { useMemo, useCallback } from "react";
import { useIntl } from "react-intl";

import { Format, Layer, Widget } from "@reearth/components/molecules/EarthEditor/OutlinePane";
import {
  useGetLayersFromLayerIdQuery,
  useMoveLayerMutation,
  useUpdateLayerMutation,
  useRemoveLayerMutation,
  useImportLayerMutation,
  useAddLayerGroupMutation,
  LayerEncodingFormat,
  Maybe,
  useGetWidgetsQuery,
  PluginExtensionType,
} from "@reearth/gql";
import { useSceneId, useSelected, useSelectedBlock, useRootLayerId } from "@reearth/state";
import deepFind from "@reearth/util/deepFind";
import deepGet from "@reearth/util/deepGet";

const convertFormat = (format: Format) => {
  if (format === "kml") return LayerEncodingFormat.Kml;
  if (format === "czml") return LayerEncodingFormat.Czml;
  if (format === "geojson") return LayerEncodingFormat.Geojson;
  if (format === "shape") return LayerEncodingFormat.Shape;
  if (format === "reearth") return LayerEncodingFormat.Reearth;

  return undefined;
};

type GQLLayer = {
  __typename?: "LayerGroup" | "LayerItem";
  id: string;
  name: string;
  isVisible: boolean;
  pluginId?: string | null;
  extensionId?: string | null;
  linkedDatasetSchemaId?: string | null;
  linkedDatasetId?: string | null;
  layers?: Maybe<GQLLayer>[];
};

export default () => {
  const intl = useIntl();
  const [sceneId] = useSceneId();
  const [selected, select] = useSelected();
  const [, selectBlock] = useSelectedBlock();
  const [rootLayerId] = useRootLayerId();

  const { data, loading } = useGetLayersFromLayerIdQuery({
    variables: { layerId: rootLayerId ?? "" },
    skip: !rootLayerId,
  });

  const { loading: WidgetLoading, data: widgetData } = useGetWidgetsQuery({
    variables: { sceneId: sceneId ?? "" },
    skip: !sceneId,
  });

  const sceneDescription = useMemo(
    () =>
      widgetData?.node?.__typename === "Scene"
        ? widgetData.node.plugins
            .find(p => p.plugin?.id === "reearth")
            ?.plugin?.extensions.find(e => e.extensionId === "cesium")?.description
        : undefined,
    [widgetData?.node],
  );

  const widgets = useMemo(() => {
    const scene = widgetData?.node?.__typename === "Scene" ? widgetData.node : undefined;
    return scene?.plugins
      ?.map(p => {
        const plugin = p.plugin;

        return plugin?.extensions
          .filter(e => e.type === PluginExtensionType.Widget)
          .map((e): Widget => {
            const pluginId = plugin.id;
            const extensionId = e.extensionId;
            // note: multiple widget is not supported now
            const widget = scene?.widgets.find(
              w => w.pluginId === plugin.id && w.extensionId === e.extensionId,
            );
            return {
              id: widget?.id,
              pluginId,
              extensionId: e.extensionId,
              enabled: !!widget?.enabled,
              title: e.translatedName,
              description: e.translatedDescription,
              icon: e.icon || (pluginId === "reearth" ? extensionId : undefined),
            };
          })
          .filter((w): w is Widget => !!w);
      })
      .reduce<Widget[]>((a, b) => (b ? [...a, ...b] : a), []);
  }, [widgetData?.node]);

  const layers = useMemo(
    () =>
      (data?.layer?.__typename === "LayerGroup" ? data.layer.layers : undefined)
        ?.map(convertLayer)
        .filter((l): l is Layer => !!l)
        .reverse() ?? [],
    [data?.layer],
  );

  const [moveLayerMutation] = useMoveLayerMutation();
  const [updateLayerMutation] = useUpdateLayerMutation();
  const [removeLayerMutation] = useRemoveLayerMutation();
  const [importLayerMutation] = useImportLayerMutation();
  const [addLayerGroupMutation] = useAddLayerGroupMutation();

  const selectLayer = useCallback(
    (id: string) => {
      select({ type: "layer", layerId: id });
      selectBlock(undefined);
    },
    [select, selectBlock],
  );

  const selectScene = useCallback(() => {
    select({ type: "scene" });
    selectBlock(undefined);
  }, [select, selectBlock]);

  const selectWidget = useCallback(
    (widgetId: string | undefined, pluginId: string, extensionId: string) => {
      select({
        type: "widget",
        widgetId,
        pluginId,
        extensionId,
      });
      selectBlock(undefined);
    },
    [select, selectBlock],
  );

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

    const layers: Maybe<GQLLayer>[] =
      data?.layer?.__typename === "LayerGroup" ? data.layer.layers : [];
    const children = (l: Maybe<GQLLayer>) => (l?.__typename == "LayerGroup" ? l.layers : undefined);

    const layerIndex =
      selected?.type === "layer"
        ? deepFind(layers, l => l?.id === selected.layerId, children)[1]
        : undefined;
    const parentLayer = layerIndex?.length
      ? deepGet(layers, layerIndex.slice(0, -1), children)
      : undefined;
    if ((layerIndex && layerIndex.length > 5) || parentLayer?.linkedDatasetSchemaId) return;

    addLayerGroupMutation({
      variables: {
        parentLayerId: parentLayer?.id ?? rootLayerId,
        index: layerIndex?.[layerIndex.length - 1],
        name: intl.formatMessage({ defaultMessage: "Folder" }),
      },
    });
  }, [rootLayerId, data?.layer, selected, addLayerGroupMutation, intl]);

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
    widgets,
    sceneDescription,
    selectedType: selected?.type,
    selectedLayerId: selected?.type === "layer" ? selected.layerId : undefined,
    selectedWidgetId:
      selected?.type === "widget" ? `${selected.pluginId}/${selected.extensionId}` : undefined,
    loading: loading && WidgetLoading,
    selectLayer,
    selectScene,
    selectWidget,
    moveLayer,
    renameLayer,
    removeLayer,
    updateLayerVisibility,
    importLayer,
    addLayerGroup,
    handleDrop,
  };
};

const convertLayer = (layer: Maybe<GQLLayer>): Layer | undefined =>
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
