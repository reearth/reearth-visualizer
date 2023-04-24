import { useAuth } from "@reearth/auth";
import MoleculeHeader from "@reearth/components/molecules/Common/Header";
import MoleculeDashboard from "@reearth/components/molecules/Dashboard";
import Logo from "@reearth/components/molecules/Dashboard/Logo";
import MarketplaceButton from "@reearth/components/molecules/Dashboard/MarketplaceButton";
import ProjectList from "@reearth/components/molecules/Dashboard/ProjectList";
import QuickStart from "@reearth/components/molecules/Dashboard/QuickStart";
import Workspace from "@reearth/components/molecules/Dashboard/Workspace";
import AssetModal from "@reearth/components/organisms/Common/AssetModal";

import useHooks from "./hooks";

export type Props = {
  workspaceId?: string;
};

const Dashboard: React.FC<Props> = ({ workspaceId }) => {
  const { logout } = useAuth();

  const {
    user,
    projects,
    projectLoading,
    hasMoreProjects,
    workspaces,
    currentWorkspace,
    isPersonal,
    modalShown,
    selectedAsset,
    assetModalOpened,
    handleProjectCreate,
    handleWorkspaceCreate,
    handleWorkspaceChange,
    handleModalOpen,
    handleModalClose,
    handleAssetModalToggle,
    handleAssetSelect,
    handleGetMoreProjects,
  } = useHooks(workspaceId);

  return (
    <MoleculeDashboard
      header={
        <MoleculeHeader
          user={user}
          workspaces={workspaces}
          currentWorkspace={currentWorkspace}
          personalWorkspace={isPersonal}
          modalShown={modalShown}
          onSignOut={logout}
          onWorkspaceCreate={handleWorkspaceCreate}
          onWorkspaceChange={handleWorkspaceChange}
          openModal={handleModalOpen}
          onModalClose={handleModalClose}
          dashboard
        />
      }
      isLoading={projectLoading}
      hasMoreProjects={hasMoreProjects}
      onGetMoreProjects={handleGetMoreProjects}>
      <Workspace workspace={currentWorkspace} isPersonal={isPersonal} />
      <QuickStart
        selectedAsset={selectedAsset}
        onWorkspaceCreate={handleWorkspaceCreate}
        onProjectCreate={handleProjectCreate}
        onAssetSelect={handleAssetSelect}
        toggleAssetModal={handleAssetModalToggle}
        assetModal={
          <AssetModal
            workspaceId={workspaceId}
            initialAssetUrl={selectedAsset}
            isOpen={assetModalOpened}
            onSelect={handleAssetSelect}
            toggleAssetModal={handleAssetModalToggle}
          />
        }
      />
      <MarketplaceButton />
      <Logo />
      <ProjectList projects={projects} />
    </MoleculeDashboard>
  );
};

export default Dashboard;
