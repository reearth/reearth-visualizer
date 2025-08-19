import { Switcher, Typography } from "@reearth/app/lib/reearth-ui";
import { Panel } from "@reearth/app/ui/layout";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { FC, useEffect } from "react";

import { useDevice } from "../../atoms";
import { useWidgetsPage } from "../context";

import Devices from "./Devices";

const WASToolsPanel: FC = () => {
  const { showWASEditor, handleShowWASEditorToggle, selectWidgetArea } =
    useWidgetsPage();

  const [device, setDevice] = useDevice();

  const t = useT();

  useEffect(() => {
    if (!showWASEditor) {
      selectWidgetArea(undefined);
    }
  }, [showWASEditor, selectWidgetArea]);

  return (
    <Panel extend data-testid="was-tools-panel">
      <StyledSecondaryNav data-testid="was-secondary-nav">
        <Spacer />
        <Devices
          selectedDevice={device}
          onDeviceChange={setDevice}
          data-testid="was-devices"
        />
        <Spacer />
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
  alignItems: "center",
  gap: theme.spacing.small + 2,
  float: "right"
}));

const Spacer = styled("div")(() => ({
  flex: 1
}));
