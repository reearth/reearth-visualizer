import { useQuery } from "@apollo/client";
import { GET_SCENE } from "@reearth/services/gql/queries/scene";
import { useLang } from "@reearth/services/i18n";
import { useMemo } from "react";

import type { SceneQueryProps } from "../scene";

import { getLayers } from "./utils";

// Note: Layers data comes from scene query
export const useNLSLayers = ({ sceneId }: SceneQueryProps) => {
  const lang = useLang();

  const { data, ...rest } = useQuery(GET_SCENE, {
    variables: { sceneId: sceneId ?? "", lang },
    skip: !sceneId
  });

  const nlsLayers = useMemo(() => getLayers(data), [data]);

  return { nlsLayers, ...rest };
};
