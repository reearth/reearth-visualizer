import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Role as RoleUnion } from "@reearth/classic/components/molecules/Settings/Workspace/MemberListItem";
import {
  useWorkspace,
  useProject,
  useNotification,
  useSessionWorkspace,
} from "@reearth/classic/state";
import {
  useGetTeamsQuery,
  useGetUserBySearchLazyQuery,
  useCreateTeamMutation,
  useUpdateTeamMutation,
  useDeleteTeamMutation,
  useAddMemberToTeamMutation,
  useUpdateMemberOfTeamMutation,
  Role,
  useRemoveMemberFromTeamMutation,
} from "@reearth/gql";
import { Team } from "@reearth/gql/graphql-client-api";
import { useT } from "@reearth/i18n";

type Params = {
  workspaceId: string;
};

export default (params: Params) => {
  const t = useT();
  const [currentWorkspace, setWorkspace] = useSessionWorkspace();
  const [lastWorkspace, setLastWorkspace] = useWorkspace();

  const [currentProject] = useProject();
  const [, setNotification] = useNotification();

  const navigate = useNavigate();
  const [searchedUser, changeSearchedUser] = useState<{
    id: string;
    name: string;
    email: string;
  }>();
  const [modalShown, setModalShown] = useState(false);
  const openModal = useCallback(() => setModalShown(true), []);

  const { data, loading, refetch } = useGetTeamsQuery();
  const me = { id: data?.me?.id, myTeam: data?.me?.myTeam.id };
  const workspaces = data?.me?.teams as Team[];

  const handleModalClose = useCallback(
    (r?: boolean) => {
      setModalShown(false);
      if (r) {
        refetch();
      }
    },
    [refetch],
  );

  useEffect(() => {
    if (!currentWorkspace && lastWorkspace) setWorkspace(lastWorkspace);
  }, [currentWorkspace, lastWorkspace, setWorkspace]);

  useEffect(() => {
    if (params.workspaceId && currentWorkspace?.id && params.workspaceId !== currentWorkspace.id) {
      navigate(`/settings/workspaces/${currentWorkspace?.id}`);
    }
  }, [params, currentWorkspace, navigate]);

  const workspaceId = currentWorkspace?.id;

  const [useGetUserBySearchQuery, { data: searchUserData }] = useGetUserBySearchLazyQuery();

  useEffect(() => {
    changeSearchedUser(searchUserData?.searchUser ?? undefined);
  }, [searchUserData?.searchUser]);

  const searchUser = useCallback(
    (nameOrEmail: string) => nameOrEmail && useGetUserBySearchQuery({ variables: { nameOrEmail } }),
    [useGetUserBySearchQuery],
  );

  const [createTeamMutation] = useCreateTeamMutation();
  const createWorkspace = useCallback(
    async (data: { name: string }) => {
      const results = await createTeamMutation({
        variables: { name: data.name },
        refetchQueries: ["GetTeams"],
      });
      const workspace = results.data?.createTeam?.team;
      if (results.errors || !results.data?.createTeam) {
        setNotification({
          type: "error",
          text: t("Failed to create workspace."),
        });
      } else {
        setWorkspace(workspace);
        setLastWorkspace(workspace);

        setNotification({
          type: "success",
          text: t("Sucessfully created a workspace!"),
        });
      }
      setModalShown(false);
    },
    [createTeamMutation, setNotification, t, setWorkspace, setLastWorkspace],
  );

  const [updateTeamMutation] = useUpdateTeamMutation();

  const updateName = useCallback(
    async (name?: string) => {
      if (!workspaceId || !name) return;
      const results = await updateTeamMutation({ variables: { teamId: workspaceId, name } });
      if (results.errors) {
        setNotification({
          type: "error",
          text: t("Failed to update workspace name."),
        });
      } else {
        setWorkspace(results.data?.updateTeam?.team);
        setLastWorkspace(currentWorkspace);

        setNotification({
          type: "info",
          text: t("You have changed the workspace's name."),
        });
      }
    },
    [
      workspaceId,
      updateTeamMutation,
      setNotification,
      t,
      setWorkspace,
      setLastWorkspace,
      currentWorkspace,
    ],
  );

  const [deleteTeamMutation] = useDeleteTeamMutation({
    refetchQueries: ["GetTeams"],
  });
  const deleteWorkspace = useCallback(async () => {
    if (!workspaceId) return;
    const result = await deleteTeamMutation({ variables: { teamId: workspaceId } });
    if (result.errors || !result.data?.deleteTeam) {
      setNotification({
        type: "error",
        text: t("Failed to delete workspace."),
      });
    } else {
      setNotification({
        type: "info",
        text: t("Workspace was successfully deleted."),
      });
      setWorkspace(workspaces[0]);
      setLastWorkspace(currentWorkspace);
    }
  }, [
    workspaceId,
    deleteTeamMutation,
    setNotification,
    t,
    setWorkspace,
    workspaces,
    setLastWorkspace,
    currentWorkspace,
  ]);

  const [addMemberToTeamMutation] = useAddMemberToTeamMutation();

  const addMembersToWorkspace = useCallback(
    async (userIds: string[]) => {
      const results = await Promise.all(
        userIds.map(async userId => {
          if (!workspaceId) return;
          const result = await addMemberToTeamMutation({
            variables: { userId, teamId: workspaceId, role: Role.Reader },
            refetchQueries: ["GetTeams"],
          });
          const workspace = result.data?.addMemberToTeam?.team;
          if (result.errors || !workspace) {
            setNotification({
              type: "error",
              text: t("Failed to add one or more members."),
            });
            return;
          }
          setWorkspace(workspace);
          setLastWorkspace(currentWorkspace);
        }),
      );
      if (results) {
        setNotification({
          type: "success",
          text: t("Successfully added member(s) to the workspace!"),
        });
      }
    },
    [
      workspaceId,
      addMemberToTeamMutation,
      setWorkspace,
      setLastWorkspace,
      currentWorkspace,
      setNotification,
      t,
    ],
  );

  const [updateMemberOfTeamMutation] = useUpdateMemberOfTeamMutation();

  const updateMemberOfWorkspace = useCallback(
    async (userId: string, role: RoleUnion) => {
      if (workspaceId) {
        const results = await updateMemberOfTeamMutation({
          variables: {
            teamId: workspaceId,
            userId,
            role: {
              READER: Role.Reader,
              WRITER: Role.Writer,
              OWNER: Role.Owner,
            }[role],
          },
        });
        const workspace = results.data?.updateMemberOfTeam?.team;
        if (workspace) {
          setWorkspace(workspace);
          setLastWorkspace(currentWorkspace);
        }
      }
    },
    [workspaceId, updateMemberOfTeamMutation, setWorkspace, setLastWorkspace, currentWorkspace],
  );

  const [removeMemberFromTeamMutation] = useRemoveMemberFromTeamMutation();

  const removeMemberFromWorkspace = useCallback(
    async (userId: string) => {
      if (!workspaceId) return;
      const result = await removeMemberFromTeamMutation({
        variables: { teamId: workspaceId, userId },
        refetchQueries: ["GetTeams"],
      });
      const workspace = result.data?.removeMemberFromTeam?.team;
      if (result.errors || !workspace) {
        setNotification({
          type: "error",
          text: t("Failed to delete member from the workspace."),
        });
        return;
      }
      setWorkspace(workspace);
      setLastWorkspace(currentWorkspace);

      setNotification({
        type: "success",
        text: t("Successfully removed member from the workspace."),
      });
    },
    [
      workspaceId,
      removeMemberFromTeamMutation,
      setWorkspace,
      setLastWorkspace,
      currentWorkspace,
      setNotification,
      t,
    ],
  );

  const selectWorkspace = useCallback(
    (workspace: Team) => {
      if (workspace.id) {
        setWorkspace(workspace);
        setLastWorkspace(currentWorkspace);

        navigate(`/settings/workspaces/${workspace.id}`);
      }
    },
    [currentWorkspace, navigate, setLastWorkspace, setWorkspace],
  );

  return {
    me,
    workspaces,
    currentWorkspace,
    currentProject,
    searchedUser,
    changeSearchedUser,
    createWorkspace,
    updateName,
    deleteWorkspace,
    searchUser,
    addMembersToWorkspace,
    updateMemberOfWorkspace,
    removeMemberFromWorkspace,
    selectWorkspace,
    openModal,
    modalShown,
    handleModalClose,
    loading,
  };
};
