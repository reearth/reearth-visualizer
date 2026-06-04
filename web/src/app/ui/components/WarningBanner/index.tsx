import { Icon, Typography } from "@reearth/app/lib/reearth-ui";
import { styled, useTheme } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC, ReactNode } from "react";

export type WarningBannerProps = {
  children: ReactNode;
  "data-testid"?: string;
};

const WarningBanner: FC<WarningBannerProps> = ({ children, ...props }) => {
  const theme = useTheme();

  return (
    <Wrapper data-testid={props["data-testid"] || "warning-banner"}>
      <IconWrapper>
        <Icon icon="warning" size={16} color={theme.warning.main} />
      </IconWrapper>
      <Typography size="footnote" color={theme.warning.main}>
        {children}
      </Typography>
    </Wrapper>
  );
};

export default WarningBanner;

const Wrapper = styled("div")(({ theme }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.row,
  alignItems: css.alignItems.center,
  gap: theme.spacing.smallest,
  padding: `${theme.spacing.small}px ${theme.spacing.normal}px`,
  backgroundColor: theme.warning.weakest,
  borderRadius: theme.radius.small,
  border: `1px solid ${theme.warning.weak}`
}));

const IconWrapper = styled("div")(() => ({
  display: css.display.flex,
  alignItems: css.alignItems.center,
  flexShrink: 0
}));
