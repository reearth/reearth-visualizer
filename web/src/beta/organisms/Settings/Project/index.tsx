import React from "react";

import ArchivedMessage from "@reearth/beta/molecules/Settings/Project/ArchivedMessage";
import DangerSection from "@reearth/beta/molecules/Settings/Project/DangerSection";
import ProfileSection from "@reearth/beta/molecules/Settings/Project/ProfileSection";
import SettingsHeader from "@reearth/beta/molecules/Settings/SettingsHeader";
import SettingPage from "@reearth/beta/organisms/Settings/SettingPage";
import AssetModal from "@reearth/beta/organisms/AssetModal";

import useHooks from "./hooks";

type Props = {
  projectId: string;
};

const Project: React.FC<Props> = ({ projectId }) => {
  const {
    project,
    currentWorkspace,
    updateProjectName,
    updateProjectDescription,
    updateProjectImageUrl,
    archiveProject,
    deleteProject,
    assetModalOpened,
    toggleAssetModal,
  } = useHooks({ projectId });

  return (
    <SettingPage workspaceId={currentWorkspace?.id} projectId={projectId}>
      <SettingsHeader currentWorkspace={currentWorkspace} currentProject={project?.name} />
      {!project?.isArchived ? (
        <ProfileSection
          currentProject={project}
          updateProjectName={updateProjectName}
          updateProjectDescription={updateProjectDescription}
          updateProjectImageUrl={updateProjectImageUrl}
          toggleAssetModal={toggleAssetModal}
          assetModal={
            <AssetModal
              workspaceId={currentWorkspace?.id}
              isOpen={assetModalOpened}
              initialAssetUrl={project?.imageUrl}
              onSelect={updateProjectImageUrl}
              toggleAssetModal={toggleAssetModal}
            />
          }
        />
      ) : (
        <ArchivedMessage />
      )}
      <DangerSection
        project={project}
        workspaceId={currentWorkspace?.id}
        archiveProject={archiveProject}
        deleteProject={deleteProject}
      />
    </SettingPage>
  );
};

export default Project;
