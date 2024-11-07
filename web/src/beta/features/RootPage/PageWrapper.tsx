import { Icon, Typography } from "@reearth/beta/lib/reearth-ui/components/";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";
import {
  brandBlue,
  brandRed
} from "@reearth/services/theme/reearthTheme/common/colors";
import React from "react";
import { BarLoader } from "react-spinners";

export type Props = {
  loading?: boolean;
};

const RootPage: React.FC<Props> = ({ loading }) => {
  const t = useT();
  const theme = useTheme();

  return (
    <Wrapper bg={window.REEARTH_CONFIG?.brand?.background}>
      {window.REEARTH_CONFIG?.brand?.logoUrl ? (
        <img src={window.REEARTH_CONFIG.brand.logoUrl} style={{ width: 200 }} />
      ) : (
        <LogoWrapper>
          <Icon icon="logo" size={100} />
          <Typography size="h1" weight="bold" color={theme.item.default}>
            {t("Visualizer")}
          </Typography>
        </LogoWrapper>
      )}
      {loading && <BarLoader width={344} color={brandRed.dynamicRed} />}
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

const LogoWrapper = styled.div(() => ({
  display: "flex",
  alignItems: "center",
  gap: 36,
  padding: 20,
  borderRadius: 10
}));
export default RootPage;
