import { useGetSceneQuery } from "@reearth/services/gql";

export const useSceneQuery = (sceneId?: string) => {
  const { data, ...rest } = useGetSceneQuery({
    variables: { sceneId: sceneId ?? "" },
    skip: !sceneId,
  });

  const scene = data?.node?.__typename === "Scene" ? data.node : undefined;

  return { scene, ...rest };
};
