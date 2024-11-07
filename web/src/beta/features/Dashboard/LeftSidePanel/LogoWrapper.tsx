import { Typography, Icon } from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";
import { FC } from "react";

export const LogoWrapper: FC = () => {
  const t = useT();
  const theme = useTheme();

  return (
    <Wrapper>
      <IconWrapper>
        <Icon icon="logo" size={40} />
        <Typography size="body" weight="bold" color={theme.item.default}>
          {t("Visualizer")}
        </Typography>
      </IconWrapper>
    </Wrapper>
  );
};

const IconWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing.normal,
  alignItems: "center",
  justifyContent: "center",
  minHeight: "90px"
}));

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.normal,
  alignContent: "center",
  padding: theme.spacing.normal,
  justifyContent: "center"
}));

export default LogoWrapper;
