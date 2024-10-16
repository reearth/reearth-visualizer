import { Icon } from "@reearth/beta/lib/reearth-ui/components/";
import { styled, useTheme } from "@reearth/services/theme";
import {
  brandBlue,
  brandRed
} from "@reearth/services/theme/reearthTheme/common/colors";
import React from "react";
import { RingLoader } from "react-spinners";

export type Props = {
  loading?: boolean;
};

const RootPage: React.FC<Props> = ({ loading }) => {
  const theme = useTheme();

  return (
    <Wrapper bg={window.REEARTH_CONFIG?.brand?.background}>
      {window.REEARTH_CONFIG?.brand?.logoUrl ? (
        <img src={window.REEARTH_CONFIG.brand.logoUrl} style={{ width: 200 }} />
      ) : (
        <Icon icon="reearthLogo" size={200} />
      )}
      {loading && <RingLoader size={35} color={theme.primary.strong} />}
    </Wrapper>
  );
};

const Wrapper = styled.div<{ bg?: string }>(({ bg }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 100,
  height: "100%",
  background:
    bg ||
    `linear-gradient(70deg, ${brandBlue} 10%, ${brandRed} 60%, ${brandBlue} 90%)`
}));

export default RootPage;
