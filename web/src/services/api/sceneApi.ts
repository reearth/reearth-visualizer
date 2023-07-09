import { useQuery } from "@apollo/client";
import { useCallback } from "react";

import { GET_SCENE } from "@reearth/services/gql/queries/scene";

export default () => {
  const useSceneQuery = useCallback((sceneId?: string) => {
    const { data, ...rest } = useQuery(GET_SCENE, {
      variables: { sceneId: sceneId ?? "" },
      skip: !sceneId,
    });

    const scene = data?.node?.__typename === "Scene" ? data.node : undefined;

    return { scene, ...rest };
  }, []);

  return {
    useSceneQuery,
  };
};
