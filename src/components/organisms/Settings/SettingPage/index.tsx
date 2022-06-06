import React from "react";

import { useAuth } from "@reearth/auth";
import MoleculesSettingPage from "@reearth/components/molecules/Settings/SettingPage";

import useHooks from "./hooks";

type Props = {
  className?: string;
  teamId?: string;
  projectId?: string;
  loading?: boolean;
  hasMoreItems?: boolean;
  onBack?: () => void;
  onScroll?: () => void;
};

const SettingPage: React.FC<Props> = ({
  teamId,
  projectId,
  children,
  loading,
  hasMoreItems,
  onScroll,
}) => {
  const { logout } = useAuth();

  const {
    user,
    teams = [],
    currentTeam,
    currentProject,
    sceneId,
    modalShown,
    changeTeam,
    createTeam,
    openModal,
    handleModalClose,
    back,
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
      loading={loading}
      hasMoreItems={hasMoreItems}
      onSignOut={logout}
      onBack={back}
      onCreateTeam={createTeam}
      onChangeTeam={changeTeam}
      modalShown={modalShown}
      openModal={openModal}
      onModalClose={handleModalClose}
      onScroll={onScroll}>
      {children}
    </MoleculesSettingPage>
  );
};

export default SettingPage;
