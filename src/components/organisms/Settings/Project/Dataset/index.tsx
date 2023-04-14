import React from "react";

import ArchivedMessage from "@reearth/components/molecules/Settings/Project/ArchivedMessage";
import DatasetSection from "@reearth/components/molecules/Settings/Project/Dataset/DatasetSection";
import SettingsHeader from "@reearth/components/molecules/Settings/SettingsHeader";
import SettingPage from "@reearth/components/organisms/Settings/SettingPage";
import { useT } from "@reearth/i18n";

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
        />
      ) : (
        <ArchivedMessage />
      )}
    </SettingPage>
  );
};

export default Dataset;
