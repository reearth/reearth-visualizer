import { styled } from "@reearth/services/theme";
import { FC, ReactNode } from "react";

const ManagerEmptyContent: FC<{ children?: ReactNode }> = ({ children }) => {
  return <WrapperContent>{children}</WrapperContent>;
};
const WrapperContent = styled("div")(() => ({
  display: "flex",
  justifyContent: "center",
  margin: "auto"
}));

export default ManagerEmptyContent;
