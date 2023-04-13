import { ReactNode } from "react";

import { useAuth } from "@reearth/auth";
import MoleculesSettingPage from "@reearth/components/molecules/Settings/SettingPage";

import useHooks from "./hooks";

type Props = {
  teamId?: string;
  projectId?: string;
  children?: ReactNode;
  loading?: boolean;
  hasMoreItems?: boolean;
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
    currentWorkspace,
    currentProject,
    sceneId,
    modalShown,
    handleWorkspaceChange,
    handleWorkspaceCreate,
    openModal,
    handleModalClose,
  } = useHooks({
    teamId,
    projectId,
  });

  return (
    <MoleculesSettingPage
      user={user}
      workspaces={teams}
      currentWorkspace={currentWorkspace}
      currentProject={currentProject}
      sceneId={sceneId}
      loading={loading}
      hasMoreItems={hasMoreItems}
      modalShown={modalShown}
      onSignOut={logout}
      onWorkspaceCreate={handleWorkspaceCreate}
      onWorkspaceChange={handleWorkspaceChange}
      openModal={openModal}
      onModalClose={handleModalClose}
      onScroll={onScroll}>
      {children}
    </MoleculesSettingPage>
  );
};

export default SettingPage;
