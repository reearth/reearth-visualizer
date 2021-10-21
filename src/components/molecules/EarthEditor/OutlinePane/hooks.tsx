import { useEffect, useState, useCallback, useMemo } from "react";
import { useIntl } from "react-intl";

import { Item as TreeViewItemType } from "@reearth/components/atoms/TreeView";
import { arrayEquals } from "@reearth/components/atoms/TreeView/util";

import { Layer as LayerTreeViewItemItem, useLayerTreeViewItem } from "../LayerTreeViewItem";

export type Format = "kml" | "czml" | "geojson" | "shape" | "reearth";

export type Layer = {
  id: string;
  title: string;
  icon?: string;
  linked?: boolean;
  visible?: boolean;
} & (LayerGroup | LayerItem);

export type LayerGroup = {
  type: "group";
  children?: Layer[];
};

export type LayerItem = {
  type: "item";
};

export type Widget = {
  id: string;
  pluginId: string;
  extensionId: string;
  title: string;
  description?: string;
  icon?: string;
  enabled?: boolean;
};

export type WidgetType = {
  pluginId: string;
  extensionId: string;
  title: string;
  icon?: string;
  disabled?: boolean;
};

export type ItemType = ItemEx["type"];
export type ItemEx =
  | { type: "root" | "scene" | "layer" | "scenes" | "widgets" }
  | {
      type: "widget";
      id?: string;
    };
export type TreeViewItem = LayerTreeViewItemItem<ItemEx>;

