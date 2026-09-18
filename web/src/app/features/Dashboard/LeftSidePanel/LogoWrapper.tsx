import logoWithText from "@reearth/app/lib/reearth-ui/components/Icon/Icons/LogoWithText.svg";
import { styled } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC } from "react";

export const LogoWrapper: FC = () => {
  return (
    <Wrapper>
      <img src={logoWithText} width={128} height={40} />
    </Wrapper>
  );
};

const Wrapper = styled("div")(() => ({
  display: css.display.flex,
  justifyContent: css.justifyContent.center,
  alignItems: css.alignItems.center,
}));

export default LogoWrapper;
