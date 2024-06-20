import { useCallback, useMemo, useState } from "react";

import Icon, { type Icons } from "@reearth/beta/components/Icon";
import * as Popover from "@reearth/beta/components/Popover";
import PopoverMenuContent from "@reearth/beta/components/PopoverMenuContent";
import { type InstallableWidget } from "@reearth/services/api/widgetsApi/utils";
import { styled } from "@reearth/services/theme";

type ActionAreaProps = {
  installableWidgets?: InstallableWidget[];
  onWidgetAdd: (id?: string | undefined) => Promise<void>;
};

const ActionArea: React.FC<ActionAreaProps> = ({ installableWidgets, onWidgetAdd }) => {
  const [popoverOpen, setPopover] = useState(false);

  const handleWidgetAdd = useCallback(
    (widgetId: string) => {
      onWidgetAdd(widgetId);
      setPopover(!popoverOpen);
    },
    [popoverOpen, onWidgetAdd],
  );

  const items = useMemo(
    () =>
      installableWidgets
        ?.filter(w => !w.disabled)
        .map(w => {
          return {
            name: w.title,
            icon: w.icon as Icons,
            onClick: () => handleWidgetAdd(`${w.pluginId}/${w.extensionId}`),
          };
        }),
    [installableWidgets, handleWidgetAdd],
  );

  return (
    <ActionAreaWrapper>
      <Popover.Provider
        open={popoverOpen}
        placement="bottom-start"
        onOpenChange={() => setPopover(!popoverOpen)}>
        <Popover.Trigger>
          <StyledIcon icon="folderPlus" size={16} onClick={() => setPopover(!popoverOpen)} />
        </Popover.Trigger>
        <Popover.Content>{items && <PopoverMenuContent size="sm" items={items} />}</Popover.Content>
      </Popover.Provider>
    </ActionAreaWrapper>
  );
};

export default ActionArea;

const ActionAreaWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const StyledIcon = styled(Icon)`
  cursor: pointer;
  align-self: center;
  height: 100%;
  color: ${({ theme }) => theme.content.main};
`;
