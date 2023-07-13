import { useQuery } from "@apollo/client";
import { useCallback } from "react";

import { GET_SCENE } from "@reearth/services/gql/queries/scene";

export default () => {
  const usePluginsQuery = useCallback((sceneId?: string, lang?: string) => {
    const { data, ...rest } = useQuery(GET_SCENE, {
      variables: { sceneId: sceneId ?? "", lang },
      skip: !sceneId,
    });

    const plugins = data?.node?.__typename === "Scene" ? data.node.plugins : undefined;

    return { plugins, ...rest };
  }, []);

  return {
    usePluginsQuery,
  };
};
