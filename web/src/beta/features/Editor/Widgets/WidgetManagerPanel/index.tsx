import { FC, useState } from "react";

import ListItem from "@reearth/beta/components/ListItem";
import PopoverMenuContent from "@reearth/beta/components/PopoverMenuContent";
import { Panel } from "@reearth/beta/ui/layout";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import { useWidgetsPage } from "../widgetsPageContext";

import ActionArea from "./Action";
import useHooks from "./hooks";

const WidgetManagerPanel: FC = () => {
  const { sceneId, selectedWidget, setSelectedWidget } = useWidgetsPage();

  const t = useT();

  const [openedActionId, setOpenedActionId] = useState<string | undefined>(undefined);

  const {
    installableWidgets,
    installedWidgets,
    handleWidgetAdd,
    handleWidgetRemove,
    handleWidgetSelection,
  } = useHooks({
    sceneId,
    selectedWidget,
    setSelectedWidget,
  });

  return (
    <Panel
      title={t("Widget Manager")}
      alwaysOpen
      extend
      storageId="editor-widgets-widget-manager-panel">
      <Wrapper>
        <ActionArea installableWidgets={installableWidgets} onWidgetAdd={handleWidgetAdd} />
        <InstalledWidgetsList>
          {installedWidgets?.map(w => (
            <ListItem
              key={w.id}
              isSelected={w.id === selectedWidget?.id}
              clamp="right"
              onItemClick={() => handleWidgetSelection(w.id)}
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
                        handleWidgetRemove(w.id);
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
    </Panel>
  );
};

export default WidgetManagerPanel;

const Wrapper = styled.div``;

const InstalledWidgetsList = styled.div`
  display: flex;
  flex-direction: column;
  padding-left: 4px;
`;
