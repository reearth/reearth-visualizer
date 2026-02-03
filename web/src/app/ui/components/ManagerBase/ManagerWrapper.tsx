import { styled } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";

export const ManagerWrapper = styled("div")(() => ({
  display: css.display.flex,
  width: "100%",
  height: "100%",
  flexDirection: css.flexDirection.column
}));
