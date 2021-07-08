import React from "react";

import Wrapper from "@reearth/components/molecules/EarthEditor/PropertyPane";
import useHooks, { Mode as RawMode } from "./hooks";
import Loading from "@reearth/components/atoms/Loading";

export type Mode = RawMode;
export interface Props {
  mode: Mode;
}

const PropertyPane: React.FC<Props> = ({ mode }) => {
  const {
    pane,
    isLayerGroup,
    linkedDatasetSchemaId,
    linkedDatasetId,
    isInfoboxCreatable,
    isCapturing,
    camera,
    datasetSchemas,
    loading,
    layers,
    assets,
    selectedWidget,
    changeValue,
    removeField,
    link,
    uploadFile,
    createAssets,
    removeFile,
    createInfobox,
    removeInfobox,
    removeInfoboxField,
    onIsCapturingChange,
    onCameraChange,
    addPropertyItem,
    movePropertyItem,
    removePropertyItem,
    onWidgetActivate,
    updatePropertyItems,
  } = useHooks(mode);
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
          isLinkable={isLayerGroup && !!linkedDatasetSchemaId}
          linkedDatasetSchemaId={linkedDatasetSchemaId}
          linkedDatasetId={linkedDatasetId}
          datasetSchemas={datasetSchemas}
          layers={layers}
          assets={assets}
          selectedWidget={selectedWidget}
          onCreateInfobox={createInfobox}
          onChange={changeValue}
          onRemove={removeField}
          onLink={link}
          onUploadFile={uploadFile}
          onCreateAsset={createAssets}
          onRemoveFile={removeFile}
          onIsCapturingChange={onIsCapturingChange}
          onCameraChange={onCameraChange}
          onItemAdd={addPropertyItem}
          onItemMove={movePropertyItem}
          onItemRemove={removePropertyItem}
          onItemsUpdate={updatePropertyItems}
          onWidgetActivate={onWidgetActivate}
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
