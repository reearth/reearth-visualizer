import { useWidgetsFetcher } from "@reearth/services/api";
import { useCallback } from "react";

import { SelectedWidget } from "../../hooks/useWidgets";

type Props = {
  sceneId?: string;
  selectWidget: (value: SelectedWidget | undefined) => void;
};

export default ({ sceneId, selectWidget }: Props) => {
  const {
    useInstallableWidgetsQuery,
    useInstalledWidgetsQuery,
    useAddWidget,
    useRemoveWidget
    // useUpdateWidgetAlignSystem,
  } = useWidgetsFetcher();

  const { installableWidgets } = useInstallableWidgetsQuery({ sceneId });
  const { installedWidgets } = useInstalledWidgetsQuery({ sceneId });

  const handleWidgetAdd = useCallback(
    async (id?: string) => {
      await useAddWidget(sceneId, id);
    },
    [sceneId, useAddWidget]
  );

  const handleWidgetRemove = useCallback(
    async (id?: string) => {
      await useRemoveWidget(sceneId, id);
    },
    [sceneId, useRemoveWidget]
  );

  const handleWidgetSelection = (id: string) => {
    const w = installedWidgets?.find((w) => w.id === id);
    if (!w) return;
    selectWidget({
      id: w.id,
      pluginId: w.pluginId,
      extensionId: w.extensionId,
      propertyId: w.property.id
    });
  };

  return {
    installableWidgets,
    installedWidgets,
    handleWidgetAdd,
    handleWidgetSelection,
    handleWidgetRemove
  };
};
