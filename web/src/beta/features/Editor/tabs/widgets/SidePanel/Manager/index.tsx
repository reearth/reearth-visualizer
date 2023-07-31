import { useState } from "react";

import ListItem from "@reearth/beta/components/ListItem";
import PopoverMenuContent from "@reearth/beta/components/PopoverMenuContent";
import { type InstalledWidget } from "@reearth/services/api/widgetsApi/utils";
import { type SelectedWidget } from "@reearth/services/state";
import { styled } from "@reearth/services/theme";

export { default as ActionArea } from "./Action";

type Props = {
  selectedWidget?: SelectedWidget;
  installedWidgets?: InstalledWidget[];
  onWidgetSelection: (id: string) => void;
  onWidgetRemove: (id?: string | undefined) => Promise<void>;
};

const Manager: React.FC<Props> = ({
  selectedWidget,
  installedWidgets,
  onWidgetSelection,
  onWidgetRemove,
}) => {
  const [openedActionId, setOpenedActionId] = useState<string | undefined>(undefined);

  return (
    <Wrapper>
      <InstalledWidgetsList>
        {installedWidgets?.map(w => (
          <ListItem
            key={w.id}
            isSelected={w.id === selectedWidget?.id}
            clamp="right"
            onItemClick={() => onWidgetSelection(w.id)}
            onActionClick={() => setOpenedActionId(old => (old ? undefined : w.id))}
            onOpenChange={isOpen => {
              setOpenedActionId(isOpen ? w.id : undefined);
            }}
            isOpenAction={openedActionId === w.id}
            actionPlacement="left"
            actionContent={
              <PopoverMenuContent
                size="md"
                items={[
                  {
                    icon: "trash",
                    name: "Delete",
                    onClick: () => {
                      onWidgetRemove(w.id);
                      setOpenedActionId(undefined);
                    },
                  },
                ]}
              />
            }>
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
  padding-left: 4px;
`;
