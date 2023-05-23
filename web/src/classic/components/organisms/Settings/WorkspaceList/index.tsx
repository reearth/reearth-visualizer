import React from "react";

import Loading from "@reearth/classic/components/atoms/Loading";
import WorkspaceCreationModal from "@reearth/classic/components/molecules/Common/WorkspaceCreationModal";
import SettingsHeader from "@reearth/classic/components/molecules/Settings/SettingsHeader";
import MoleculeWorkspaceList from "@reearth/classic/components/molecules/Settings/WorkspaceList/WorkspaceList";
import SettingPage from "@reearth/classic/components/organisms/Settings/SettingPage";
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
