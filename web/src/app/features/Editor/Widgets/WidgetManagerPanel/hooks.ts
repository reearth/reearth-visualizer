import {
  useInstallableWidgets,
  useInstalledWidgets,
  useWidgetMutations
} from "@reearth/services/api/widget";
import { useCallback } from "react";

import { SelectedWidget } from "../../hooks/useWidgets";

type Props = {
  sceneId?: string;
  selectWidget: (value: SelectedWidget | undefined) => void;
};

export default ({ sceneId, selectWidget }: Props) => {
  const { addWidget, removeWidget } = useWidgetMutations();

  const { installableWidgets } = useInstallableWidgets({ sceneId });
  const { installedWidgets } = useInstalledWidgets({ sceneId });

  const handleWidgetAdd = useCallback(
    async (id?: string) => {
      await addWidget(sceneId, id);
    },
    [sceneId, addWidget]
  );

  const handleWidgetRemove = useCallback(
    async (id?: string) => {
      await removeWidget(sceneId, id);
    },
    [sceneId, removeWidget]
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
