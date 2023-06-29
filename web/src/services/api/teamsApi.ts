import { useMemo } from "react";

import { useGetTeamsQuery, useCreateTeamMutation } from "@reearth/services/gql";

type User = {
  name: string;
};

export function useTeamsFetcher() {
  const { data: workspaceData } = useGetTeamsQuery();

  const workspaces = useMemo(() => {
    return workspaceData?.me?.teams?.map(({ id, name }) => ({ id, name }));
  }, [workspaceData?.me?.teams]);

  const user: User = useMemo(() => {
    return {
      name: workspaceData?.me?.name || "",
    };
  }, [workspaceData?.me]);

  return { workspaces, workspaceData, user };
}

export function useCreateTeamFetcher() {
  const [createTeamMutation] = useCreateTeamMutation();

  async function GetTeamsFetcher(data: { name: string }) {
    const results = await createTeamMutation({
      variables: { name: data.name },
      refetchQueries: ["GetTeams"],
    });
    if (results.data?.createTeam) {
      const team = results.data.createTeam.team;
      return team;
    }
    return null;
  }

  return { GetTeamsFetcher };
}
