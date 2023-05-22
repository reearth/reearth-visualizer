import React from "react";

import ArchivedMessage from "@reearth/classic/components/molecules/Settings/Project/ArchivedMessage";
import DatasetSection from "@reearth/classic/components/molecules/Settings/Project/Dataset/DatasetSection";
import SettingsHeader from "@reearth/classic/components/molecules/Settings/SettingsHeader";
import SettingPage from "@reearth/classic/components/organisms/Settings/SettingPage";
import { useT } from "@reearth/services/i18n";

import useHooks from "./hooks";

type Props = {
  projectId: string;
};

const Dataset: React.FC<Props> = ({ projectId }) => {
  const t = useT();
  const {
    currentWorkspace,
    currentProject,
    datasetSchemas,
    datasetLoading,
    hasMoreDataSets,
    handleRemoveDataset,
    handleDatasetImport,
    handleGetMoreDataSets,
    handleDownloadFile,
  } = useHooks(projectId);

  return (
    <SettingPage
      workspaceId={currentWorkspace?.id}
      projectId={projectId}
      loading={datasetLoading}
      hasMoreItems={hasMoreDataSets}
      onScroll={handleGetMoreDataSets}>
      <SettingsHeader title={t("Dataset")} currentProject={currentProject?.name} />
      {!currentProject?.isArchived ? (
        <DatasetSection
          datasetSchemas={datasetSchemas}
          removeDatasetSchema={handleRemoveDataset}
          onDatasetImport={handleDatasetImport}
          onDownloadFile={handleDownloadFile}
        />
      ) : (
        <ArchivedMessage />
      )}
    </SettingPage>
  );
};

export default Dataset;
