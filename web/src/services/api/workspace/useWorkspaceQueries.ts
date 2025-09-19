import { useQuery } from "@apollo/client";
import { GET_ME } from "@reearth/services/gql/queries/user";
import { WORKSPACE_POLICY_CHECK } from "@reearth/services/gql/queries/workspace";

export const useWorkspace = (workspaceId?: string) => {
  const { data, ...rest } = useQuery(GET_ME);
  const workspace = data?.me?.workspaces.find((w) => w.id === workspaceId);

  return { workspace, ...rest };
};

export const useWorkspaces = () => {
  const { data, ...rest } = useQuery(GET_ME);

  return { workspaces: data?.me?.workspaces, data, ...rest };
};

export const useWorkspacePolicyCheck = (workspaceId: string) => {
  const { data } = useQuery(WORKSPACE_POLICY_CHECK, {
    variables: { workspaceId },
    skip: !workspaceId
  });

  return data;
};
