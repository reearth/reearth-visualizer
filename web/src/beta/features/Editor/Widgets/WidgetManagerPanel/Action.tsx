import {
  Button,
  IconName,
  PopupMenu,
  PopupMenuItem
} from "@reearth/beta/lib/reearth-ui";
import { InstallableWidget } from "@reearth/services/api/widgetsApi/utils";
import { useT } from "@reearth/services/i18n";
import { FC, useCallback, useMemo, useState } from "react";

type ActionAreaProps = {
  installableWidgets?: InstallableWidget[];
  onWidgetAdd: (id?: string | undefined) => Promise<void>;
};

const ActionArea: FC<ActionAreaProps> = ({
  installableWidgets,
  onWidgetAdd
}) => {
  const [open, setOpen] = useState(false);

  const handleWidgetAdd = useCallback(
    (widgetId: string) => {
      onWidgetAdd(widgetId);
      setOpen(false);
    },
    [onWidgetAdd]
  );

  const items: PopupMenuItem[] = useMemo(
    () =>
      (installableWidgets ?? [])
        .filter((w) => !w.disabled)
        .map((w) => ({
          id: `${w.pluginId}/${w.extensionId}`,
          title: w.title,
          icon: w.icon as IconName,
          onClick: () => handleWidgetAdd(`${w.pluginId}/${w.extensionId}`)
        })),
    [installableWidgets, handleWidgetAdd]
  );

  const t = useT();

  return (
    <PopupMenu
      label={
        <Button
          icon="folderSimplePlus"
          title={t("Add Widget")}
          size="small"
          extendWidth
          onClick={() => setOpen(!open)}
          data-testid="add-widget-button"
        />
      }
      menu={items}
      extendTriggerWidth
      extendContentWidth
      data-testid="add-widget-popup-menu"
    />
  );
};

export default ActionArea;
