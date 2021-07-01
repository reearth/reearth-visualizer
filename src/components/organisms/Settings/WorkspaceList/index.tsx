import React from "react";
import { useIntl } from "react-intl";

import useHooks from "../Workspace/hooks";

// Components
import SettingPage from "@reearth/components/organisms/Settings/SettingPage";
import WorkspaceCreationModal from "@reearth/components/molecules/Common/WorkspaceCreationModal";
import MoleculeWorkspaceList from "@reearth/components/molecules/Settings/WorkspaceList/WorkspaceList";
import SettingsHeader from "@reearth/components/molecules/Settings/SettingsHeader";
import Loading from "@reearth/components/atoms/Loading";

type Props = {
  teamId: string;
};

const WorkspaceList: React.FC<Props> = ({ teamId }) => {
  const intl = useIntl();
  const {
    teams,
    currentTeam,
    createTeam,
    selectWorkspace,
    openModal,
    modalShown,
    handleModalClose,
    loading,
  } = useHooks({ teamId });

  return (
    <SettingPage teamId={teamId}>
      <SettingsHeader title={intl.formatMessage({ defaultMessage: "Workspace List" })} />
      <MoleculeWorkspaceList
        currentTeam={currentTeam}
        teams={teams}
        onWorkspaceSelect={selectWorkspace}
        onCreationButtonClick={openModal}
      />
      <WorkspaceCreationModal open={modalShown} onClose={handleModalClose} onSubmit={createTeam} />
      {loading && <Loading portal overlay />}
    </SettingPage>
  );
};

export default WorkspaceList;
