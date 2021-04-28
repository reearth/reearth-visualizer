import { useState, useCallback } from "react";

export default () => {
  const [datasetSyncOpen, setDatasetSyncOpen] = useState(false);
  const [datasetSyncLoading, setDatasetSyncLoading] = useState(false);
  const openDatasetModal = useCallback(() => setDatasetSyncOpen(true), []);
  const closeDatasetModal = useCallback(() => setDatasetSyncOpen(false), []);
  return {
    datasetSyncOpen,
    datasetSyncLoading,
    setDatasetSyncOpen,
    setDatasetSyncLoading,
    openDatasetModal,
    closeDatasetModal,
  };
};
