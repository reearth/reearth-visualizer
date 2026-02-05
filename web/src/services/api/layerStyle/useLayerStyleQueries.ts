import { useQuery } from "@apollo/client/react";
import { GET_SCENE } from "@reearth/services/gql/queries/scene";
import { useLang } from "@reearth/services/i18n/hooks";
import { useMemo } from "react";

import type { SceneQueryProps } from "../scene";

import { getLayerStyles } from "./utils";

// Note: Layer styles data comes from scene query
export const useLayerStyles = ({ sceneId }: SceneQueryProps) => {
  const lang = useLang();
  const { data, loading, networkStatus, fetchMore, ...rest } = useQuery(
    GET_SCENE,
    {
      variables: { sceneId: sceneId ?? "", lang },
      skip: !sceneId
    }
  );

  const isRefetching = useMemo(() => networkStatus === 3, [networkStatus]);
  const layerStyles = useMemo(() => getLayerStyles(data) ?? [], [data]);

  return { layerStyles, loading, isRefetching, fetchMore, ...rest };
};
