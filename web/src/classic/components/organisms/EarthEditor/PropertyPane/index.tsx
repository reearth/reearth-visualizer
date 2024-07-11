import React, { ComponentType, useCallback } from "react";

import Loading from "@reearth/classic/components/atoms/Loading";
import Wrapper from "@reearth/classic/components/molecules/EarthEditor/PropertyPane";
import AssetModal, {
  Props as AssetModalProps,
} from "@reearth/beta/organisms/AssetModal";

import useHooks, { Mode as RawMode } from "./hooks";

export type Mode = RawMode;
export interface Props {
  mode: Mode;
}

const PropertyPane: React.FC<Props> = ({ mode }) => {
  const {
    pane,
    workspaceId,
    isLayerGroup,
    linkedDatasetSchemaId,
    linkedDatasetId,
    isInfoboxCreatable,
    isCapturing,
    camera,
    sceneMode,
    datasetSchemas,
    loading,
    layers,
    selectedWidget,
    widgetAlignEditorActivated,
    selectedWidgetArea,
    changeValue,
    removeField,
    link,
    uploadFile,
    removeFile,
    createInfobox,
    removeInfobox,
    removeInfoboxField,
    onIsCapturingChange,
    onCameraChange,
    addPropertyItem,
    movePropertyItem,
    removePropertyItem,
    onWidgetAlignEditorActivate,
    handleAreaStateChange,
    updatePropertyItems,
  } = useHooks(mode);

  const AssetModalComponent: ComponentType<AssetModalProps> = useCallback(
    ({ ...props }) => <AssetModal workspaceId={workspaceId} {...props} />,
    [workspaceId],
  );

  return (
    <>
      {pane && (
        <Wrapper
          key={pane.id}
          propertyId={pane.propertyId}
          mode={pane.mode}
          title={pane.title}
          items={pane.items}
          isTemplate={pane.group}
          isInfoboxCreatable={isInfoboxCreatable}
          isCapturing={isCapturing}
          camera={camera}
          sceneMode={sceneMode}
          isLinkable={isLayerGroup && !!linkedDatasetSchemaId}
          linkedDatasetSchemaId={linkedDatasetSchemaId}
          linkedDatasetId={linkedDatasetId}
          datasetSchemas={datasetSchemas}
          layers={layers}
          assetModal={AssetModalComponent}
          selectedWidget={selectedWidget}
          widgetAlignEditorActivated={widgetAlignEditorActivated}
          selectedWidgetArea={selectedWidgetArea}
          onCreateInfobox={createInfobox}
          onChange={changeValue}
          onRemove={removeField}
          onLink={link}
          onUploadFile={uploadFile}
          onRemoveFile={removeFile}
          onIsCapturingChange={onIsCapturingChange}
          onCameraChange={onCameraChange}
          onItemAdd={addPropertyItem}
          onItemMove={movePropertyItem}
          onItemRemove={removePropertyItem}
          onItemsUpdate={updatePropertyItems}
          onWidgetAlignEditorActivate={onWidgetAlignEditorActivate}
          onAreaStateChange={handleAreaStateChange}
          onRemovePane={
            mode === "infobox" ? removeInfobox : mode === "block" ? removeInfoboxField : undefined
          }
        />
      )}
      {loading && <Loading />}
    </>
  );
};

export default PropertyPane;
