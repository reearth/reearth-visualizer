import { useQuery } from "@apollo/client";
import { GET_SCENE } from "@reearth/services/gql/queries/scene";
import { useLang } from "@reearth/services/i18n";
import { useMemo } from "react";

import type { SceneQueryProps } from "../scene";

import { getInstallableWidgets, getInstalledWidgets } from "./utils";

export const useInstallableWidgets = ({ sceneId }: SceneQueryProps) => {
  const lang = useLang();

  const { data, ...rest } = useQuery(GET_SCENE, {
    variables: { sceneId: sceneId ?? "", lang },
    skip: !sceneId
  });

  const installableWidgets = useMemo(() => getInstallableWidgets(data), [data]);

  return { installableWidgets, ...rest };
};

export const useInstalledWidgets = ({ sceneId }: SceneQueryProps) => {
  const lang = useLang();

  const { data, ...rest } = useQuery(GET_SCENE, {
    variables: { sceneId: sceneId ?? "", lang },
    skip: !sceneId
  });

  const installedWidgets = useMemo(() => getInstalledWidgets(data), [data]);

  return { installedWidgets, ...rest };
};
