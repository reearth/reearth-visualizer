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
    changeTeam,
    publicationModalVisible,
    onSearchIndexChange,
    searchIndex,
    publishing,
    openPublicationModal,
    closePublicationModal,
    workspaceModalVisible,
    openWorkspaceModal,
    closeWorkspaceModal,
    projectId,
    projectAlias,
    projectStatus,
    publishProject,
    publicationModalLoading,
    user,
    currentTeam,
    currentProject,
    logout,
    notification,
    notify,
    validAlias,
    checkProjectAlias,
    validatingAlias,
    closeNotification,
    createTeam,
    url,
    openPreview,
  } = useHooks();

  return (
    <>
      <MoleculeHeader
        className={className}
        currentProjectStatus={projectStatus}
        currentProject={currentProject}
        user={user}
        teams={teams}
        teamId={teamId}
        currentTeam={currentTeam}
        onPublishmentStatusClick={openPublicationModal}
        onSignOut={logout}
        onCreateTeam={createTeam}
        onChangeTeam={changeTeam}
        notification={notification}
        onNotificationClose={closeNotification}
        onPreviewOpen={openPreview}
        modalShown={workspaceModalVisible}
        openModal={openWorkspaceModal}
        handleModalClose={closeWorkspaceModal}
      />
      <PublicationModal
        className={className}
        loading={publicationModalLoading}
        isVisible={!!publicationModalVisible}
        onClose={closePublicationModal}
        onSearchIndexChange={onSearchIndexChange}
        searchIndex={searchIndex}
        publishing={publishing}
        onPublish={publishProject}
        projectId={projectId}
        projectAlias={projectAlias}
        publicationStatus={projectStatus}
        onNotify={notify}
        validAlias={validAlias}
        onAliasValidate={checkProjectAlias}
        validatingAlias={validatingAlias}
        url={url}
      />
    </>
  );
};

export default Header;
