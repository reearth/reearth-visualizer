import React from "react";

import RawOutlinePane from "@reearth/components/molecules/EarthEditor/OutlinePane";

import useHooks from "./hooks";

export type Props = {
  className?: string;
};

const OutlinePane: React.FC<Props> = ({ className }) => {
  const {
    rootLayerId,
    layers,
    widgets,
    clusters,
    widgetTypes,
    sceneDescription,
    selectedType,
    selectedLayerId,
    selectedClusterId,
    selectedWidgetId,
    loading,
    selectLayer,
    moveLayer,
    renameLayer,
    removeLayer,
    updateLayerVisibility,
    importLayer,
    selectScene,
    selectWidgets,
    selectWidget,
    addWidget,
    removeWidget,
    activateWidget,
    addLayerGroup,
    handleDrop,
    selectCluster,
    addCluster,
    renameCluster,
    removeCluster,
    zoomToLayer,
  } = useHooks();

  return (
    <RawOutlinePane
      className={className}
      rootLayerId={rootLayerId}
      selectedLayerId={selectedLayerId}
      selectedClusterId={selectedClusterId}
      selectedWidgetId={selectedWidgetId}
      layers={layers}
      clusters={clusters}
      widgets={widgets}
      widgetTypes={widgetTypes}
      sceneDescription={sceneDescription}
      selectedType={selectedType}
      loading={loading}
      onLayerMove={moveLayer}
      onLayerVisibilityChange={updateLayerVisibility}
      onLayerRename={renameLayer}
      onClusterRename={renameCluster}
      onLayerRemove={removeLayer}
      onLayerImport={importLayer}
      onLayerSelect={selectLayer}
      onLayerGroupCreate={addLayerGroup}
      onSceneSelect={selectScene}
      onWidgetsSelect={selectWidgets}
      onWidgetSelect={selectWidget}
      onWidgetAdd={addWidget}
      onWidgetRemove={removeWidget}
      onClusterSelect={selectCluster}
      onClusterAdd={addCluster}
      onClusterRemove={removeCluster}
      onWidgetActivation={activateWidget}
      onDrop={handleDrop}
      onZoomToLayer={zoomToLayer}
    />
  );
};

export default OutlinePane;
