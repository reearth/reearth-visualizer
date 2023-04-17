import { arrayMoveImmutable } from "array-move";
import { uniqBy } from "lodash-es";
import { useCallback, useRef, useMemo, useState, useEffect } from "react";
import { useShallowCompareEffect } from "react-use";

import { Item, searchItems } from "@reearth/components/atoms/TreeView";

import { Layer as LayerType, useLayerTreeViewItem } from "../LayerTreeViewItem";

export type ItemEx = {
  id: string;
  children?: Layer[];
};

export type Layer = LayerType<ItemEx>;

export default function ({
  active,
  layers,
  selected,
  onSelect,
}: {
  active?: boolean;
  layers: Layer[];
  selected: string[];
  onSelect?: (layers: Layer[]) => void;
}) {
  const selectedLeftLayers = useRef<Item<Layer>[]>([]);
  const selectedRightLayers = useRef<Item<Layer>[]>([]);
  const [selectedLeftLayerIds, selectLeftLayerIds] = useState<string[]>([]);
  const [selectedRightLayerIds, selectRightLayerIds] = useState<string[]>([]);

  const convertedLayers = useMemo(() => convert(layers), [layers]);

  const [rightLayers, setRightLayers] = useState<Item<Layer>>({
    id: "",
    content: { id: "" },
  });

  const leftLayers: Item<Layer> = useMemo(
    () => ({
      id: "",
      content: {
        id: "",
      },
      children: filterLayers(convertedLayers, rightLayers.children?.map(l => l.id) ?? []),
    }),
    [convertedLayers, rightLayers],
  );

  const clearSelectedLeftLayers = useCallback(() => {
    selectedLeftLayers.current = [];
    selectLeftLayerIds(l => (l.length === 0 ? l : []));
  }, []);

  const clearSelectedRightLayers = useCallback(() => {
    selectedRightLayers.current = [];
    selectRightLayerIds(l => (l.length === 0 ? l : []));
  }, []);

  const selectLeftLayers = useCallback((layers: Item<Layer>[]) => {
    selectedLeftLayers.current = layers;
    selectLeftLayerIds(layers.map(l => l.id));
  }, []);

  const selectRightLayers = useCallback((layers: Item<Layer>[]) => {
    selectedRightLayers.current = layers;
    selectRightLayerIds(layers.map(l => l.id));
  }, []);

  const ok = useCallback(
    () => onSelect?.(rightLayers.children?.map(l => l.content) ?? []),
    [onSelect, rightLayers.children],
  );

  const addLayers = useCallback(() => {
    const layers = uniqBy(flattenLayers(selectedLeftLayers.current), l => l.id);
    setRightLayers(l => {
      const ids = new Set(l.children?.map(l => l.id));
      return {
        ...l,
        children: [...(l.children ?? []), ...layers.filter(l => !ids.has(l.id))],
      };
    });
    selectedLeftLayers.current = [];
    selectLeftLayers([]);
  }, [selectLeftLayers]);

  const removeLayers = useCallback(() => {
    const ids = new Set(selectedRightLayers.current.map(l => l.id));
    setRightLayers(r => ({ ...r, children: r.children?.filter(i => !ids.has(i.id)) }));
  }, [selectedRightLayers]);

  const dropRightLayer = useCallback(
    (_src: any, dest: Item<LayerType>, srcIndex: number[], destIndex: number[]) => {
      setRightLayers(r => {
        if (dest !== r || !r.children) return r; // dest must be the root layer
        return { ...r, children: arrayMoveImmutable(r.children, srcIndex[0], destIndex[0]) };
      });
    },
    [],
  );

  const reset = useCallback(() => {
    const layers = searchItems(convertedLayers, selected)
      .filter((i): i is [Item<Layer>, number[]] => !!i && typeof i[0] !== "undefined")
      .map(i => i[0]);
    clearSelectedLeftLayers();
    clearSelectedRightLayers();
    setRightLayers(root => ({
      ...root,
      children: layers,
    }));
  }, [convertedLayers, selected, clearSelectedLeftLayers, clearSelectedRightLayers]);

  const TreeViewItem = useLayerTreeViewItem<ItemEx>();

  useEffect(() => {
    if (!active) {
      reset();
    }
  }, [active]); // eslint-disable-line react-hooks/exhaustive-deps

  useShallowCompareEffect(() => {
    reset();
  }, [layers, selected]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    selectedLeftLayers: selectedLeftLayerIds,
    selectedRightLayers: selectedRightLayerIds,
    selectLeftLayers,
    selectRightLayers,
    leftLayers,
    rightLayers,
    ok,
    addLayers,
    removeLayers,
    dropRightLayer,
    TreeViewItem,
  };
}

const convert = (layers: Layer[]): Item<Layer>[] =>
  layers
    .map<Item<Layer> | undefined>(l => ({
      id: l.id,
      content: l,
      children: l.children ? convert(l.children) : undefined,
      draggable: true,
      droppable: true,
      selectable: true,
      expandable: !!l.children?.length,
      droppableIntoChildren: !!l.children?.length,
    }))
    .filter((i): i is Item<Layer> => !!i);

const filterLayers = (items: Item<Layer>[], selected: string[]): Item<Layer>[] =>
  items
    .map(i => (i.children?.length ? { ...i, children: filterLayers(i.children, selected) } : i))
    .filter(i => !selected.includes(i.id));

const flattenLayers = (layers: Item<Layer>[]): Item<Layer>[] =>
  layers
    .map(l => (l.content.group && l.children?.length ? flattenLayers(l.children) : [l]))
    .reduce((a, b) => [...a, ...b], []);
