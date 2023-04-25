import React from "react";

import ArchivedMessage from "@reearth/components/molecules/Settings/Project/ArchivedMessage";
import DangerSection from "@reearth/components/molecules/Settings/Project/DangerSection";
import ProfileSection from "@reearth/components/molecules/Settings/Project/ProfileSection";
import SettingsHeader from "@reearth/components/molecules/Settings/SettingsHeader";
import AssetModal from "@reearth/components/organisms/Common/AssetModal";
import SettingPage from "@reearth/components/organisms/Settings/SettingPage";

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
