import { useMutation, useQuery } from "@apollo/client";
import {
  AddMemberToWorkspaceMutationVariables,
  CreateWorkspacePayload,
  CreateWorkspaceMutationVariables,
  DeleteWorkspaceMutationVariables,
  RemoveMemberFromWorkspaceMutationVariables,
  UpdateMemberOfWorkspaceMutationVariables,
  UpdateWorkspaceMutationVariables
} from "@reearth/services/gql/__gen__/graphql";
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

export type Workspace = CreateWorkspacePayload["workspace"];

export default () => {
  const t = useT();
  const [, setNotification] = useNotification();

  const useWorkspaceQuery = useCallback((workspaceId?: string) => {
    const { data, ...rest } = useQuery(GET_ME);
    const workspace = data?.me?.workspaces.find((t) => t.id === workspaceId);

    return { workspace, ...rest };
  }, []);

  const useWorkspacesQuery = useCallback(() => {
    const { data, ...rest } = useQuery(GET_ME);

    return { workspaces: data?.me?.workspaces, ...rest };
  }, []);

  const [createWorkspaceMutation] = useMutation(CREATE_WORKSPACE, {
    refetchQueries: ["GetMe"]
  });
  const useCreateWorkspace = useCallback(
    async (
      props: CreateWorkspaceMutationVariables
    ): Promise<MutationReturn<Partial<Workspace>>> => {
      const { data, errors } = await createWorkspaceMutation({
        variables: props
      });
      if (errors || !data?.createWorkspace) {
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
      return { data: data.createWorkspace.workspace, status: "success" };
    },
    [createWorkspaceMutation, setNotification, t]
  );

  const [deleteWorkspaceMutation] = useMutation(DELETE_WORKSPACE, {
    refetchQueries: ["GetMe"]
  });
  const useDeleteWorkspace = useCallback(
    async (
      props: DeleteWorkspaceMutationVariables
    ): Promise<MutationReturn<null>> => {
      const { data, errors } = await deleteWorkspaceMutation({
        variables: props
      });
      if (errors || !data?.deleteWorkspace) {
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
      props: UpdateWorkspaceMutationVariables
    ): Promise<MutationReturn<Partial<Workspace>>> => {
      const { data, errors } = await updateWorkspaceMutation({
        variables: props
      });
      if (errors || !data?.updateWorkspace) {
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
      return { data: data.updateWorkspace.workspace, status: "success" };
    },
    [updateWorkspaceMutation, setNotification, t]
  );

  const [addMemberToWorkspaceMutation] = useMutation(ADD_MEMBER_TO_WORKSPACE, {
    refetchQueries: ["GetMe"]
  });
  const useAddMemberToWorkspace = useCallback(
    async (
      props: AddMemberToWorkspaceMutationVariables
    ): Promise<MutationReturn<Partial<Workspace>>> => {
      const { data, errors } = await addMemberToWorkspaceMutation({
        variables: props
      });
      if (errors || !data?.addMemberToWorkspace) {
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
      return { data: data.addMemberToWorkspace.workspace, status: "success" };
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
      props: RemoveMemberFromWorkspaceMutationVariables
    ): Promise<MutationReturn<Partial<Workspace>>> => {
      const { data, errors } = await removeMemberFromWorkspaceMutation({
        variables: props
      });
      if (errors || !data?.removeMemberFromWorkspace) {
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
      return {
        data: data.removeMemberFromWorkspace.workspace,
        status: "success"
      };
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
      props: UpdateMemberOfWorkspaceMutationVariables
    ): Promise<MutationReturn<Partial<Workspace>>> => {
      const { data, errors } = await updateMemberOfWorkspaceMutation({
        variables: props
      });
      if (errors || !data?.updateMemberOfWorkspace) {
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
      return {
        data: data.updateMemberOfWorkspace.workspace,
        status: "success"
      };
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
