import { useMutation, useQuery } from "@apollo/client";
import { useCallback } from "react";

import { CreateTeamPayload } from "@reearth/services/gql/__gen__/graphql";
import { GET_ME } from "@reearth/services/gql/queries/user";
import { CREATE_WORKSPACE } from "@reearth/services/gql/queries/workspace";
import { useT } from "@reearth/services/i18n";

import { useNotification } from "../state";

import { MutationReturn } from "./types";

export type Team = CreateTeamPayload["team"];

export default () => {
  const t = useT();
  const [, setNotification] = useNotification();

  const useWorkspaceQuery = useCallback((workspaceId?: string) => {
    const { data, ...rest } = useQuery(GET_ME);
    const workspace = data?.me?.teams.find(t => t.id === workspaceId);

    return { workspace, ...rest };
  }, []);

  const useWorkspacesQuery = useCallback(() => {
    const { data, ...rest } = useQuery(GET_ME);

    return { workspaces: data?.me?.teams, ...rest };
  }, []);

  const [createWorkspaceMutation] = useMutation(CREATE_WORKSPACE, {
    refetchQueries: ["GetMe"],
  });

  const useCreateWorkspace = useCallback(
    async (name: string): Promise<MutationReturn<Partial<Team>>> => {
      const { data, errors } = await createWorkspaceMutation({ variables: { name } });
      if (errors || !data?.createTeam) {
        console.log("GraphQL: Failed to create workspace", errors);
        setNotification({ type: "error", text: t("Failed to create workspace.") });

        return { status: "error" };
      }

      setNotification({ type: "success", text: t("Successfully created workspace!") });
      return { data: data.createTeam.team, status: "success" };
    },
    [createWorkspaceMutation, setNotification, t],
  );

  return {
    useWorkspaceQuery,
    useWorkspacesQuery,
    useCreateWorkspace,
  };
};
