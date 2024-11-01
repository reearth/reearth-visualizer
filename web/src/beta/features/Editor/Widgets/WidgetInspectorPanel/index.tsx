import { Collapse } from "@reearth/beta/lib/reearth-ui";
import PropertyItem from "@reearth/beta/ui/fields/Properties";
import { Panel } from "@reearth/beta/ui/layout";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { FC } from "react";

import { useWidgetsPage } from "../context";

import useHooks from "./hooks";

const WidgetInspectorPanel: FC = () => {
  const t = useT();

  const { sceneId, selectedWidget, handleFlyTo } = useWidgetsPage();

  const { visibleItems } = useHooks({ sceneId, selectedWidget });

  return (
    <Panel title={t("Inspector")} extend alwaysOpen>
      {selectedWidget && (
        <Wrapper>
          {visibleItems?.map((i, idx) => (
            <Collapse title={i.title ?? t("Settings")} key={idx}>
              <PropertyItem
                key={i.id}
                propertyId={selectedWidget.propertyId}
                item={i}
                onFlyTo={handleFlyTo}
              />
            </Collapse>
          ))}
        </Wrapper>
      )}
    </Panel>
  );
};

export default WidgetInspectorPanel;

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.small
}));
