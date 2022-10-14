import React, { useState } from "react";

import Box from "@reearth/components/atoms/Box";
import ConfirmationModal from "@reearth/components/atoms/ConfirmationModal";
import Divider from "@reearth/components/atoms/Divider";
import Loading from "@reearth/components/atoms/Loading";
import Text from "@reearth/components/atoms/Text";
import TreeView from "@reearth/components/atoms/TreeView";
import { useT } from "@reearth/i18n";
import { styled } from "@reearth/theme";
import { metricsSizes } from "@reearth/theme/metrics";

import useHooks, { Format, Layer, Widget, Cluster, WidgetType, TreeViewItem } from "./hooks";

export type { Format, Layer, Widget, Cluster, WidgetType } from "./hooks";

export type Props = {
  className?: string;
  rootLayerId?: string;
  selectedLayerId?: string;
  selectedWidgetId?: string;
  selectedClusterId?: string;
  layers?: Layer[];
  widgets?: Widget[];
  clusters?: Cluster[];
  widgetTypes?: WidgetType[];
  sceneDescription?: string;
  selectedType?: "scene" | "layer" | "widgets" | "widget" | "cluster" | "dataset";
  loading?: boolean;
  onLayerRename?: (id: string, name: string) => void;
  onLayerVisibilityChange?: (id: string, visibility: boolean) => void;
  onLayerRemove?: (id: string) => void;
  onLayerSelect?: (layerId: string, ...i: number[]) => void;
  onSceneSelect?: () => void;
  onWidgetsSelect?: () => void;
  onWidgetSelect?: (widgetId: string | undefined, pluginId: string, extensionId: string) => void;
  onWidgetAdd?: (id?: string) => Promise<void>;
  onWidgetRemove?: (widgetId: string) => Promise<void>;
  onWidgetActivation?: (widgetId: string, enabled: boolean) => Promise<void>;
  onClusterSelect?: (clusterId: string) => void;
  onClusterAdd?: () => Promise<void>;
  onClusterRename?: (clusterId: string, name: string) => void;
  onClusterRemove?: (layerId: string) => Promise<void>;
  onLayerMove?: (
    layer: string,
    destLayer: string,
    index: number,
    destChildrenCount: number,
    parentId: string,
  ) => void;
  onDatasetSchemaSelect?: (datasetSchemaId: string) => void;
  onLayerGroupCreate?: () => void;
  onLayerImport?: (file: File, format: Format) => void;
  onDrop?: (layer: string, index: number, childrenCount: number) => any;
  onZoomToLayer?: (layerId: string) => void;
};

const OutlinePane: React.FC<Props> = ({
  className,
  rootLayerId,
  selectedLayerId,
  selectedWidgetId,
  selectedClusterId,
  selectedType,
  layers,
  widgets,
  clusters,
  widgetTypes,
  sceneDescription,
  onLayerRename,
  onLayerVisibilityChange,
  onLayerRemove,
  onLayerSelect,
  onSceneSelect,
  onWidgetsSelect,
  onWidgetSelect,
  onWidgetAdd,
  onWidgetRemove,
  onWidgetActivation,
  onClusterSelect,
  onClusterAdd,
  onClusterRename,
  onClusterRemove,
  onLayerMove,
  onLayerImport,
  onLayerGroupCreate,
  onDrop,
  onZoomToLayer,
  loading,
}) => {
  const t = useT();
  const [warningOpen, setWarning] = useState(false);

  const handleShowWarning = (show: boolean) => setWarning(show);

  const {
    sceneWidgetsItem,
    layersItem,
    clustersItem,
    select,
    drop,
    dropExternals,
    SceneTreeViewItem,
    LayerTreeViewItem,
    ClusterTreeViewItem,
    selected,
  } = useHooks({
    rootLayerId,
    layers,
    widgets,
    clusters,
    widgetTypes,
    sceneDescription,
    selectedLayerId,
    selectedWidgetId,
    selectedClusterId,
    selectedType,
    onLayerSelect,
    onLayerImport,
    onLayerRemove,
    onSceneSelect,
    onWidgetsSelect,
    onWidgetSelect,
    onWidgetAdd,
    onWidgetActivation,
    onClusterSelect,
    onClusterAdd,
    onClusterRemove,
    onLayerMove,
    onLayerRename,
    onClusterRename,
    onLayerVisibilityChange,
    onDrop,
    onLayerGroupCreate,
    handleShowWarning,
    onZoomToLayer,
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
      <ItemsGroupWrapper>
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
      </ItemsGroupWrapper>

      <ItemsGroupWrapper>
        {clustersItem && (
          <TreeView<TreeViewItem, HTMLDivElement>
            item={clustersItem}
            selected={selected}
            renderItem={ClusterTreeViewItem}
            selectable
            expandable
            expanded={["rootCluster"]}
            onSelect={select}
          />
        )}
        {loading && <Loading />}
      </ItemsGroupWrapper>

      <ConfirmationModal
        title={t("Delete widget")}
        body={
          <>
            <Divider margin="24px" />
            <Box mb={"m"}>
              <Text size="m">
                {t(
                  "You are about to delete the selected widget. You will lose all data tied to this widget.",
                )}
              </Text>
            </Box>
            <Text size="m">{t("Are you sure you would like to delete this widget?")}</Text>
          </>
        }
        buttonAction={t("Delete")}
        isOpen={warningOpen}
        onClose={() => handleShowWarning(false)}
        onProceed={() => {
          if (selectedWidgetId) {
            onWidgetRemove?.(selectedWidgetId);
          }
        }}
      />
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

const ItemsGroupWrapper = styled(OutlineItemsWrapper)`
  min-height: 0;
`;

export default OutlinePane;
