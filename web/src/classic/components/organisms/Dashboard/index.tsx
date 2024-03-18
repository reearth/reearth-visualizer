import MoleculeHeader from "@reearth/classic/components/molecules/Common/Header";
import MoleculeDashboard from "@reearth/classic/components/molecules/Dashboard";
import Logo from "@reearth/classic/components/molecules/Dashboard/Logo";
import MarketplaceButton from "@reearth/classic/components/molecules/Dashboard/MarketplaceButton";
import ProjectList from "@reearth/classic/components/molecules/Dashboard/ProjectList";
import QuickStart from "@reearth/classic/components/molecules/Dashboard/QuickStart";
import Workspace from "@reearth/classic/components/molecules/Dashboard/Workspace";
import AssetModal from "@reearth/classic/components/organisms/Common/AssetModal";
import { useAuth } from "@reearth/services/auth";

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
    handleProjectCreateClick,
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
        onProjectCreateClick={handleProjectCreateClick}
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
