import { toWidgetAlignSystemType } from "@reearth/app/utils/value";
import { useWidgetsFetcher } from "@reearth/services/api";
import { useCallback } from "react";

import { useWidgetsViewDevice } from "../../atoms";
import { SelectedWidget } from "../../hooks/useWidgets";

type Props = {
  sceneId?: string;
  selectWidget: (value: SelectedWidget | undefined) => void;
};

export default ({ sceneId, selectWidget }: Props) => {
  const {
    useInstallableWidgets,
    useInstalledWidgets,
    useAddWidget,
    useRemoveWidget
  } = useWidgetsFetcher();

  const [widgetsViewDevice] = useWidgetsViewDevice();

  const { installableWidgets } = useInstallableWidgets({
    sceneId,
    type: widgetsViewDevice
  });
  const { installedWidgets } = useInstalledWidgets({
    sceneId,
    type: widgetsViewDevice
  });

  const handleWidgetAdd = useCallback(
    async (id?: string) => {
      const type = toWidgetAlignSystemType(widgetsViewDevice);
      await useAddWidget(sceneId, id, type);
    },
    [sceneId, useAddWidget, widgetsViewDevice]
  );

  const handleWidgetRemove = useCallback(
    async (id?: string) => {
      const type = toWidgetAlignSystemType(widgetsViewDevice);
      await useRemoveWidget(sceneId, id, type);
    },
    [sceneId, useRemoveWidget, widgetsViewDevice]
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
