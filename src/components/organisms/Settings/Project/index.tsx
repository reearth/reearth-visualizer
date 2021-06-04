import React from "react";
import useHooks from "./hooks";
import SettingPage from "@reearth/components/organisms/Settings/SettingPage";
import SettingsHeader from "@reearth/components/molecules/Settings/SettingsHeader";

import StatusSection from "@reearth/components/molecules/Settings/Project/StatusSection";
import ProfileSection from "@reearth/components/molecules/Settings/Project/ProfileSection";
import PublishSection from "@reearth/components/molecules/Settings/Project/PublishSection";
import DangerSection from "@reearth/components/molecules/Settings/Project/DangerSection";
import ArchivedMessage from "@reearth/components/molecules/Settings/Project/ArchivedMessage";
import BasicAuthSection from "@reearth/components/molecules/Settings/Project/BasicAuthSection";

type Props = {
  projectId: string;
};

const Project: React.FC<Props> = ({ projectId }) => {
  const {
    project,
    currentTeam,
    updateProjectBasicAuth,
    updateProjectName,
    updateProjectDescription,
    updateProjectImageUrl,
    archiveProject,
    deleteProject,
    projectAlias,
    projectStatus,
    publishProject,
    loading,
    validAlias,
    checkProjectAlias,
    validatingAlias,
    createAssets,
    assets,
  } = useHooks({ projectId });

  return (
    <SettingPage teamId={currentTeam?.id} projectId={projectId}>
      <SettingsHeader currentWorkspace={currentTeam} currentProject={project?.name} />
      {!project?.isArchived && (
        <>
          <StatusSection projectStatus={projectStatus} />
          <BasicAuthSection
            onSave={updateProjectBasicAuth}
            isBasicAuthActive={project?.isBasicAuthActive}
            basicAuthUsername={project?.basicAuthUsername ?? ""}
            basicAuthPassword={project?.basicAuthPassword ?? ""}
          />
          <ProfileSection
            currentProject={project}
            updateProjectName={updateProjectName}
            updateProjectDescription={updateProjectDescription}
            updateProjectImageUrl={updateProjectImageUrl}
            assets={assets}
            createAssets={createAssets}
          />
          <PublishSection
            loading={loading}
            projectAlias={projectAlias}
            publicationStatus={projectStatus}
            onPublish={publishProject}
            validAlias={validAlias}
            onAliasValidate={checkProjectAlias}
            validatingAlias={validatingAlias}
          />
        </>
      )}
      {project?.isArchived && <ArchivedMessage />}
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
