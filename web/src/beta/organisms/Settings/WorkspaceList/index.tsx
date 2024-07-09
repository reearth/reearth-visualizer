import React from "react";

import Loading from "@reearth/beta/components/Loading";
import WorkspaceCreationModal from "@reearth/beta/features/Modals/WorkspaceCreationModal";
import SettingsHeader from "@reearth/beta/molecules/Settings/SettingsHeader";
import MoleculeWorkspaceList from "@reearth/beta/molecules/Settings/WorkspaceList/WorkspaceList";
import SettingPage from "@reearth/beta/organisms/Settings/SettingPage";
import { useT } from "@reearth/services/i18n";

import useHooks from "../Workspace/hooks";

// Components

type Props = {
  workspaceId: string;
};

const WorkspaceList: React.FC<Props> = ({ workspaceId }) => {
  const t = useT();
  const {
    workspaces,
    currentWorkspace,
    createWorkspace,
    selectWorkspace,
    openModal,
    modalShown,
    handleModalClose,
    loading,
  } = useHooks({ workspaceId });

  return (
    <SettingPage workspaceId={workspaceId}>
      <SettingsHeader title={t("Workspace List")} />
      <MoleculeWorkspaceList
        currentWorkspace={currentWorkspace}
        workspaces={workspaces}
        onWorkspaceSelect={selectWorkspace}
        onCreationButtonClick={openModal}
      />
      <WorkspaceCreationModal
        open={modalShown}
        onClose={handleModalClose}
        onSubmit={createWorkspace}
      />
      {loading && <Loading portal overlay />}
    </SettingPage>
  );
};

export default WorkspaceList;
