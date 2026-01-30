import { styled } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";

export const ManagerContent = styled("div")(({ theme }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  flex: 1,
  height: 0,
  width: "100%",
  ...theme.scrollBar,
  ["@media (max-width: 630px)"]: {
    width: "630px",
    overflowX: "auto"
  }
}));
