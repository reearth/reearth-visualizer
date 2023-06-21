import React from "react";
import { RingLoader } from "react-spinners";

import Flex from "@reearth/classic/components/atoms/Flex";
import Icon from "@reearth/classic/components/atoms/Icon";
import { styled, useTheme } from "@reearth/services/theme";

export type Props = {
  loading?: boolean;
};

const RootPage: React.FC<Props> = ({ loading }) => {
  const theme = useTheme();
  return (
    <Wrapper
      justify="center"
      align="center"
      direction="column"
      gap={100}
      bg={window.REEARTH_CONFIG?.brand?.background}>
      {window.REEARTH_CONFIG?.brand?.logoUrl ? (
        <img src={window.REEARTH_CONFIG.brand.logoUrl} style={{ width: 200 }} />
      ) : (
        <Icon icon="logo" size={200} />
      )}
      {loading && <RingLoader size={35} color={theme.classic.main.strongText} />}
    </Wrapper>
  );
};

const Wrapper = styled(Flex)<{ bg?: string }>`
  height: 100%;
  background: ${({ theme, bg }) =>
    bg ||
    `linear-gradient(70deg, ${theme.classic.main.brandBlue} 10%, ${theme.classic.main.brandRed} 60%, ${theme.classic.main.brandBlue} 90%)`};
`;

export default RootPage;
