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
    sceneDescription,
    selectedType,
    selectedLayerId,
    selectedWidgetId,
    loading,
    selectLayer,
    moveLayer,
    renameLayer,
    removeLayer,
    updateLayerVisibility,
    importLayer,
    selectScene,
    selectWidget,
    addLayerGroup,
    handleDrop,
  } = useHooks();

  return (
    <RawOutlinePane
      className={className}
      rootLayerId={rootLayerId}
      selectedLayerId={selectedLayerId}
      selectedWidgetId={selectedWidgetId}
      layers={layers}
      widgets={widgets}
      sceneDescription={sceneDescription}
      selectedType={selectedType}
      loading={loading}
      onLayerMove={moveLayer}
      onLayerVisibilityChange={updateLayerVisibility}
      onLayerRename={renameLayer}
      onLayerRemove={removeLayer}
      onLayerImport={importLayer}
      onLayerSelect={selectLayer}
      onLayerGroupCreate={addLayerGroup}
      onSceneSelect={selectScene}
      onWidgetSelect={selectWidget}
      onDrop={handleDrop}
    />
  );
};

export default OutlinePane;
