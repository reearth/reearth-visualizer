import { FC, useEffect } from "react";

import Text from "@reearth/beta/components/Text";
import Toggle from "@reearth/beta/components/Toggle";
import { Panel } from "@reearth/beta/ui/layout";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import { useWidgetsPage } from "../context";

import Devices from "./Devices";

const WASToolsPanel: FC = () => {
  const {
    showWidgetEditor,
    selectedDevice = "desktop",
    onShowWidgetEditor,
    onDeviceChange,
    setSelectedWidgetArea,
  } = useWidgetsPage();

  const t = useT();

  useEffect(() => {
    if (!showWidgetEditor) {
      setSelectedWidgetArea(undefined);
    }
  }, [showWidgetEditor, setSelectedWidgetArea]);

  return (
    <Panel extend>
      <StyledSecondaryNav>
        <Devices selectedDevice={selectedDevice} onDeviceChange={onDeviceChange} />
        <AlignSystem>
          <Text size="body">{t("Align System")}</Text>
          <Toggle checked={!!showWidgetEditor} onChange={onShowWidgetEditor} />
        </AlignSystem>
      </StyledSecondaryNav>
    </Panel>
  );
};

export default WASToolsPanel;

const StyledSecondaryNav = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  width: "100%",
  flex: 1,
  padding: theme.spacing.small,
}));

const AlignSystem = styled.div`
  display: flex;
  gap: 10px;
`;
