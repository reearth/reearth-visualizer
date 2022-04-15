import React from "react";
import { useIntl } from "react-intl";

import Button from "@reearth/components/atoms/Button";
import Flex from "@reearth/components/atoms/Flex";
import Loading from "@reearth/components/atoms/Loading";
import Text from "@reearth/components/atoms/Text";
import { styled, useTheme } from "@reearth/theme";

import DatasetHeader from "./DatasetHeader";
import DatasetModal, { NotificationType } from "./DatasetModal";
import DatasetSchemaCell from "./DatasetSchemaCell";
import useHooks, { DatasetSchema } from "./hooks";

export type Props = {
  className?: string;
  datasetSchemas?: DatasetSchema[];
  loading?: boolean;
  selectedDatasetSchemaId?: string;
  onDatasetSync?: (url: string) => void | Promise<void>;
  onDatasetImport?: (file: File, datasetSchemaId: string | null) => void | Promise<void>;
  onGoogleSheetDatasetImport?: (
    accessToken: string,
    fileId: string,
    sheetName: string,
    datasetSchemaId: string | null,
  ) => void | Promise<void>;
  onDatasetRemove?: (schemaId: string) => void | Promise<void>;
  onDatasetSchemaSelect?: (datasetSchemaId: string) => void;
  onNotificationChange?: (type: NotificationType, text: string, heading?: string) => void;
};

const DatasetPane: React.FC<Props> = ({
  className,
  datasetSchemas,
  loading,
  selectedDatasetSchemaId,
  onDatasetSync,
  onDatasetImport,
  onGoogleSheetDatasetImport,
  onDatasetRemove,
  onDatasetSchemaSelect,
  onNotificationChange,
}) => {
  const intl = useIntl();
  const theme = useTheme();
  const {
    datasetSyncOpen,
    datasetSyncLoading,
    handleDatasetSortByHost,
    handleGoogleSheetDatasetAdd,
    handleDatasetAdd,
    openDatasetModal,
    closeDatasetModal,
  } = useHooks(datasetSchemas, onDatasetImport, onDatasetSync, onGoogleSheetDatasetImport);

  return (
    <Wrapper className={className} align="stretch">
      <Flex justify="space-between" align="center">
        <Button
          buttonType="primary"
          icon="datasetAdd"
          text={intl.formatMessage({ defaultMessage: "Add Dataset" })}
          onClick={openDatasetModal}
        />
      </Flex>
      <Wrapper2>
        {Object.keys(handleDatasetSortByHost).length ? (
          Object.entries(handleDatasetSortByHost).map(([host, schemas]) => (
            <div key={host}>
              <DatasetHeader host={host} />
              {schemas.map(ds => (
                <DatasetSchemaCell
                  key={ds.id}
                  id={ds.id}
                  name={ds.name}
                  totalCount={ds.totalCount}
                  selected={selectedDatasetSchemaId === ds.id}
                  onDatasetSchemaSelect={onDatasetSchemaSelect}
                  onRemove={onDatasetRemove}
                />
              ))}
            </div>
          ))
        ) : (
          <NoDataset wrap="wrap" justify="center" align="center">
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
        onNotificationChange={onNotificationChange}
      />
    </Wrapper>
  );
};

const Wrapper = styled(Flex)`
  position: relative;
  width: 100%;
  height: 100%;
  flex-flow: column;
  overflow-y: auto;
`;

const Wrapper2 = styled.div`
  position: relative;
  flex: auto;
`;

const NoDataset = styled(Flex)`
  align-content: center;
`;

export default DatasetPane;
