import { ReactNode } from "react";

import { useAuth } from "@reearth/auth";
import MoleculesSettingPage from "@reearth/components/molecules/Settings/SettingPage";

import useHooks from "./hooks";

type Props = {
  workspaceId?: string;
  projectId?: string;
  children?: ReactNode;
  loading?: boolean;
  hasMoreItems?: boolean;
  onScroll?: () => void;
};

const SettingPage: React.FC<Props> = ({
  workspaceId,
  projectId,
  children,
  loading,
  hasMoreItems,
  onScroll,
}) => {
  const { logout } = useAuth();

  const {
    user,
    workspaces = [],
    currentWorkspace,
    currentProject,
    sceneId,
    modalShown,
    handleWorkspaceChange,
    handleWorkspaceCreate,
    openModal,
    handleModalClose,
  } = useHooks({
    workspaceId,
    projectId,
  });

  return (
    <MoleculesSettingPage
      user={user}
      workspaces={workspaces}
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
