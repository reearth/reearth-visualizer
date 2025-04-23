import { Panel, PanelProps } from "@reearth/beta/ui/layout";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { FC } from "react";

import { useWidgetsPage } from "../context";

import ActionArea from "./Action";
import useHooks from "./hooks";
import ListItem from "./ListItem";

type Props = Pick<PanelProps, "showCollapseArea" | "areaRef">;

const WidgetManagerPanel: FC<Props> = ({ showCollapseArea, areaRef }) => {
  const { sceneId, selectedWidget, selectWidget } = useWidgetsPage();

  const t = useT();
  const {
    installableWidgets,
    installedWidgets,
    handleWidgetAdd,
    handleWidgetRemove,
    handleWidgetSelection
  } = useHooks({
    sceneId,
    selectWidget
  });

  return (
    <Panel
      title={t("Widget Manager")}
      alwaysOpen
      extend
      storageId="editor-widgets-widget-manager-panel"
      showCollapseArea={showCollapseArea}
      areaRef={areaRef}
      dataTestid="editor-widgets-widget-manager-panel"
    >
      <Wrapper>
        <ActionArea
          installableWidgets={installableWidgets}
          onWidgetAdd={handleWidgetAdd}
        />
        <InstalledWidgetsList>
          {installedWidgets?.map((w) => (
            <ListItem
              key={w.id}
              item={w}
              selected={w.id === selectedWidget?.id}
              onItemSelect={handleWidgetSelection}
              onItemDelete={handleWidgetRemove}
            />
          ))}
        </InstalledWidgetsList>
      </Wrapper>
      <EmptySpace onClick={() => selectWidget(undefined)} />
    </Panel>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.small
}));

const InstalledWidgetsList = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.smallest
}));

const EmptySpace = styled("div")(() => ({
  flex: 1,
  minHeight: 50
}));

export default WidgetManagerPanel;
