import { useCallback, useMemo, useRef, useState } from "react";

import type { Item as TreeViewItem } from "@reearth/components/atoms/TreeView";
import arrayDiff from "@reearth/util/arrayDiff";
import deepFind from "@reearth/util/deepFind";

import type { Layer as LayerType } from "../PropertyItem";

import type { Item as ItemType } from "./item";

export type Item = ItemType & { layerId?: string };
export type Layer = LayerType;

export default ({
  items = [],
  layers,
  layerMode,
  selectedIndex,
  onItemSelect,
  onItemAdd,
  onItemMove,
  onItemRemove,
  onItemsUpdate,
}: {
  items?: Item[];
  selectedIndex?: number;
  layers?: LayerType[];
  layerMode?: boolean;
  onItemSelect?: (index: number) => void;
  onItemAdd?: (defaultValue?: string) => void;
  onItemMove?: (from: number, to: number) => void;
  onItemRemove?: (index: number) => void;
  onItemsUpdate?: (
    items: {
      itemId?: string;
      layerId?: string;
      from: number;
      to: number;
    }[],
  ) => void;
}) => {
  // const [innerItems, setItems] = useState<Item[]>(items);
  const innerSelectedIndex = useRef(selectedIndex);
  const [layerModalActive, setLayerModalActive] = useState(false);
  const selectedLayers = useMemo(
    () => items.map(l => l.layerId).filter((id): id is string => !!id),
    [items],
  );

  const addItem = useCallback(() => {
    if (layerMode) {
      setLayerModalActive(true);
      return;
    }
    onItemAdd?.();
  }, [onItemAdd, layerMode]);
  const moveItem = useCallback(
    (_src: any, _dest: any, [from]: number[], [to]: number[]) => {
      if (!items[from]) return;
      // items.splice(to, 0, items.splice(from, 1)[0]);
      // setItems([...items]);
      onItemMove?.(from, to);
      onItemSelect?.(to);
    },
    [items, onItemMove, onItemSelect],
  );
  const removeItem = useCallback(() => {
    if (typeof innerSelectedIndex.current !== "number") return;
    // setItems([...items.slice(0, selectedIndex), ...items.slice(selectedIndex + 1)]);
    onItemRemove?.(innerSelectedIndex.current);
  }, [onItemRemove]);
  const handleSelect = useCallback(
    (_: any, index: number[][]) => {
      innerSelectedIndex.current = index[0]?.[0];
      onItemSelect?.(index[0]?.[0]);
    },
    [onItemSelect],
  );

  const closeLayerModal = useCallback(() => setLayerModalActive(false), []);
  const handleLayerSelect = useCallback(
    (newLayers: Layer[]) => {
      if (items.some(v => !v.layerId)) {
        // prevent wrong diff result to be output
        return;
      }

      const diff = arrayDiff(
        items.map(i => i.layerId).filter((i): i is string => !!i),
        newLayers.map(l => l.id),
      );

      const ops = diff.map(d => ({
        itemId: d[1] !== -1 ? items[d[1]]?.id : undefined,
        layerId: d[0],
        from: d[1],
        to: d[2],
      }));

      onItemsUpdate?.(ops);
      setLayerModalActive(false);
    },
    [items, onItemsUpdate],
  );

  const treeViewItem = useMemo(
    () => ({ id: "", content: { id: "" }, children: convert(items, layers) }),
    [items, layers],
  );
  const treeViewSelected = useMemo(
    () => (typeof selectedIndex === "number" ? [items?.[selectedIndex]?.id] : undefined),
    [items, selectedIndex],
  );

  return {
    layerModalActive,
    selectedLayers,
    treeViewItem,
    treeViewSelected,
    closeLayerModal,
    handleLayerSelect,
    addItem,
    moveItem,
    removeItem,
    handleSelect,
  };
};

const convert = (items: Item[], layers?: Layer[]): TreeViewItem<Item>[] =>
  items.map<TreeViewItem<Item>>(i => ({
    id: i.id,
    content:
      layers && i.layerId
        ? {
            ...i,
            title:
              deepFind(
                layers,
                l => l.id === i.layerId,
                l => l.children,
              )?.[0]?.title || i.title,
          }
        : i,
    draggable: true,
    droppable: true,
    selectable: true,
  }));
