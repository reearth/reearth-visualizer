import { toWidgetAlignSystemType } from "@reearth/app/utils/value";
import {
  useInstallableWidgets,
  useInstalledWidgets,
  useWidgetMutations
} from "@reearth/services/api/widget";
import { useCallback } from "react";

import { useWidgetsViewDevice } from "../../atoms";
import { SelectedWidget } from "../../hooks/useWidgets";

type Props = {
  sceneId?: string;
  selectWidget: (value: SelectedWidget | undefined) => void;
};

export default ({ sceneId, selectWidget }: Props) => {
  const { addWidget, removeWidget } = useWidgetMutations();
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
      await addWidget(sceneId, id, type);
    },
    [sceneId, addWidget, widgetsViewDevice]
  );

  const handleWidgetRemove = useCallback(
    async (id?: string) => {
      const type = toWidgetAlignSystemType(widgetsViewDevice);
      await removeWidget(sceneId, id, type);
    },
    [sceneId, removeWidget, widgetsViewDevice]
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
