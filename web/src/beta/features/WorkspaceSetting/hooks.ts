import { useMeFetcher, useWorkspaceFetcher } from "@reearth/services/api";
import { Role } from "@reearth/services/gql";
import { useCallback } from "react";

export type WorkspacePayload = {
  name: string;
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
    useRemoveMemberFromWorkspace
  } = useWorkspaceFetcher();

  // Fetch a specific workspace
  const handleFetchWorkspace = useCallback(
    (workspaceId: string) => {
      const { workspace, loading, error } = useWorkspaceQuery(workspaceId);
      if (error) {
        console.error("Failed to fetch workspace:", error);
      }
      return { workspace, loading, error };
    },
    [useWorkspaceQuery]
  );

  // Fetch all workspaces
  const handleFetchWorkspaces = useCallback(() => {
    const { workspaces, loading, error } = useWorkspacesQuery();
    if (error) {
      console.error("Failed to fetch workspaces:", error);
    }
    return { workspaces, loading, error };
  }, [useWorkspacesQuery]);

  // Create a new workspace
  const handleCreateWorkspace = useCallback(
    async ({ name }: WorkspacePayload) => {
      try {
        const { status } = await useCreateWorkspace(name);
        if (status === "success") {
          console.log("Workspace created successfully");
        }
      } catch (error) {
        console.error("Failed to create workspace:", error);
      }
    },
    [useCreateWorkspace]
  );

  // Update an existing workspace
  const handleUpdateWorkspace = useCallback(
    async ({ teamId, name }: WorkspacePayload) => {
      try {
        const { status } = await useUpdateWorkspace(teamId, name);
        if (status === "success") {
          console.log("Workspace updated successfully");
        }
      } catch (error) {
        console.error("Failed to update workspace:", error);
      }
    },
    [useUpdateWorkspace]
  );

  // Delete a workspace
  const handleDeleteWorkspace = useCallback(
    async (teamId: string) => {
      try {
        const { status } = await useDeleteWorkspace(teamId);
        if (status === "success") {
          console.log("Workspace deleted successfully");
        }
      } catch (error) {
        console.error("Failed to delete workspace:", error);
      }
    },
    [useDeleteWorkspace]
  );

  // Add a member to a workspace
  const handleAddMemberToWorkspace = useCallback(
    async ({ teamId, userId, role }: WorkspacePayload) => {
      try {
        if (userId && role) {
          const { status } = await useAddMemberToWorkspace(
            teamId,
            userId,
            role
          );
          if (status === "success") {
            console.log("Member added successfully");
          }
        }
      } catch (error) {
        console.error("Failed to add member to workspace:", error);
      }
    },
    [useAddMemberToWorkspace]
  );

  // Remove a member from a workspace
  const handleRemoveMemberFromWorkspace = useCallback(
    async ({ teamId, userId }: WorkspacePayload) => {
      try {
        if (userId) {
          const { status } = await useRemoveMemberFromWorkspace(teamId, userId);
          if (status === "success") {
            console.log("Member removed successfully");
          }
        }
      } catch (error) {
        console.error("Failed to remove member from workspace:", error);
      }
    },
    [useRemoveMemberFromWorkspace]
  );

  const { useSearchUser } = useMeFetcher();
  const handleSearchUser = useCallback(
    (nameOrEmail: string) => {
      try {
        const { user, status } = useSearchUser(nameOrEmail);
        if (status === "success") {
          console.log("Search Member successfully");
        }
        return user;
      } catch (err) {
        console.error("Failed to search user:", err);
        return { error: err };
      }
    },
    [useSearchUser]
  );

  // const debounceOnUpdate = useMemo(() => {
  //   return debounce(handleSearchUser, 500);
  // }, [handleSearchUser]);

  return {
    handleFetchWorkspace,
    handleFetchWorkspaces,
    handleCreateWorkspace,
    handleUpdateWorkspace,
    handleDeleteWorkspace,
    handleAddMemberToWorkspace,
    handleRemoveMemberFromWorkspace,
    debounceOnUpdate: handleSearchUser
  };
};
