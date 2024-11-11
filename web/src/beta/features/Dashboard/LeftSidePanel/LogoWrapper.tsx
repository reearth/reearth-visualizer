import { Icon } from "@reearth/beta/lib/reearth-ui";
import { styled } from "@reearth/services/theme";
import { FC } from "react";

export const LogoWrapper: FC = () => {
  return (
    <Wrapper>
      <IconWrapper>
        <Icon icon="logoWithText" size={100} />
      </IconWrapper>
    </Wrapper>
  );
};

const IconWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing.normal,
  alignItems: "center",
  justifyContent: "center"
}));

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  alignContent: "center",
  justifyContent: "center",
  padding: theme.spacing.normal,
  minHeight: "90px"
}));

export default LogoWrapper;
