import React from "react";
import { useIntl } from "react-intl";

import Loading from "@reearth/components/atoms/Loading";
import ProjectCreationModal from "@reearth/components/molecules/Common/ProjectCreationModal";
import MoleculeProjectList from "@reearth/components/molecules/Settings/ProjectList/ProjectList";
import SettingsHeader from "@reearth/components/molecules/Settings/SettingsHeader";
import AssetModal from "@reearth/components/organisms/Common/AssetModal";
import SettingPage from "@reearth/components/organisms/Settings/SettingPage";

import useHooks from "./hooks";

type Props = {
  teamId: string;
};

const ProjectList: React.FC<Props> = ({ teamId }) => {
  const intl = useIntl();
  const {
    loading,
    currentProjects,
    archivedProjects,
    modalShown,
    openModal,
    handleModalClose,
    createProject,
    selectProject,
    selectedAsset,
    assetModalOpened,
    toggleAssetModal,
    onAssetSelect,
  } = useHooks(teamId);

  return (
    <SettingPage teamId={teamId}>
      <SettingsHeader title={intl.formatMessage({ defaultMessage: "Project List" })} />
      <MoleculeProjectList
        projects={currentProjects}
        onProjectSelect={selectProject}
        onCreationButtonClick={openModal}
      />
      <MoleculeProjectList projects={archivedProjects} archived onProjectSelect={selectProject} />
      <ProjectCreationModal
        open={modalShown}
        onClose={handleModalClose}
        onSubmit={createProject}
        toggleAssetModal={toggleAssetModal}
        selectedAsset={selectedAsset}
        assetModal={
          <AssetModal
            teamId={teamId}
            isOpen={assetModalOpened}
            onSelect={onAssetSelect}
            toggleAssetModal={toggleAssetModal}
          />
        }
      />
      {loading && <Loading portal overlay />}
    </SettingPage>
  );
};

export default ProjectList;