export default ({
  rootLayerId,
  layers,
  widgets,
  widgetTypes,
  sceneDescription,
  selectedLayerId,
  selectedWidgetId,
  selectedType,
  onLayerSelect,
  onSceneSelect,
  onWidgetsSelect,
  onWidgetSelect,
  onWidgetAdd,
  onWidgetActivation,
  onLayerMove,
  onLayerRemove,
  onLayerRename,
  onLayerVisibilityChange,
  onDrop,
  onLayerGroupCreate,
  onLayerImport,
  handleShowWarning,
}: {
  rootLayerId?: string;
  layers?: Layer[];
  widgets?: Widget[];
  widgetTypes?: WidgetType[];
  sceneDescription?: string;
  selectedLayerId?: string;
  selectedIndex?: number[];
  selectedWidgetId?: string;
  selectedType?: ItemType;
  onLayerSelect?: (id: string, ...i: number[]) => void;
  onLayerImport?: (file: File, format: Format) => void;
  onLayerRemove?: (id: string) => void;
  onSceneSelect?: () => void;
  onWidgetsSelect?: () => void;
  onWidgetSelect?: (widgetId: string | undefined, pluginId: string, extensionId: string) => void;
  onWidgetAdd?: (id?: string) => Promise<void>;
  onWidgetActivation?: (widgetId: string, enabled: boolean) => Promise<void>;
  onLayerMove?: (
    src: string,
    dest: string,
    destIndex: number,
    destChildrenCount: number,
    parent: string,
  ) => void;
  onLayerRename?: (id: string, name: string) => void;
  onLayerVisibilityChange?: (id: string, visibility: boolean) => void;
  onDrop?: (layer: string, index: number, childrenCount: number) => any;
  onLayerGroupCreate?: () => void;
  handleShowWarning?: (show: boolean) => void;
}) => {
  const intl = useIntl();
  const [selected, setSelected] = useState<string[]>([]);

  const select = useCallback(
    (items: TreeViewItemType<TreeViewItem>[], i: number[][]) => {
      const ids = items.map(i => i.id);
      setSelected(selected => (!arrayEquals(selected, ids) ? ids : selected));

      const item = items[0];
      if (!item) return;

      if (item.content.type === "scene") {
        onSceneSelect?.();
      } else if (item.id === "widgets") {
        onWidgetsSelect?.();
      } else if (item.content.type === "widget") {
        const [pluginId, extensionId, widgetId] = item.content.id?.split("/") ?? [];
        onWidgetSelect?.(widgetId, pluginId, extensionId);
      } else if (item.content.type === "layer") {
        onLayerSelect?.(
          item.id,
          // because other items can be exist like Scene, Widget
          ...(typeof i[0][0] === "number" ? [i[0][0] - 2, ...i[0].slice(1)] : []),
        );
      }
    },
    [onLayerSelect, onSceneSelect, onWidgetsSelect, onWidgetSelect],
  );

  const drop = useCallback(
    (
      item: TreeViewItemType<TreeViewItem>,
      destItem: TreeViewItemType<TreeViewItem>,
      _index: number[],
      destIndex: number[],
      parent: TreeViewItemType<TreeViewItem>,
    ) => {
      if (destItem.content.type !== "layer") return;
      onLayerMove?.(
        item.id,
        destItem.id,
        Math.max(0, destIndex[destIndex.length - 1]),
        destItem.content.childrenCount ?? 0,
        parent.id,
      );
    },
    [onLayerMove],
  );

  const dropExternals = useCallback(
    (_: any, item: TreeViewItemType<LayerTreeViewItemItem>, index: number[]) =>
      onDrop?.(item.id, index[index.length - 1], item.content.childrenCount ?? 0),
    [onDrop],
  );

  const removeLayer = useCallback(() => {
    if (selectedLayerId) {
      onLayerRemove?.(selectedLayerId);
    }
  }, [selectedLayerId, onLayerRemove]);

  const sceneTitle = intl.formatMessage({ defaultMessage: "Scene" });
  const widgetTitle = intl.formatMessage({ defaultMessage: "Widgets" });
  const layerTitle = intl.formatMessage({ defaultMessage: "Layers" });

  const sceneWidgetsItem = useMemo<TreeViewItemType<TreeViewItem> | undefined>(
    () => ({
      id: "root",
      content: {
        id: "root",
        type: "root",
      },
      children: [
        {
          id: "scene",
          content: {
            type: "scene",
            icon: "scene",
            title: sceneTitle,
            description: sceneDescription,
          },
          draggable: false,
          droppable: false,
          droppableIntoChildren: false,
          expandable: false,
          selectable: true,
        },
        {
          id: "widgets",
          content: {
            type: "widgets",
            icon: "widget",
            title: widgetTitle,
            group: true,
            showLayerActions: true,
            actionItems: widgetTypes?.map(w => ({
              type: "widget",
              id: `${w.pluginId}/${w.extensionId}`,
              title: w.title,
              icon: w.icon,
              disabled: w.disabled,
            })),
          },
          draggable: false,
          droppable: false,
          droppableIntoChildren: false,
          expandable: true,
          selectable: true,
          children: widgets?.map(w => ({
            id: `${w.pluginId}/${w.extensionId}/${w.id}`,
            content: {
              id: `${w.pluginId}/${w.extensionId}/${w.id}`,
              widgetId: w.id,
              pluginId: w.pluginId,
              extensionId: w.extensionId,
              type: "widget",
              title: w.title,
              description: w.description,
              icon: w.icon,
              deactivated: !w.enabled,
            },
            draggable: false,
            droppable: false,
            droppableIntoChildren: false,
            expandable: false,
            selectable: true,
          })),
        },
      ],
    }),
    [sceneTitle, sceneDescription, widgetTitle, widgets, widgetTypes],
  );

  const layersItem = useMemo<TreeViewItemType<TreeViewItem> | undefined>(
    () =>
      rootLayerId
        ? {
            id: "root",
            content: {
              id: "root",
              type: "root",
            },
            children: [
              {
                id: rootLayerId,
                content: {
                  id: rootLayerId,
                  type: "layer",
                  icon: "layer",
                  title: layerTitle,
                  childrenCount: layers?.length,
                  showLayerActions: true,
                  underlined: true,
                  showChildrenCount: false,
                  group: true,
                },
                expandable: true,
                children: [...(convertLayers(layers) ?? [])],
              },
            ],
          }
        : undefined,
    [layerTitle, rootLayerId, layers],
  );

  const layerTreeViewItemOnRename = useCallback(
    (item: TreeViewItemType<LayerTreeViewItemItem<ItemEx>>, name: string) =>
      onLayerRename?.(item.id, name),
    [onLayerRename],
  );
  const layerTreeViewItemOnLayerVisibilityChange = useCallback(
    (item: TreeViewItemType<LayerTreeViewItemItem<ItemEx>>, visibility: boolean) =>
      onLayerVisibilityChange?.(item.id, visibility),
    [onLayerVisibilityChange],
  );

  const layerTreeViewItemOnWidgetActivation = useCallback(
    (item: TreeViewItemType<LayerTreeViewItemItem<ItemEx>>, activate: boolean) => {
      const widgetId = item.id.split("/")[2];
      onWidgetActivation?.(widgetId, activate);
    },
    [onWidgetActivation],
  );

  const SceneTreeViewItem = useLayerTreeViewItem<ItemEx>({
    onAdd: onWidgetAdd,
    onActivationChange: layerTreeViewItemOnWidgetActivation,
    onWarning: handleShowWarning,
    selectedLayerId: selectedWidgetId,
  });

  const LayerTreeViewItem = useLayerTreeViewItem<ItemEx>({
    onRename: layerTreeViewItemOnRename,
    onVisibilityChange: layerTreeViewItemOnLayerVisibilityChange,
    onRemove: onLayerRemove,
    onImport: onLayerImport,
    onGroupCreate: onLayerGroupCreate,
    visibilityShown: true,
    selectedLayerId,
    rootLayerId,
  });

  useEffect(() => {
    const newState =
      selectedType === "scene"
        ? ["scene"]
        : selectedType === "widgets"
        ? ["widgets"]
        : selectedType === "layer" && selectedLayerId
        ? [selectedLayerId]
        : selectedType === "widget" && selectedWidgetId
        ? [selectedWidgetId]
        : [];
    setSelected(ids => (arrayEquals(ids, newState) ? ids : newState));
  }, [selectedLayerId, selectedType, selectedWidgetId]);

  return {
    sceneWidgetsItem,
    layersItem,
    select,
    drop,
    dropExternals,
    removeLayer,
    SceneTreeViewItem,
    LayerTreeViewItem,
    selected,
  };
};

const convertLayers = (
  layers: Layer[] | undefined,
  parent?: Layer,
): TreeViewItemType<LayerTreeViewItemItem<{ type: "layer" }>>[] | undefined =>
  layers?.map(layer => ({
    id: layer.id,
    content: {
      id: layer.id,
      type: "layer",
      group: layer.type === "group",
      childrenCount: layer.type === "group" ? layer.children?.length : undefined,
      showChildrenCount: true,
      icon: layer.icon,
      title: layer.title,
      linked: layer.linked,
      visible: layer.visible,
      visibilityChangeable: true,
      renamable: true,
    },
    children: layer.type === "group" ? convertLayers(layer.children, layer) : undefined,
    draggable: parent?.type !== "group" || !parent.linked,
    droppable: parent?.type !== "group" || !parent.linked,
    droppableIntoChildren: layer.type === "group" && !layer.linked,
    droppableExternals: true,
    expandable: true,
    selectable: true,
  }));
