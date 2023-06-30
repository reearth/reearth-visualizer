import { useMemo } from "react";

import {
  useGetTeamsQuery as useGetWorkspacesQuery,
  useCreateTeamMutation as useCreateWorkspaceMutation,
} from "@reearth/services/gql";

type User = {
  name: string;
};

export const useWorkspacesFetcher = () => {
  const { data: workspaceData } = useGetWorkspacesQuery();

  const workspaces = useMemo(() => {
    return workspaceData?.me?.teams?.map(({ id, name }) => ({ id, name }));
  }, [workspaceData?.me?.teams]);

  const user: User = useMemo(() => {
    return {
      name: workspaceData?.me?.name || "",
    };
  }, [workspaceData?.me]);

  return { workspaces, workspaceData, user };
};

export const useCreateWorkspaceFetcher = async (name: string) => {
  const [createWorkspaceMutation] = useCreateWorkspaceMutation();

  const results = await createWorkspaceMutation({
    variables: { name },
    refetchQueries: ["GetTeams"],
  });

  if (results.data?.createTeam) {
    const workspace = results.data.createTeam.team;
    return workspace;
  }

  return null;
};
