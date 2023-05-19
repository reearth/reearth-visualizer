import { useState, useCallback } from "react";

import { useT } from "@reearth/i18n";
import { parseHost, DataSource as RawDataSource } from "@reearth/util/path";

export type DataSource = RawDataSource;

export type DatasetSchema = {
  id: string;
  name: string;
  source: DataSource;
  totalCount?: number;
};

export default (
  datasetSchemas?: DatasetSchema[],
  onDatasetImport?: (file: File, datasetSchemaId: string | null) => void | Promise<void>,
  onDatasetSync?: (url: string) => void | Promise<void>,
  onGoogleSheetDatasetImport?: (
    accessToken: string,
    fileId: string,
    sheetName: string,
    datasetSchemaId: string | null,
  ) => void | Promise<void>,
) => {
  const t = useT();

  const [datasetSyncOpen, setDatasetSyncOpen] = useState(false);
  const [datasetSyncLoading, setDatasetSyncLoading] = useState(false);
  const openDatasetModal = useCallback(() => setDatasetSyncOpen(true), []);
  const closeDatasetModal = useCallback(() => setDatasetSyncOpen(false), []);

  const handleGoogleSheetDatasetAdd = useCallback(
    async (accessToken: string, fileId: string, sheetName: string, schemeId: string | null) => {
      setDatasetSyncLoading(true);
      try {
        await onGoogleSheetDatasetImport?.(accessToken, fileId, sheetName, schemeId);
      } finally {
        setDatasetSyncLoading(false);
      }
      setDatasetSyncOpen(false);
    },
    [onGoogleSheetDatasetImport, setDatasetSyncLoading, setDatasetSyncOpen],
  );

  const handleDatasetAdd = useCallback(
    async (data: string | File, schemeId: string | null) => {
      setDatasetSyncLoading(true);
      try {
        typeof data === "string"
          ? await onDatasetSync?.(data)
          : await onDatasetImport?.(data, schemeId);
      } finally {
        setDatasetSyncLoading(false);
      }
      setDatasetSyncOpen(false);
    },
    [onDatasetImport, onDatasetSync, setDatasetSyncLoading, setDatasetSyncOpen],
  );

  const handleDatasetSortByHost = (datasetSchemas || []).reduce<Record<string, DatasetSchema[]>>(
    (acc, ac) => {
      const host = parseHost(ac.source);
      const identifier = host || t("Other Source");
      if (!identifier) {
        return acc;
      }
      acc[identifier] = [...(acc[identifier] || []), ac];
      return acc;
    },
    {},
  );

  return {
    datasetSyncOpen,
    datasetSyncLoading,
    handleDatasetSortByHost,
    handleGoogleSheetDatasetAdd,
    handleDatasetAdd,
    openDatasetModal,
    closeDatasetModal,
  };
};
