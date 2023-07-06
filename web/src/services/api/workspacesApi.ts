import { useGetMeQuery, useCreateWorkspaceMutation } from "@reearth/services/gql";
import { useT } from "@reearth/services/i18n";

import { CreateFuncReturn } from "./types";

export const useWorkspaceQuery = (workspaceId?: string) => {
  const { data, ...rest } = useGetMeQuery();

  const workspace = data?.me?.teams.find(t => t.id === workspaceId);

  return { workspace, ...rest };
};

export const useWorkspacesQuery = () => {
  const { data, ...rest } = useGetMeQuery();
  return { workspaces: data?.me?.teams, ...rest };
};

export const useCreateWorkspace = async (name: string): Promise<CreateFuncReturn> => {
  const [createWorkspaceMutation] = useCreateWorkspaceMutation({ refetchQueries: ["GetTeams"] });
  const t = useT();

  const results = await createWorkspaceMutation({
    variables: { name },
  });

  if (results.errors || !results.data?.createTeam) {
    console.log("GraphQL: Failed to create workspace");
    return { success: false, error: t("Failed to create workspace.") };
  }

  return { success: true };
};
