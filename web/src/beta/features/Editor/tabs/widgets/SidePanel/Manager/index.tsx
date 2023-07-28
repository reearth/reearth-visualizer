import { useCallback, useMemo, useState } from "react";

import Icon, { type Icons } from "@reearth/beta/components/Icon";
import ListItem from "@reearth/beta/components/ListItem";
import * as Popover from "@reearth/beta/components/Popover";
import PopoverMenuContent from "@reearth/beta/components/PopoverMenuContent";
import {
  type InstallableWidget,
  type InstalledWidget,
} from "@reearth/services/api/widgetsApi/utils";
import { type SelectedWidget } from "@reearth/services/state";
import { styled } from "@reearth/services/theme";

type Props = {
  selectedWidget?: SelectedWidget;
  installedWidgets?: InstalledWidget[];
  onWidgetSelection: (id: string) => void;
};

type ActionAreaProps = {
  installableWidgets?: InstallableWidget[];
  onWidgetAdd: (id?: string | undefined) => Promise<void>;
};

export const ActionArea: React.FC<ActionAreaProps> = ({ installableWidgets, onWidgetAdd }) => {
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
      <Popover.Provider open={popoverOpen} onOpenChange={() => setPopover(!popoverOpen)}>
        <Popover.Trigger>
          <StyledIcon icon="folderPlus" size={16} onClick={() => setPopover(!popoverOpen)} />
        </Popover.Trigger>
        <Popover.Content>{items && <PopoverMenuContent size="sm" items={items} />}</Popover.Content>
      </Popover.Provider>
    </ActionAreaWrapper>
  );
};

const Manager: React.FC<Props> = ({ selectedWidget, installedWidgets, onWidgetSelection }) => {
  return (
    <Wrapper>
      <InstalledWidgetsList>
        {installedWidgets?.map(w => (
          <ListItem
            key={w.id}
            isSelected={w.id === selectedWidget?.id}
            onItemClick={() => onWidgetSelection(w.id)}
            onActionClick={() => console.log("ACTIONS")}>
            {w.title}
          </ListItem>
        ))}
      </InstalledWidgetsList>
    </Wrapper>
  );
};

export default Manager;

const Wrapper = styled.div``;

const InstalledWidgetsList = styled.div`
  display: flex;
  flex-direction: column;
`;

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
