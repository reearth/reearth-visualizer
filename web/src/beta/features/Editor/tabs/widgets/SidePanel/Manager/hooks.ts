import { useCallback } from "react";

import { useWidgetsFetcher } from "@reearth/services/api";

export default ({ sceneId }: { sceneId?: string }) => {
  const { useInstallableWidgetsQuery, useInstalledWidgetsQuery, useAddWidget } =
    useWidgetsFetcher();
  const { installableWidgets } = useInstallableWidgetsQuery({ sceneId });
  const { installedWidgets } = useInstalledWidgetsQuery({ sceneId });

  const handleWidgetAdd = useCallback(
    async (id?: string) => {
      await useAddWidget(sceneId, id);
    },
    [sceneId, useAddWidget],
  );
  return {
    installedWidgets,
    installableWidgets,
    handleWidgetAdd,
  };
};
