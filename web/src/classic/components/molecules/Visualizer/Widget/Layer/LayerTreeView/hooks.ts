import { useEffect, useState, useCallback, useMemo } from "react";

import { Item as TreeViewItemType } from "@reearth/classic/components/atoms/TreeView";
import { arrayEquals } from "@reearth/classic/components/atoms/TreeView/util";
import { useT } from "@reearth/services/i18n";
import { Layer as LayerTreeViewItemItem, useLayerTreeViewItem } from "@reearth/classic/components/molecules/EarthEditor/LayerTreeViewItem";

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

export type ItemType = ItemEx["type"];
export type ItemEx =
  | { type: "root" | "scene" | "layer" | "scenes" | "widgets" | "cluster" }
  | {
      type: "widget";
      id?: string;
    }
  | { type: "dataset"; datasetSchemaId: string };

export type TreeViewItem = LayerTreeViewItemItem<ItemEx>;

export default ({
  rootLayerId,
  layers,
  selectedLayerId,
  selectedType,
  onLayerSelect,
  onLayerMove,
  onLayerRemove,
  onLayerRename,
  onLayerVisibilityChange,
  onDrop,
  onLayerGroupCreate,
  onLayerImport,
  onZoomToLayer,
}: {
  rootLayerId?: string;
  layers?: Layer[];
  selectedLayerId?: string;
  selectedType?: ItemType;
  onLayerSelect?: (id: string, ...i: number[]) => void;
  onLayerImport?: (file: File, format: Format) => void;
  onLayerRemove?: (id: string) => void;
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
  onZoomToLayer?: (layerId: string) => void;
}) => {
  const t = useT();
  const [selected, setSelected] = useState<string[]>([]);

  const select = useCallback(
    (items: TreeViewItemType<TreeViewItem>[], i: number[][]) => {
      const ids = items.map(i => i.id);
      setSelected(selected => (!arrayEquals(selected, ids) ? ids : selected));

      const item = items[0];
      if (!item) return;
     if (item.content.type === "layer") {
        onLayerSelect?.(
          item.id,
          // because other items can be exist like Scene, Widget
          ...(typeof i[0][0] === "number" ? [i[0][0] - 2, ...i[0].slice(1)] : []),
        );
      }
    },
    [onLayerSelect],
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

  const layerTitle = t("Layers");

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
                  showLayerActions: false,
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

  const LayerTreeViewItem = useLayerTreeViewItem<ItemEx>({
    onRename: layerTreeViewItemOnRename,
    onVisibilityChange: layerTreeViewItemOnLayerVisibilityChange,
    onRemove: onLayerRemove,
    onImport: onLayerImport,
    onGroupCreate: onLayerGroupCreate,
    visibilityShown: true,
    selectedLayerId,
    rootLayerId,
    onZoomToLayer,
  });

  useEffect(() => {
    const newState =
        selectedType === "layer" && selectedLayerId
        ? [selectedLayerId]
        : [];
    setSelected(ids => (arrayEquals(ids, newState) ? ids : newState));
  }, [selectedLayerId, selectedType]);

  return {
    layersItem,
    select,
    drop,
    dropExternals,
    removeLayer,
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
      showChildrenCount: false,
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
