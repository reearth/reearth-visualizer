import React from "react";

import Loading from "@reearth/components/atoms/Loading";
import TreeView from "@reearth/components/atoms/TreeView";
import { styled } from "@reearth/theme";
import { metricsSizes } from "@reearth/theme/metrics";

import useHooks, {
  Layer as LayerType,
  Widget as WidgetType,
  Format as FormatType,
  TreeViewItem,
} from "./hooks";

export type Layer = LayerType;
export type Widget = WidgetType;
export type Format = FormatType;

export type Props = {
  className?: string;
  rootLayerId?: string;
  selectedLayerId?: string;
  selectedWidgetId?: string;
  layers?: Layer[];
  widgets?: Widget[];
  sceneDescription?: string;
  selectedType?: "scene" | "layer" | "widgets" | "widget";
  loading?: boolean;
  onLayerRename?: (id: string, name: string) => void;
  onLayerVisibilityChange?: (id: string, visibility: boolean) => void;
  onLayerRemove?: (id: string) => void;
  onLayerSelect?: (layerId: string, ...i: number[]) => void;
  onSceneSelect?: () => void;
  onWidgetsSelect?: () => void;
  onWidgetSelect?: (widgetId: string | undefined, pluginId: string, extensionId: string) => void;
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
};

const OutlinePane: React.FC<Props> = ({
  className,
  rootLayerId,
  selectedLayerId,
  selectedWidgetId,
  selectedType,
  layers,
  widgets,
  sceneDescription,
  onLayerRename,
  onLayerVisibilityChange,
  onLayerRemove,
  onLayerSelect,
  onSceneSelect,
  onWidgetsSelect,
  onWidgetSelect,
  onLayerMove,
  onLayerImport,
  onLayerGroupCreate,
  onDrop,
  loading,
}) => {
  const {
    sceneWidgetsItem,
    layersItem,
    select,
    drop,
    dropExternals,
    SceneTreeViewItem,
    LayerTreeViewItem,
    selected,
  } = useHooks({
    rootLayerId,
    layers,
    widgets,
    sceneDescription,
    selectedLayerId,
    selectedWidgetId,
    selectedType,
    onLayerSelect,
    onLayerImport,
    onLayerRemove,
    onSceneSelect,
    onWidgetsSelect,
    onWidgetSelect,
    onLayerMove,
    onLayerRename,
    onLayerVisibilityChange,
    onDrop,
    onLayerGroupCreate,
  });

  return (
    <Wrapper className={className}>
      <OutlineItemsWrapper>
        {sceneWidgetsItem && (
          <TreeView<TreeViewItem, HTMLDivElement>
            item={sceneWidgetsItem}
            selected={selected}
            renderItem={SceneTreeViewItem}
            draggable
            droppable
            selectable
            expandable
            dragItemType="layer"
            acceptedDragItemTypes={acceptedDragItemTypes}
            onSelect={select}
          />
        )}
      </OutlineItemsWrapper>
      <LayersItemWrapper>
        {layersItem && (
          <TreeView<TreeViewItem, HTMLDivElement>
            item={layersItem}
            selected={selected}
            renderItem={LayerTreeViewItem}
            draggable
            droppable
            selectable
            expandable
            expanded={rootLayerId && !selectedLayerId ? [rootLayerId] : undefined}
            dragItemType="layer"
            acceptedDragItemTypes={acceptedDragItemTypes}
            onSelect={select}
            onDrop={drop}
            onDropExternals={dropExternals}
          />
        )}
        {loading && <Loading />}
      </LayersItemWrapper>
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
  margin-top: ${metricsSizes["4xl"]}px;
  position: relative;
  background-color: ${props => props.theme.layers.bg};
`;

const LayersItemWrapper = styled(OutlineItemsWrapper)`
  min-height: 0;
`;

export default OutlinePane;
