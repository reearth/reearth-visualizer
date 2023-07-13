import { useQuery } from "@apollo/client";
import { useCallback } from "react";

import { GET_SCENE } from "@reearth/services/gql/queries/scene";

export default () => {
  const useWidgetsQuery = useCallback((sceneId?: string, lang?: string) => {
    const { data, ...rest } = useQuery(GET_SCENE, {
      variables: { sceneId: sceneId ?? "", lang },
      skip: !sceneId,
    });

    const widgets = data?.node?.__typename === "Scene" ? data.node.widgets : undefined;

    return { widgets, ...rest };
  }, []);

  return {
    useWidgetsQuery,
  };
};
