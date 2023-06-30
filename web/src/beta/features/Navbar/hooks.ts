import { useMemo, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  useWorkspacesFetcher,
  useCreateWorkspaceFetcher,
  useProjectFetcher,
} from "@reearth/services/api";
import { useAuth } from "@reearth/services/auth";
import { useProject, useWorkspace } from "@reearth/services/state";

export default (sceneId: string) => {
  const { logout: handleLogout } = useAuth();

  const [currentWorkspace, setCurrentWorkspace] = useWorkspace();
  const [currentProject, setProject] = useProject();
  const [workspaceModalVisible, setWorkspaceModalVisible] = useState(false);
  const { workspaces, workspaceData, user } = useWorkspacesFetcher();
  const { workspaceId, project } = useProjectFetcher(sceneId);

  const navigate = useNavigate();

  const personal = useMemo(() => {
    return workspaceId === workspaceData?.me?.myTeam.id;
  }, [workspaceId, workspaceData?.me]);

  const handleWorkspaceModalOpen = useCallback(() => setWorkspaceModalVisible(true), []);
  const handleWorkspaceModalClose = useCallback(() => setWorkspaceModalVisible(false), []);

  useEffect(() => {
    setProject(p =>
      p?.id !== project?.id
        ? project
          ? {
              id: project.id,
              name: project.name,
              sceneId: project.sceneId,
              projectType: project.coreSupport ? "beta" : "classic",
            }
          : undefined
        : p,
    );
  }, [project, setProject]);

  const handleWorkspaceChange = useCallback(
    (workspaceId: string) => {
      const workspace = workspaces?.find(team => team.id === workspaceId);
      if (workspace && workspaceId !== currentWorkspace?.id) {
        setCurrentWorkspace(workspace);

        navigate(`/dashboard/${workspaceId}`);
      }
    },
    [workspaces, currentWorkspace, setCurrentWorkspace, navigate],
  );

  const handleWorkspaceCreate = useCallback(
    async (data: { name: string }) => {
      const workspace = await useCreateWorkspaceFetcher(data.name);
      if (workspace) {
        setCurrentWorkspace(workspace);
        navigate(`/dashboard/${workspace.id}`);
      }
    },
    [setCurrentWorkspace, navigate],
  );

  return {
    workspaces,
    currentProject,
    isPersonal: personal,
    user,
    currentWorkspace,
    workspaceModalVisible,
    handleWorkspaceModalOpen,
    handleWorkspaceModalClose,
    handleWorkspaceChange,
    handleWorkspaceCreate,
    handleLogout,
  };
};
