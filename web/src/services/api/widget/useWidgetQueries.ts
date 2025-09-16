import { useQuery } from "@apollo/client";
import { DeviceType } from "@reearth/app/utils/device";
import { GET_SCENE } from "@reearth/services/gql/queries/scene";
import { useLang } from "@reearth/services/i18n";
import { useMemo } from "react";

import { getInstallableWidgets, getInstalledWidgets } from "./utils";

export const useInstallableWidgets = ({
  sceneId,
  type
}: {
  sceneId?: string;
  type: DeviceType;
}) => {
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

export const useInstalledWidgets = ({
  sceneId,
  type
}: {
  sceneId?: string;
  type: DeviceType;
}) => {
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
