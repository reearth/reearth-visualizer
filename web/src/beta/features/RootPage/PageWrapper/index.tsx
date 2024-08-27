import Flex from "@reearth/beta/components/Flex";
import Icon from "@reearth/beta/components/Icon";
import { styled, useTheme } from "@reearth/services/theme";
import {
  brandBlue,
  brandRed,
} from "@reearth/services/theme/reearthTheme/common/colors";
import React from "react";
import { RingLoader } from "react-spinners";

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
      bg={window.REEARTH_CONFIG?.brand?.background}
    >
      {window.REEARTH_CONFIG?.brand?.logoUrl ? (
        <img src={window.REEARTH_CONFIG.brand.logoUrl} style={{ width: 200 }} />
      ) : (
        <Icon icon="logo" size={200} />
      )}
      {loading && <RingLoader size={35} color={theme.primary.strong} />}
    </Wrapper>
  );
};

const Wrapper = styled(Flex)<{ bg?: string }>`
  height: 100%;
  background: ${({ bg }) =>
    bg ||
    `linear-gradient(70deg, ${brandBlue} 10%, ${brandRed} 60%, ${brandBlue} 90%)`};
`;

export default RootPage;
