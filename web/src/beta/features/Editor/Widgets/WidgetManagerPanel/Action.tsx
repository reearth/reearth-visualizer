import { FC, useCallback, useMemo, useState } from "react";

import { Button, IconName, PopupMenu, PopupMenuItem } from "@reearth/beta/lib/reearth-ui";
import { InstallableWidget } from "@reearth/services/api/widgetsApi/utils";
import { styled } from "@reearth/services/theme";

type ActionAreaProps = {
  installableWidgets?: InstallableWidget[];
  onWidgetAdd: (id?: string | undefined) => Promise<void>;
};

const ActionArea: FC<ActionAreaProps> = ({ installableWidgets, onWidgetAdd }) => {
  const [open, setOpen] = useState(false);

  const handleWidgetAdd = useCallback(
    (widgetId: string) => {
      onWidgetAdd(widgetId);
      setOpen(false);
    },
    [onWidgetAdd],
  );

  const items: PopupMenuItem[] = useMemo(
    () =>
      (installableWidgets ?? [])
        .filter(w => !w.disabled)
        .map(w => ({
          id: `${w.pluginId}/${w.extensionId}`,
          title: w.title,
          icon: w.icon as IconName,
          onClick: () => handleWidgetAdd(`${w.pluginId}/${w.extensionId}`),
        })),
    [installableWidgets, handleWidgetAdd],
  );

  return (
    <PopupMenu
      label={
        <ButtonWrapper>
          <Button
            icon="folderSimplePlus"
            title="Add Widget"
            size="small"
            extendWidth
            onClick={() => setOpen(!open)}
          />
        </ButtonWrapper>
      }
      menu={items}
    />
  );
};

const ButtonWrapper = styled("div")(() => ({
  width: "100%",
}));

export default ActionArea;
