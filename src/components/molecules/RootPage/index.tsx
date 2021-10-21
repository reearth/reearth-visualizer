import React from "react";
import { RingLoader } from "react-spinners";

import Flex from "@reearth/components/atoms/Flex";
import Icon from "@reearth/components/atoms/Icon";
import { styled, useTheme } from "@reearth/theme";

const RootPage: React.FC = () => {
  const theme = useTheme();
  return (
    <Wrapper justify="center" align="center" direction="column">
      <StyledIcon icon="logo" size={200} />
      <RingLoader size={35} color={theme.main.strongText} />
    </Wrapper>
  );
};

const Wrapper = styled(Flex)`
  height: 100%;
  background: ${({ theme }) =>
    `linear-gradient(70deg, ${theme.main.brandBlue} 10%, ${theme.main.brandRed} 60%, ${theme.main.brandBlue} 90%)`};
`;

const StyledIcon = styled(Icon)`
  margin-bottom: 100px;
`;

export default RootPage;
