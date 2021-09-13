import React, { useCallback } from "react";
import { useIntl } from "react-intl";

import Button from "@reearth/components/atoms/Button";
import Loading from "@reearth/components/atoms/Loading";
import { Type as NotificationType } from "@reearth/components/atoms/NotificationBar";
import Text from "@reearth/components/atoms/Text";
import { styled, useTheme } from "@reearth/theme";
import { parseHost, DataSource as RawDataSource } from "@reearth/util/path";

import DatasetHeader from "./DatasetHeader";
import DatasetModal from "./DatasetModal";
import DatasetSchemaCell from "./DatasetSchemaCell";
import useHooks from "./hooks";

export type DataSource = RawDataSource;

export type DatasetSchema = {
  id: string;
  name: string;
  source: DataSource;
  totalCount?: number;
  onDrop?: (layerId: string, index?: number) => void;
};

export type Props = {
  className?: string;
  datasetSchemas?: DatasetSchema[];
  onDatasetSync?: (url: string) => void | Promise<void>;
  onDatasetImport?: (file: File, datasetSchemaId: string | null) => void | Promise<void>;
  onGoogleSheetDatasetImport?: (
    accessToken: string,
    fileId: string,
    sheetName: string,
    datasetSchemaId: string | null,
  ) => void | Promise<void>;
  onRemoveDataset?: (schemaId: string) => void | Promise<void>;
  loading?: boolean;
  onNotify?: (type: NotificationType, text: string) => void;
};

const DatasetPane: React.FC<Props> = ({
  className,
  datasetSchemas,
  onDatasetSync,
  onDatasetImport,
  onGoogleSheetDatasetImport,
  onRemoveDataset,
  loading,
  onNotify,
}) => {
  const intl = useIntl();
  const {
    datasetSyncOpen,
    datasetSyncLoading,
    setDatasetSyncOpen,
    setDatasetSyncLoading,
    openDatasetModal,
    closeDatasetModal,
  } = useHooks();

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

  const handleDatasetRemove = useCallback(
    async (schemeId: string) => {
      await onRemoveDataset?.(schemeId);
    },
    [onRemoveDataset],
  );

  const byHost = (datasetSchemas || []).reduce((acc, ac) => {
    const host = parseHost(ac.source);
    const identifier = host || intl.formatMessage({ defaultMessage: "Other Source" });

    acc[identifier] = [...(acc[identifier] || []), ac];
    return acc;
  }, {} as { [host: string]: DatasetSchema[] });
  const theme = useTheme();

  return (
    <Wrapper className={className}>
      <TitleWrapper>
        <Button
          buttonType="primary"
          icon="datasetAdd"
          text={intl.formatMessage({ defaultMessage: "Add Dataset" })}
          onClick={openDatasetModal}
        />
      </TitleWrapper>
      <Wrapper2>
        {Object.keys(byHost).length ? (
          Object.entries(byHost).map(([host, schemas]) => (
            <div key={host}>
              <DatasetHeader host={host} />
              {schemas.map(ds => (
                <DatasetSchemaCell
                  key={ds.id}
                  id={ds.id}
                  name={ds.name}
                  totalCount={ds.totalCount}
                  onDrop={ds.onDrop}
                  onRemove={handleDatasetRemove}
                />
              ))}
            </div>
          ))
        ) : (
          <NoDataset>
            {/* TODO 画像入れたい */}
            <Text size="2xs" color={theme.main.text} otherProperties={{ textAlign: "center" }}>
              {intl.formatMessage({ defaultMessage: "No Dataset is here" })}
            </Text>
          </NoDataset>
        )}
        {loading && <Loading />}
      </Wrapper2>
      <DatasetModal
        isVisible={datasetSyncOpen}
        syncLoading={datasetSyncLoading}
        onClose={closeDatasetModal}
        handleGoogleSheetDatasetAdd={handleGoogleSheetDatasetAdd}
        handleDatasetAdd={handleDatasetAdd}
        onNotify={onNotify}
      />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: column;
  align-items: stretch;
  overflow-y: auto;
`;

const TitleWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Wrapper2 = styled.div`
  position: relative;
  flex: auto;
`;

const NoDataset = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  align-content: center;
`;

export default DatasetPane;
