import React from "react";
import { styled } from "@reearth/theme";
import Flex from "@reearth/components/atoms/Flex";
import logoColorful from "@reearth/components/atoms/Logo/reearthLogoColorful.svg";

export interface Props {
  className?: string;
}

const Logo: React.FC<Props> = ({ className }) => {
  return (
    <Wrapper align="center" justify="center" className={className}>
      <StyledImg src={logoColorful} alt="Re:Earth Logo" />
    </Wrapper>
  );
};

const Wrapper = styled(Flex)`
  min-width: 155px;
  flex-grow: 3;
  margin: 14px;

  @media only screen and (max-width: 1024px) {
    order: 1;
    flex-grow: 2;
    height: 180px;
    min-width: 180px;
  }
`;

const StyledImg = styled.img`
  width: 110px;
`;

export default Logo;
