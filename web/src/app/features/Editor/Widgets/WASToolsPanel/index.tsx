import { Switcher, Typography } from "@reearth/app/lib/reearth-ui";
import { Panel } from "@reearth/app/ui/layout";
import { useT } from "@reearth/services/i18n/hooks";
import { styled } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
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
  display: css.display.flex,
  alignItems: css.alignItems.center,
  justifyContent: css.justifyContent.flexEnd,
  width: "100%",
  flex: 1,
  padding: theme.spacing.small
}));

const AlignSystem = styled("div")(({ theme }) => ({
  display: css.display.flex,
  alignItems: css.alignItems.center,
  gap: theme.spacing.small + 2,
  zIndex: 1
}));

const CenterWrapper = styled("div")(() => ({
  position: css.position.absolute,
  width: "100%",
  height: "100%",
  display: css.display.flex,
  justifyContent: css.justifyContent.center,
  alignItems: css.alignItems.center
}));
