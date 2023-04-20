import React from "react";

import DatasetPane from "@reearth/components/molecules/EarthEditor/DatasetPane";

import useHooks from "./hooks";

interface Props {
  className?: string;
}

const DataSourcePane: React.FC<Props> = ({ className }) => {
  const {
    datasetSchemas,
    loading,
    selectedDatasetSchemaId,
    currentTheme,
    currentLang,
    handleDatasetSync,
    handleDatasetImport,
    handleGoogleSheetDatasetImport,
    handleDatasetRemove,
    handleDatasetSchemaSelect,
    handleNotificationChange,
  } = useHooks();

  return (
    <DatasetPane
      className={className}
      datasetSchemas={datasetSchemas}
      loading={loading}
      selectedDatasetSchemaId={selectedDatasetSchemaId}
      onDatasetSync={handleDatasetSync}
      onGoogleSheetDatasetImport={handleGoogleSheetDatasetImport}
      onDatasetImport={handleDatasetImport}
      onDatasetRemove={handleDatasetRemove}
      onDatasetSchemaSelect={handleDatasetSchemaSelect}
      onNotificationChange={handleNotificationChange}
      currentLang={currentLang}
      currentTheme={currentTheme}
    />
  );
};

export default DataSourcePane;
