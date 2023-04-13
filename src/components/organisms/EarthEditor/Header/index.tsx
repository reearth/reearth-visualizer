import React from "react";

// Components
import MoleculeHeader from "@reearth/components/molecules/EarthEditor/Header";
import PublicationModal from "@reearth/components/molecules/EarthEditor/PublicationModal";

import useHooks from "./hooks";

// TODO: ErrorBoudaryでエラーハンドリング

export type Props = {
  className?: string;
};

const Header: React.FC<Props> = ({ className }) => {
  const {
    teams = [],
    teamId,
    publicationModalVisible,
    searchIndex,
    publishing,
    workspaceModalVisible,
    projectId,
    projectAlias,
    projectStatus,
    publicationModalLoading,
    user,
    currentWorkspace,
    currentProject,
    validAlias,
    validatingAlias,
    url,
    handlePublicationModalOpen,
    handlePublicationModalClose,
    handleWorkspaceModalOpen,
    handleWorkspaceModalClose,
    handleSearchIndexChange,
    handleTeamChange,
    handleTeamCreate,
    handleProjectPublish,
    handleProjectAliasCheck,
    handleCopyToClipBoard,
    handlePreviewOpen,
    handleLogout,
  } = useHooks();

  return (
    <>
      <MoleculeHeader
        className={className}
        currentProjectStatus={projectStatus}
        currentProject={currentProject}
        user={user}
        workspaces={teams}
        teamId={teamId}
        currentWorkspace={currentWorkspace}
        modalShown={workspaceModalVisible}
        onPublishmentStatusClick={handlePublicationModalOpen}
        onSignOut={handleLogout}
        onWorkspaceCreate={handleTeamCreate}
        onWorkspaceChange={handleTeamChange}
        onPreviewOpen={handlePreviewOpen}
        openModal={handleWorkspaceModalOpen}
        onModalClose={handleWorkspaceModalClose}
      />
      <PublicationModal
        className={className}
        loading={publicationModalLoading}
        isVisible={!!publicationModalVisible}
        searchIndex={searchIndex}
        publishing={publishing}
        projectId={projectId}
        projectAlias={projectAlias}
        publicationStatus={projectStatus}
        validAlias={validAlias}
        validatingAlias={validatingAlias}
        url={url}
        onClose={handlePublicationModalClose}
        onSearchIndexChange={handleSearchIndexChange}
        onPublish={handleProjectPublish}
        onCopyToClipBoard={handleCopyToClipBoard}
        onAliasValidate={handleProjectAliasCheck}
      />
    </>
  );
};

export default Header;
