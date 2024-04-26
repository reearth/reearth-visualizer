import React, { useState } from "react";

import Loading from "@reearth/classic/components/atoms/Loading";
import TreeView from "@reearth/classic/components/atoms/TreeView";
import { metricsSizes } from "@reearth/classic/theme";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import useHooks, { Format, Layer, TreeViewItem } from "./hooks";

export type { Format, Layer } from "./hooks";

export type Props = {
  rootLayerId?: string;
  selectedLayerId?: string;
  layers?: Layer[];
  selectedType?: "scene" | "layer" | "widgets" | "widget" | "cluster" | "dataset";
  loading?: boolean;
  onLayerRename?: (id: string, name: string) => void;
  onLayerVisibilityChange?: (id: string, visibility: boolean) => void;
  onLayerRemove?: (id: string) => void;
  onLayerSelect?: (layerId: string, ...i: number[]) => void;
  onLayerMove?: (
    layer: string,
    destLayer: string,
    index: number,
    destChildrenCount: number,
    parentId: string,
  ) => void;
  onLayerGroupCreate?: () => void;
  onLayerImport?: (file: File, format: Format) => void;
  onDrop?: (layer: string, index: number, childrenCount: number) => any;
  onZoomToLayer?: (layerId: string) => void;
};

const LayerTreeView: React.FC<Props> = ({
  rootLayerId,
  selectedLayerId,
  selectedType,
  layers,
  onLayerRename,
  onLayerVisibilityChange,
  onLayerRemove,
  onLayerSelect,
  onLayerMove,
  onLayerImport,
  onLayerGroupCreate,
  onDrop,
  onZoomToLayer,
  loading,
}) => {
  const t = useT();
  const {
    layersItem,
    select,
    drop,
    dropExternals,
    LayerTreeViewItem,
    selected,
  } = useHooks({
    rootLayerId,
    layers,
    selectedLayerId,
    selectedType,
    onLayerSelect,
    onLayerImport,
    onLayerRemove,
    onLayerMove,
    onLayerRename,
    onLayerVisibilityChange,
    onDrop,
    onLayerGroupCreate,
    onZoomToLayer,
  });
  
  return (
    <Wrapper>
      <ItemsGroupWrapper>
        {layersItem && (
          <TreeView<TreeViewItem, HTMLDivElement>
            item={layersItem}
            selected={selected}
            renderItem={LayerTreeViewItem}
            //draggable
            //droppable
            selectable
            expandable
            expanded={rootLayerId && !selectedLayerId ? [rootLayerId] : undefined}
            //dragItemType="layer"
            //acceptedDragItemTypes={acceptedDragItemTypes}
            onSelect={select}
            //onDrop={drop}
            //onDropExternals={dropExternals}
          />
        )}
        {loading && <Loading />}
      </ItemsGroupWrapper>
    </Wrapper>
  );
};

const acceptedDragItemTypes = ["primitive"];

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: column;
`;

const OutlineItemsWrapper = styled.div`
  //margin-top: ${metricsSizes["4xl"]}px;
  position: relative;
  background-color: ${props => props.theme.classic.layers.bg};
`;

const ItemsGroupWrapper = styled(OutlineItemsWrapper)`
  min-height: 0;
`;

export default LayerTreeView;
