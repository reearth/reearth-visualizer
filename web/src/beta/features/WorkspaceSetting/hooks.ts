import { useMeFetcher, useWorkspaceFetcher } from "@reearth/services/api";
import { Role } from "@reearth/services/gql";
import { useCallback } from "react";

export type WorkspacePayload = {
  name?: string;
  userId?: string;
  teamId: string;
  role?: Role;
};

export type Projects = {
  name: string;
  userId?: string;
  teamId: string;
  role?: Role;
};

export default () => {
  const {
    useWorkspaceQuery,
    useWorkspacesQuery,
    useCreateWorkspace,
    useUpdateWorkspace,
    useDeleteWorkspace,
    useAddMemberToWorkspace,
    useRemoveMemberFromWorkspace,
    useUpdateMemberOfWorkspace
  } = useWorkspaceFetcher();

  // Fetch a specific workspace
  const handleFetchWorkspace = useCallback(
    (workspaceId: string) => {
      const { workspace, loading, error } = useWorkspaceQuery(workspaceId);
      return { workspace, loading, error };
    },
    [useWorkspaceQuery]
  );

  // Fetch all workspaces
  const handleFetchWorkspaces = useCallback(() => {
    const { workspaces, loading, error } = useWorkspacesQuery();
    return { workspaces, loading, error };
  }, [useWorkspacesQuery]);

  // Create a new workspace
  const handleCreateWorkspace = useCallback(
    async ({ name }: WorkspacePayload) => {
      if (name) {
        await useCreateWorkspace(name);
      }
    },
    [useCreateWorkspace]
  );

  // Update an existing workspace
  const handleUpdateWorkspace = useCallback(
    async ({ teamId, name }: WorkspacePayload) => {
      if (name && teamId) {
        await useUpdateWorkspace(teamId, name);
      }
    },
    [useUpdateWorkspace]
  );

  // Delete a workspace
  const handleDeleteWorkspace = useCallback(
    async (teamId: string) => {
      if (teamId) {
        await useDeleteWorkspace(teamId);
      }
    },
    [useDeleteWorkspace]
  );

  // Add a member to a workspace
  const handleAddMemberToWorkspace = useCallback(
    async ({ teamId, userId, role }: WorkspacePayload) => {
      if (userId && role) {
        await useAddMemberToWorkspace(teamId, userId, role);
      }
    },
    [useAddMemberToWorkspace]
  );

  // Remove a member from a workspace
  const handleRemoveMemberFromWorkspace = useCallback(
    async ({ teamId, userId }: WorkspacePayload) => {
      if (userId) {
        await useRemoveMemberFromWorkspace(teamId, userId);
      }
    },
    [useRemoveMemberFromWorkspace]
  );

  // update a member of workspace
  const handleUpdateMemberOfWorkspace = useCallback(
    async ({ teamId, userId, role }: WorkspacePayload) => {
      if (userId && role) {
        await useUpdateMemberOfWorkspace(teamId, userId, role);
      }
    },
    [useUpdateMemberOfWorkspace]
  );

  const { useSearchUser } = useMeFetcher();
  const handleSearchUser = useCallback(
    (nameOrEmail: string) => {
      const { user, status } = useSearchUser(nameOrEmail, {
        skip: !nameOrEmail
      });

      return { searchUser: user, searchUserStatus: status };
    },
    [useSearchUser]
  );

  return {
    handleFetchWorkspace,
    handleFetchWorkspaces,
    handleCreateWorkspace,
    handleUpdateWorkspace,
    handleDeleteWorkspace,
    handleAddMemberToWorkspace,
    handleRemoveMemberFromWorkspace,
    handleUpdateMemberOfWorkspace,
    handleSearchUser
  };
};
