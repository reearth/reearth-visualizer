import React from "react";
import useHooks from "./hooks";
import SettingPage from "@reearth/components/organisms/Settings/SettingPage";
import DatasetSection from "@reearth/components/molecules/Settings/Project/Dataset/DatasetSection";
import SettingsHeader from "@reearth/components/molecules/Settings/SettingsHeader";
import { useIntl } from "react-intl";

type Props = {
  projectId: string;
};

const Dataset: React.FC<Props> = ({ projectId }) => {
  const intl = useIntl();
  const {
    currentTeam,
    currentProject,
    datasetSchemas,
    importDataset,
    removeDatasetSchema,
  } = useHooks(projectId);

  return (
    <SettingPage teamId={currentTeam?.id} projectId={projectId}>
      <SettingsHeader
        title={intl.formatMessage({ defaultMessage: "Dataset" })}
        currentWorkspace={currentTeam}
        currentProject={currentProject?.name}
      />
      <DatasetSection
        datasetSchemas={datasetSchemas}
        importDataset={importDataset}
        removeDatasetSchema={removeDatasetSchema}
      />
    </SettingPage>
  );
};

export default Dataset;
