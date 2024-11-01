import { useMutation, useQuery } from "@apollo/client";
import { CreateTeamPayload, Role } from "@reearth/services/gql/__gen__/graphql";
import { GET_ME } from "@reearth/services/gql/queries/user";
import {
  ADD_MEMBER_TO_WORKSPACE,
  CREATE_WORKSPACE,
  DELETE_WORKSPACE,
  REMOVE_MEMBER_FROM_WORKSPACE,
  UPDATE_MEMBER_OF_WORKSPACE,
  UPDATE_WORKSPACE
} from "@reearth/services/gql/queries/workspace";
import { useT } from "@reearth/services/i18n";
import { useCallback } from "react";

import { useNotification } from "../state";

import { MutationReturn } from "./types";

export type Team = CreateTeamPayload["team"];

export default () => {
  const t = useT();
  const [, setNotification] = useNotification();

  const useWorkspaceQuery = useCallback((workspaceId?: string) => {
    const { data, ...rest } = useQuery(GET_ME);
    const workspace = data?.me?.teams.find((t) => t.id === workspaceId);

    return { workspace, ...rest };
  }, []);

  const useWorkspacesQuery = useCallback(() => {
    const { data, ...rest } = useQuery(GET_ME);

    return { workspaces: data?.me?.teams, ...rest };
  }, []);

  const [createWorkspaceMutation] = useMutation(CREATE_WORKSPACE, {
    refetchQueries: ["GetMe"]
  });
  const useCreateWorkspace = useCallback(
    async (name: string): Promise<MutationReturn<Partial<Team>>> => {
      const { data, errors } = await createWorkspaceMutation({
        variables: { name }
      });
      if (errors || !data?.createTeam) {
        console.log("GraphQL: Failed to create workspace", errors);
        setNotification({
          type: "error",
          text: t("Failed to create workspace.")
        });

        return { status: "error" };
      }

      setNotification({
        type: "success",
        text: t("Successfully created workspace!")
      });
      return { data: data.createTeam.team, status: "success" };
    },
    [createWorkspaceMutation, setNotification, t]
  );

  const [deleteWorkspaceMutation] = useMutation(DELETE_WORKSPACE, {
    refetchQueries: ["GetMe"]
  });
  const useDeleteWorkspace = useCallback(
    async (teamId: string): Promise<MutationReturn<null>> => {
      const { data, errors } = await deleteWorkspaceMutation({
        variables: { teamId }
      });
      if (errors || !data?.deleteTeam) {
        console.log("GraphQL: Failed to delete workspace", errors);
        setNotification({
          type: "error",
          text: t("Failed to delete workspace.")
        });

        return { status: "error" };
      }

      setNotification({
        type: "success",
        text: t("Successfully deleted workspace!")
      });
      return { status: "success" };
    },
    [deleteWorkspaceMutation, setNotification, t]
  );

  const [updateWorkspaceMutation] = useMutation(UPDATE_WORKSPACE, {
    refetchQueries: ["GetMe"]
  });
  const useUpdateWorkspace = useCallback(
    async (
      teamId: string,
      name: string
    ): Promise<MutationReturn<Partial<Team>>> => {
      const { data, errors } = await updateWorkspaceMutation({
        variables: { teamId, name }
      });
      if (errors || !data?.updateTeam) {
        console.log("GraphQL: Failed to update workspace", errors);
        setNotification({
          type: "error",
          text: t("Failed to update workspace.")
        });

        return { status: "error" };
      }

      setNotification({
        type: "success",
        text: t("Successfully updated workspace!")
      });
      return { data: data.updateTeam.team, status: "success" };
    },
    [updateWorkspaceMutation, setNotification, t]
  );

  const [addMemberToWorkspaceMutation] = useMutation(ADD_MEMBER_TO_WORKSPACE, {
    refetchQueries: ["GetMe"]
  });
  const useAddMemberToWorkspace = useCallback(
    async (
      teamId: string,
      userId: string,
      role: Role
    ): Promise<MutationReturn<Partial<Team>>> => {
      const { data, errors } = await addMemberToWorkspaceMutation({
        variables: { teamId, userId, role }
      });
      if (errors || !data?.addMemberToTeam) {
        console.log("GraphQL: Failed to add member to workspace", errors);
        setNotification({
          type: "error",
          text: t("Failed to add member to workspace.")
        });

        return { status: "error" };
      }

      setNotification({
        type: "success",
        text: t("Successfully added member to workspace!")
      });
      return { data: data.addMemberToTeam.team, status: "success" };
    },
    [addMemberToWorkspaceMutation, setNotification, t]
  );

  const [removeMemberFromWorkspaceMutation] = useMutation(
    REMOVE_MEMBER_FROM_WORKSPACE,
    {
      refetchQueries: ["GetMe"]
    }
  );
  const useRemoveMemberFromWorkspace = useCallback(
    async (
      teamId: string,
      userId: string
    ): Promise<MutationReturn<Partial<Team>>> => {
      const { data, errors } = await removeMemberFromWorkspaceMutation({
        variables: { teamId, userId }
      });
      if (errors || !data?.removeMemberFromTeam) {
        console.log("GraphQL: Failed to remove member from workspace", errors);
        setNotification({
          type: "error",
          text: t("Failed to remove member from workspace.")
        });

        return { status: "error" };
      }

      setNotification({
        type: "success",
        text: t("Successfully removed member from workspace!")
      });
      return { data: data.removeMemberFromTeam.team, status: "success" };
    },
    [removeMemberFromWorkspaceMutation, setNotification, t]
  );

  const [updateMemberOfWorkspaceMutation] = useMutation(
    UPDATE_MEMBER_OF_WORKSPACE,
    {
      refetchQueries: ["GetMe"]
    }
  );
  const useUpdateMemberOfWorkspace = useCallback(
    async (
      teamId: string,
      userId: string,
      role: Role
    ): Promise<MutationReturn<Partial<Team>>> => {
      const { data, errors } = await updateMemberOfWorkspaceMutation({
        variables: { teamId, userId, role }
      });
      if (errors || !data?.updateMemberOfTeam) {
        console.log("GraphQL: Failed to update member in workspace", errors);
        setNotification({
          type: "error",
          text: t("Failed to update member in workspace.")
        });

        return { status: "error" };
      }

      setNotification({
        type: "success",
        text: t("Successfully updated member in workspace!")
      });
      return { data: data.updateMemberOfTeam.team, status: "success" };
    },
    [updateMemberOfWorkspaceMutation, setNotification, t]
  );

  return {
    useWorkspaceQuery,
    useWorkspacesQuery,
    useCreateWorkspace,
    useDeleteWorkspace,
    useUpdateWorkspace,
    useAddMemberToWorkspace,
    useRemoveMemberFromWorkspace,
    useUpdateMemberOfWorkspace
  };
};
