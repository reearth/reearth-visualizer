import { FC } from "react";

import PropertyItem from "@reearth/beta/components/fields/Property/PropertyItem";
import SidePanelSectionField from "@reearth/beta/components/SidePanelSectionField";
import { Panel } from "@reearth/beta/ui/layout";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import { useWidgetsPage } from "../context";

import useHooks from "./hooks";

const WidgetInspectorPanel: FC = () => {
  const t = useT();

  const { sceneId, selectedWidget, currentCamera, handleFlyTo } = useWidgetsPage();

  const { visibleItems } = useHooks({ sceneId, selectedWidget });

  return (
    <Panel title={t("Inspector")} extend alwaysOpen>
      {selectedWidget && (
        <Wrapper>
          {visibleItems?.map((i, idx) => (
            <SidePanelSectionField title={i.title ?? t("Settings")} key={idx}>
              <PropertyItem
                key={i.id}
                propertyId={selectedWidget.propertyId}
                item={i}
                currentCamera={currentCamera}
                onFlyTo={handleFlyTo}
              />
            </SidePanelSectionField>
          ))}
        </Wrapper>
      )}
    </Panel>
  );
};

export default WidgetInspectorPanel;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
