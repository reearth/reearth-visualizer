import { useEffect, useState, useCallback, useMemo } from "react";

import { Item as TreeViewItemType } from "@reearth/classic/components/atoms/TreeView";
import { arrayEquals } from "@reearth/classic/components/atoms/TreeView/util";
import { useT } from "@reearth/services/i18n";
import {
  Layer as LayerTreeViewItemItem,
  useLayerTreeViewItem,
} from "@reearth/classic/components/molecules/EarthEditor/LayerTreeViewItem";

export type Format = "kml" | "czml" | "geojson" | "shape" | "reearth";

export type Layer = {
  id: string;
  title: string;
  icon?: string;
  linked?: boolean;
  visible?: boolean;
  property?: any;
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
  onLayerVisibilityChange,
  onZoomToLayer,
}: {
  rootLayerId?: string;
  layers?: Layer[];
  selectedLayerId?: string;
  selectedType?: ItemType;
  onLayerSelect?: (id: string, ...i: number[]) => void;
  onLayerVisibilityChange?: (id: string, visibility: boolean) => void;
  onZoomToLayer?: (layerId: string) => void;
}) => {
  const t = useT();
  const [selected, setSelected] = useState<string[]>([]);

  const select = useCallback(
    (items: TreeViewItemType<TreeViewItem>[], i: number[][]) => {
      const ids = items.map((i) => i.id);
      setSelected((selected) => (!arrayEquals(selected, ids) ? ids : selected));

      const item = items[0];
      if (!item) return;
      if (item.content.type === "layer") {
        onLayerSelect?.(
          item.id,
          // because other items can be exist like Scene, Widget
          ...(typeof i[0][0] === "number"
            ? [i[0][0] - 2, ...i[0].slice(1)]
            : [])
        );
      }
    },
    [onLayerSelect]
  );

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
                  renamable: false,
                },
                expandable: true,
                children: [...(convertLayers(layers) ?? [])],
              },
            ],
          }
        : undefined,
    [layerTitle, rootLayerId, layers]
  );

  const layerTreeViewItemOnLayerVisibilityChange = useCallback(
    (
      item: TreeViewItemType<LayerTreeViewItemItem<ItemEx>>,
      visibility: boolean
    ) => onLayerVisibilityChange?.(item.id, visibility),
    [onLayerVisibilityChange, layers]
  );

  const LayerTreeViewItem = useLayerTreeViewItem<ItemEx>({
    onVisibilityChange: layerTreeViewItemOnLayerVisibilityChange,
    visibilityShown: true,
    selectedLayerId,
    rootLayerId,
    onZoomToLayer,
  });

  useEffect(() => {
    const newState =
      selectedType === "layer" && selectedLayerId ? [selectedLayerId] : [];
    setSelected((ids) => (arrayEquals(ids, newState) ? ids : newState));
  }, [selectedLayerId, selectedType]);

  return {
    layersItem,
    select,
    LayerTreeViewItem,
    selected,
  };
};

const convertLayers = (
  layers: Layer[] | undefined,
  parent?: Layer
): TreeViewItemType<LayerTreeViewItemItem<{ type: "layer" }>>[] | undefined =>
  layers?.map((layer) => ({
    id: layer.id,
    content: {
      id: layer.id,
      type: "layer",
      group: layer.type === "group",
      childrenCount:
        layer.type === "group" ? layer.children?.length : undefined,
      showChildrenCount: false,
      icon: layer.icon,
      title: layer.title,
      linked: layer.linked,
      visible: layer.visible,
      visibilityChangeable: true,
      renamable: false,
      property: layer?.property,
    },
    children:
      layer.type === "group" ? convertLayers(layer.children, layer) : undefined,
    draggable: parent?.type !== "group" || !parent.linked,
    droppable: parent?.type !== "group" || !parent.linked,
    droppableIntoChildren: layer.type === "group" && !layer.linked,
    droppableExternals: true,
    expandable: true,
    selectable: true,
  }));
