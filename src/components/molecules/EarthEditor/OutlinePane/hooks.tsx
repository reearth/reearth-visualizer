import { useEffect, useState } from "react";
import { useCallback, useMemo } from "react";
import { useIntl } from "react-intl";

import { Item as TreeViewItemType } from "@reearth/components/atoms/TreeView";
import { Layer as LayerTreeViewItemItem, useLayerTreeViewItem } from "../LayerTreeViewItem";
import { arrayEquals } from "@reearth/components/atoms/TreeView/util";

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
  title: string;
  description?: string;
  enabled?: boolean;
  icon?: string;
};

export type ItemType = "root" | "scene" | "layer" | "widget";
export type ItemEx = { type: ItemType };
export type TreeViewItem = LayerTreeViewItemItem<ItemEx>;

export default ({
  rootLayerId,
  layers,
  widgets,
  sceneDescription,
  selectedLayerId,
  selectedWidgetId,
  selectedType,
  onLayerSelect,
  onSceneSelect,
  onWidgetSelect,
  onLayerMove,
  onLayerRemove,
  onLayerRename,
  onLayerVisibilityChange,
  onDrop,
  onLayerGroupCreate,
  onLayerImport,
}: {
  rootLayerId?: string;
  layers?: Layer[];
  widgets?: Widget[];
  sceneDescription?: string;
  selectedLayerId?: string;
  selectedIndex?: number[];
  selectedWidgetId?: string;
  selectedType?: ItemType;
  onLayerSelect?: (id: string, ...i: number[]) => void;
  onLayerImport?: (file: File, format: Format) => void;
  onLayerRemove?: (id: string) => void;
  onSceneSelect?: () => void;
  onWidgetSelect?: (id: string) => void;
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
      } else if (item.content.type === "widget") {
        onWidgetSelect?.(item.id);
      } else if (item.content.type === "layer") {
        onLayerSelect?.(
          item.id,
          // because other items can be exist like Scene, Widget
          ...(typeof i[0][0] === "number" ? [i[0][0] - 2, ...i[0].slice(1)] : []),
        );
      }
    },
    [onLayerSelect, onSceneSelect, onWidgetSelect],
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
            id: "scene",
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
            id: "widgets",
            type: "widget",
            icon: "widget",
            title: widgetTitle,
            group: true,
          },
          draggable: false,
          droppable: false,
          droppableIntoChildren: false,
          expandable: true,
          selectable: false,
          children: widgets?.map(w => ({
            id: w.id,
            content: {
              id: w.id,
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
    [sceneTitle, sceneDescription, widgetTitle, widgets],
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

  const SceneTreeViewItem = useLayerTreeViewItem<ItemEx>();

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
