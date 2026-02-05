import logoWithText from "@reearth/app/lib/reearth-ui/components/Icon/Icons/LogoWithText.svg";
import { styled } from "@reearth/services/theme";
import { FC } from "react";

export const LogoWrapper: FC = () => {
  return (
    <Wrapper>
      <img src={logoWithText} width={128} height={40} />
    </Wrapper>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: theme.spacing.normal,
  minHeight: "90px"
}));

export default LogoWrapper;
