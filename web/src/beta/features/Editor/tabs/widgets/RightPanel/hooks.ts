import { SetStateAction, useCallback, useMemo } from "react";

import { SelectedWidget } from "@reearth/beta/features/Editor/hooks";
import { useWidgetsFetcher } from "@reearth/services/api";
import { type WidgetAreaState } from "@reearth/services/state";

export default ({
  sceneId,
  selectedWidget,
  selectedWidgetArea,
  setSelectedWidget,
  setSelectedWidgetArea,
}: {
  sceneId?: string;
  selectedWidget: SelectedWidget | undefined;
  selectedWidgetArea: WidgetAreaState | undefined;
  setSelectedWidget: (value: SelectedWidget | undefined) => void;
  setSelectedWidgetArea: (update?: SetStateAction<WidgetAreaState | undefined>) => void;
}) => {
  const {
    useInstallableWidgetsQuery,
    useInstalledWidgetsQuery,
    useAddWidget,
    useRemoveWidget,
    useUpdateWidgetAlignSystem,
  } = useWidgetsFetcher();
  const { installableWidgets } = useInstallableWidgetsQuery({ sceneId });
  const { installedWidgets } = useInstalledWidgetsQuery({ sceneId });

  const propertyItems = useMemo(
    () => installedWidgets?.find(w => w.id === selectedWidget?.id)?.property.items,
    [installedWidgets, selectedWidget],
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

  const handleWidgetAreaStateChange = useCallback(
    async (widgetAreaState?: WidgetAreaState) => {
      if (!sceneId || !widgetAreaState) return;
      const results = await useUpdateWidgetAlignSystem(widgetAreaState, sceneId);
      if (results.status === "success") {
        setSelectedWidgetArea(widgetAreaState);
      }
    },
    [sceneId, useUpdateWidgetAlignSystem, setSelectedWidgetArea],
  );

  return {
    selectedWidget,
    selectedWidgetArea,
    propertyItems,
    installedWidgets,
    installableWidgets,
    handleWidgetAdd,
    handleWidgetRemove,
    handleWidgetSelection,
    handleWidgetAreaStateChange,
  };
};
