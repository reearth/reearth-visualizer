import { useMemo } from "react";

import { useGetProjectBySceneQuery } from "@reearth/services/gql";

export function useProjectFetcher(sceneId: string) {
  const { data } = useGetProjectBySceneQuery({
    variables: { sceneId: sceneId ?? "" },
    skip: !sceneId,
  });

  const workspaceId = useMemo(() => {
    return data?.node?.__typename === "Scene" ? data.node.teamId : undefined;
  }, [data?.node]);

  const project = useMemo(
    () =>
      data?.node?.__typename === "Scene" && data.node.project
        ? { ...data.node.project, sceneId: data.node.id }
        : undefined,
    [data?.node],
  );

  return { workspaceId, project };
}
