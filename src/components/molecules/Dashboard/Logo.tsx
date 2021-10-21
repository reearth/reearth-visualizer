import React from "react";

import Flex from "@reearth/components/atoms/Flex";
import Icon from "@reearth/components/atoms/Icon";
import { styled } from "@reearth/theme";

export interface Props {
  className?: string;
}

const Logo: React.FC<Props> = ({ className }) => {
  return (
    <Wrapper align="center" justify="center" className={className}>
      <Icon icon="logoColorful" size={122} />
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

export default Logo;
