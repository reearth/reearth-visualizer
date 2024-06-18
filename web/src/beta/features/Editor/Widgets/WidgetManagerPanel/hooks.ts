import { useCallback } from "react";

import { useWidgetsFetcher } from "@reearth/services/api";

import { SelectedWidget } from "../../hooks/useWidgets";

type Props = {
  sceneId?: string;
  selectedWidget: SelectedWidget | undefined;
  setSelectedWidget: (value: SelectedWidget | undefined) => void;
};

export default ({ sceneId, selectedWidget, setSelectedWidget }: Props) => {
  const {
    useInstallableWidgetsQuery,
    useInstalledWidgetsQuery,
    useAddWidget,
    useRemoveWidget,
    // useUpdateWidgetAlignSystem,
  } = useWidgetsFetcher();

  const { installableWidgets } = useInstallableWidgetsQuery({ sceneId });
  const { installedWidgets } = useInstalledWidgetsQuery({ sceneId });

  const handleWidgetAdd = useCallback(
    async (id?: string) => {
      await useAddWidget(sceneId, id);
    },
    [sceneId, useAddWidget],
  );

  const handleWidgetRemove = useCallback(
    async (id?: string) => {
      await useRemoveWidget(sceneId, id);
    },
    [sceneId, useRemoveWidget],
  );

  const handleWidgetSelection = (id: string) => {
    const w = installedWidgets?.find(w => w.id === id);
    if (!w) return;

    if (w.id === selectedWidget?.id) {
      setSelectedWidget(undefined);
    } else {
      setSelectedWidget({
        id: w.id,
        pluginId: w.pluginId,
        extensionId: w.extensionId,
        propertyId: w.property.id,
      });
    }
  };

  return {
    installableWidgets,
    installedWidgets,
    handleWidgetAdd,
    handleWidgetSelection,
    handleWidgetRemove,
  };
};
