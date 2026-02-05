import { useQuery } from "@apollo/client/react";
import { GET_SCENE } from "@reearth/services/gql/queries/scene";
import { useLang } from "@reearth/services/i18n/hooks";
import { useMemo } from "react";

import type { WidgetQueryProps } from "./types";
import { getInstallableWidgets, getInstalledWidgets } from "./utils";

export const useInstallableWidgets = ({ sceneId, type }: WidgetQueryProps) => {
  const lang = useLang();

  const { data, ...rest } = useQuery(GET_SCENE, {
    variables: { sceneId: sceneId ?? "", lang },
    skip: !sceneId
  });

  const installableWidgets = useMemo(
    () => getInstallableWidgets(data, type),
    [data, type]
  );

  return { installableWidgets, ...rest };
};

export const useInstalledWidgets = ({ sceneId, type }: WidgetQueryProps) => {
  const lang = useLang();

  const { data, ...rest } = useQuery(GET_SCENE, {
    variables: { sceneId: sceneId ?? "", lang },
    skip: !sceneId
  });

  const installedWidgets = useMemo(
    () => getInstalledWidgets(data, type),
    [data, type]
  );

  return { installedWidgets, ...rest };
};
