import { Switcher, Typography } from "@reearth/app/lib/reearth-ui";
import { Panel } from "@reearth/app/ui/layout";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { FC, useEffect } from "react";

import { useWidgetsViewDevice } from "../../atoms";
import Devices from "../../common/Devices";
import { useWidgetsPage } from "../context";

const WASToolsPanel: FC = () => {
  const { showWASEditor, handleShowWASEditorToggle, selectWidgetArea } =
    useWidgetsPage();

  const [device, setDevice] = useWidgetsViewDevice();

  const t = useT();

  useEffect(() => {
    if (!showWASEditor) {
      selectWidgetArea(undefined);
    }
  }, [showWASEditor, selectWidgetArea]);

  return (
    <Panel extend data-testid="was-tools-panel">
      <StyledSecondaryNav data-testid="was-secondary-nav">
        <CenterWrapper>
          <Devices
            selectedDevice={device}
            onDeviceChange={setDevice}
            data-testid="was-devices"
          />
        </CenterWrapper>
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
  gap: theme.spacing.small + 2
}));

const CenterWrapper = styled("div")(() => ({
  position: "absolute",
  width: "100%",
  height: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
}));
