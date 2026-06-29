import { toWidgetAlignSystemType } from "@reearth/app/utils/value";
import {
  GOOGLE_MAP_SEARCH_BUILTIN_WIDGET_ID,
  STREET_VIEW_WIDGET_ID,
  useInstallableWidgets,
  useInstalledWidgets,
  useWidgetMutations
} from "@reearth/services/api/widget";
import { useCallback } from "react";

import { useWidgetsViewDevice } from "../../atoms";
import { SelectedWidget } from "../../hooks/useWidgets";

import { useSystemTile } from "./useSystemTile";

type Props = {
  sceneId?: string;
  selectWidget: (value: SelectedWidget | undefined) => void;
};

const GS_SV_WIDGET_IDS = [
  GOOGLE_MAP_SEARCH_BUILTIN_WIDGET_ID,
  STREET_VIEW_WIDGET_ID
];

const getWidgetExtensionId = (widget?: {
  pluginId?: string;
  extensionId?: string;
}) => (widget ? `${widget.pluginId}/${widget.extensionId}` : undefined);

const isGSSVWidgetId = (id?: string) => !!id && GS_SV_WIDGET_IDS.includes(id);

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

  const { getSystemTileItemId, addSystemTile, removeSystemTile } =
    useSystemTile(sceneId);

  const hasInstalledGSSVWidget = useCallback(
    (excludeWidgetId?: string) =>
      installedWidgets?.some((widget) => {
        if (widget.id === excludeWidgetId) return false;
        return isGSSVWidgetId(getWidgetExtensionId(widget));
      }) ?? false,
    [installedWidgets]
  );

  const handleWidgetAdd = useCallback(
    async (id?: string) => {
      if (!sceneId || !id) return;

      const shouldEnsureSystemTile =
        isGSSVWidgetId(id) && !hasInstalledGSSVWidget();

      await addWidget(sceneId, id, toWidgetAlignSystemType(widgetsViewDevice));

      if (shouldEnsureSystemTile && !getSystemTileItemId()) {
        await addSystemTile();
      }
    },
    [
      sceneId,
      addWidget,
      widgetsViewDevice,
      hasInstalledGSSVWidget,
      getSystemTileItemId,
      addSystemTile
    ]
  );

  const handleWidgetRemove = useCallback(
    async (id?: string) => {
      if (!sceneId || !id) return;

      const widgetToRemove = installedWidgets?.find(
        (widget) => widget.id === id
      );
      const isRemovingGSSVWidget = isGSSVWidgetId(
        getWidgetExtensionId(widgetToRemove)
      );

      const shouldRemoveSystemTile =
        isRemovingGSSVWidget && !hasInstalledGSSVWidget(id);

      await removeWidget(
        sceneId,
        id,
        toWidgetAlignSystemType(widgetsViewDevice)
      );

      if (shouldRemoveSystemTile) {
        await removeSystemTile();
      }
    },
    [
      sceneId,
      removeWidget,
      widgetsViewDevice,
      installedWidgets,
      hasInstalledGSSVWidget,
      removeSystemTile
    ]
  );

  const handleWidgetSelection = useCallback(
    (id: string) => {
      const widget = installedWidgets?.find((widget) => widget.id === id);
      if (!widget) return;

      selectWidget({
        id: widget.id,
        pluginId: widget.pluginId,
        extensionId: widget.extensionId,
        propertyId: widget.property.id
      });
    },
    [installedWidgets, selectWidget]
  );

  return {
    installableWidgets,
    installedWidgets,
    handleWidgetAdd,
    handleWidgetSelection,
    handleWidgetRemove
  };
};
