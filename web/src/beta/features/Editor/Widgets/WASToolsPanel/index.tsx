import { Switcher, Typography } from "@reearth/beta/lib/reearth-ui";
import { Panel } from "@reearth/beta/ui/layout";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { FC, useEffect } from "react";

import { useWidgetsPage } from "../context";

import Devices from "./Devices";

const WASToolsPanel: FC = () => {
  const {
    showWASEditor,
    selectedDevice = "desktop",
    handleShowWASEditorToggle,
    handleDeviceChange,
    selectWidgetArea
  } = useWidgetsPage();

  const t = useT();

  useEffect(() => {
    if (!showWASEditor) {
      selectWidgetArea(undefined);
    }
  }, [showWASEditor, selectWidgetArea]);

  return (
    <Panel extend data-testid="was-tools-panel">
      <StyledSecondaryNav data-testid="was-secondary-nav">
        <Devices
          selectedDevice={selectedDevice}
          onDeviceChange={handleDeviceChange}
          data-testid="was-devices"
        />
        <AlignSystem data-testid="was-align-system">
          <Typography size="body" data-testid="was-align-system-label">
            {t("Align System")}
          </Typography>
          <Switcher
            value={showWASEditor}
            onChange={handleShowWASEditorToggle}
            data-testid="was-align-system-switch"
          />
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
  padding: theme.spacing.small
}));

const AlignSystem = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing.small + 2
}));
