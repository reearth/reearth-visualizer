import { Loading } from "@reearth/app/lib/reearth-ui";
import { styled } from "@reearth/services/theme";
import {
  brandBlue,
  brandRed
} from "@reearth/services/theme/reearthTheme/common/colors";
import React from "react";

export type Props = {
  loading?: boolean;
};

const RootPage: React.FC<Props> = ({ loading }) => {
  return (
    <Wrapper bg={window.REEARTH_CONFIG?.brand?.background}>
      {window.REEARTH_CONFIG?.brand?.logoUrl ? (
        <img src={window.REEARTH_CONFIG.brand.logoUrl} style={{ width: 200 }} />
      ) : (
        loading && <Loading includeLogo />
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div<{ bg?: string }>(({ bg }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 49,
  height: "100%",
  background:
    bg ||
    `linear-gradient(70deg, ${brandBlue} 10%, ${brandRed} 60%, ${brandBlue} 90%)`
}));

export default RootPage;
