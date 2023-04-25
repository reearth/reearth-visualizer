import React from "react";

import Loading from "@reearth/components/atoms/Loading";
import WorkspaceCreationModal from "@reearth/components/molecules/Common/WorkspaceCreationModal";
import SettingsHeader from "@reearth/components/molecules/Settings/SettingsHeader";
import MoleculeWorkspaceList from "@reearth/components/molecules/Settings/WorkspaceList/WorkspaceList";
import SettingPage from "@reearth/components/organisms/Settings/SettingPage";
import { useT } from "@reearth/i18n";

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
