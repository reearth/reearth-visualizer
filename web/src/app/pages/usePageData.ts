import { useProject } from "@reearth/services/api/project";
import { useScene } from "@reearth/services/api/scene";
import { useMe } from "@reearth/services/api/user";
import { useMemo } from "react";

export const usePageData = (sceneId?: string, projectId?: string, workspaceId?: string) => {
  const { loading: loadingMe } = useMe();
  const { scene, loading: loadingScene } = useScene({ sceneId });

  const currentProjectId = useMemo(
    () => projectId ?? scene?.projectId,
    [projectId, scene?.projectId]
  );

  const currentWorkspaceId = useMemo(
    () => workspaceId ?? scene?.workspaceId,
    [workspaceId, scene?.workspaceId]
  );

  const { loading: loadingProject, project } = useProject(currentProjectId);

  const loading = useMemo(
    () => loadingMe || loadingScene || loadingProject,
    [loadingMe, loadingScene, loadingProject]
  );

  return {
    loading,
    isDeleted: project?.isDeleted,
    projectId: currentProjectId,
    workspaceId: currentWorkspaceId
  };
};
