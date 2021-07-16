import React from "react";
import useHooks from "./hooks";
import SettingPage from "@reearth/components/organisms/Settings/SettingPage";
import SettingsHeader from "@reearth/components/molecules/Settings/SettingsHeader";

import ProfileSection from "@reearth/components/molecules/Settings/Project/ProfileSection";
import DangerSection from "@reearth/components/molecules/Settings/Project/DangerSection";
import ArchivedMessage from "@reearth/components/molecules/Settings/Project/ArchivedMessage";

type Props = {
  projectId: string;
};

const Project: React.FC<Props> = ({ projectId }) => {
  const {
    project,
    currentTeam,
    updateProjectName,
    updateProjectDescription,
    updateProjectImageUrl,
    archiveProject,
    deleteProject,
    createAssets,
    assets,
  } = useHooks({ projectId });

  return (
    <SettingPage teamId={currentTeam?.id} projectId={projectId}>
      <SettingsHeader currentWorkspace={currentTeam} currentProject={project?.name} />
      {!project?.isArchived ? (
        <ProfileSection
          currentProject={project}
          updateProjectName={updateProjectName}
          updateProjectDescription={updateProjectDescription}
          updateProjectImageUrl={updateProjectImageUrl}
          assets={assets}
          createAssets={createAssets}
        />
      ) : (
        <ArchivedMessage />
      )}
      <DangerSection
        project={project}
        teamId={currentTeam?.id}
        archiveProject={archiveProject}
        deleteProject={deleteProject}
      />
    </SettingPage>
  );
};

export default Project;
