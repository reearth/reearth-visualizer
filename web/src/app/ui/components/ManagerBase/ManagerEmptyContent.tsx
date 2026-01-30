import { styled } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC, ReactNode } from "react";

const ManagerEmptyContent: FC<{ children?: ReactNode }> = ({ children }) => {
  return <WrapperContent>{children}</WrapperContent>;
};
const WrapperContent = styled("div")(() => ({
  display: css.display.flex,
  justifyContent: css.justifyContent.center,
  margin: "auto"
}));

export default ManagerEmptyContent;
