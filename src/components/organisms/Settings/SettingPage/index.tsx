import React from "react";

import { useAuth } from "@reearth/auth";
import MoleculesSettingPage from "@reearth/components/molecules/Settings/SettingPage";

import useHooks from "./hooks";

type Props = {
  className?: string;
  teamId?: string;
  projectId?: string;
  onBack?: () => void;
};

const SettingPage: React.FC<Props> = ({ teamId, projectId, children }) => {
  const { logout } = useAuth();

  const {
    user,
    teams = [],
    currentTeam,
    currentProject,
    sceneId,
    changeTeam,
    createTeam,
    modalShown,
    openModal,
    handleModalClose,
    back,
    notification,
    onNotificationClose,
  } = useHooks({
    teamId,
    projectId,
  });

  return (
    <MoleculesSettingPage
      user={user}
      teams={teams}
      currentTeam={currentTeam}
      currentProject={currentProject}
      sceneId={sceneId}
      onSignOut={logout}
      onBack={back}
      onCreateTeam={createTeam}
      onChangeTeam={changeTeam}
      modalShown={modalShown}
      openModal={openModal}
      handleModalClose={handleModalClose}
      notification={notification}
      onNotificationClose={onNotificationClose}>
      {children}
    </MoleculesSettingPage>
  );
};

export default SettingPage;
