import React from "react";

import useHooks from "./hooks";

// Components
import DatasetPane from "@reearth/components/molecules/EarthEditor/DatasetPane";

interface Props {
  className?: string;
}

const DataSourcePane: React.FC<Props> = ({ className }) => {
  const {
    datasetSchemas,
    handleDatasetSync,
    handleDatasetImport,
    handleGoogleSheetDatasetImport,
    handleRemoveDataset,
    loading,
    onNotify,
  } = useHooks();

  return (
    <DatasetPane
      className={className}
      datasetSchemas={datasetSchemas}
      onDatasetSync={handleDatasetSync}
      onGoogleSheetDatasetImport={handleGoogleSheetDatasetImport}
      onDatasetImport={handleDatasetImport}
      onRemoveDataset={handleRemoveDataset}
      loading={loading}
      onNotify={onNotify}
    />
  );
};

export default DataSourcePane;
