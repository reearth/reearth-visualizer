import { styled, useTheme } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC, ReactNode } from "react";

import { Icon, IconName } from "../Icon";
import { Typography } from "../Typography";

export type BannerVariant = "info" | "warning" | "error" | "success";

export type BannerProps = {
  children: ReactNode;
  variant?: BannerVariant;
  "data-testid"?: string;
};

export const Banner: FC<BannerProps> = ({
  children,
  variant = "info",
  ...props
}) => {
  const theme = useTheme();

  const variantConfig: Record<
    BannerVariant,
    {
      bg: string;
      border: string;
      text: string;
      icon: IconName;
    }
  > = {
    info: {
      bg: theme.secondary.weak,
      border: theme.secondary.strong,
      text: theme.content.main,
      icon: "informationCircle"
    },
    warning: {
      bg: theme.warning.weakest,
      border: theme.warning.weak,
      text: theme.content.main,
      icon: "warning"
    },
    error: {
      bg: theme.dangerous.weak,
      border: theme.dangerous.strong,
      text: theme.content.main,
      icon: "alertCircle"
    },
    success: {
      bg: theme.primary.weakest,
      border: theme.primary.weak,
      text: theme.content.main,
      icon: "checkmarkCircle"
    }
  };

  const config = variantConfig[variant];

  return (
    <Wrapper
      $backgroundColor={config.bg}
      $borderColor={config.border}
      data-testid={props["data-testid"] || `banner-${variant}`}
    >
      <IconWrapper>
        <Icon icon={config.icon} size={16} color={config.text} />
      </IconWrapper>
      <Typography size="footnote" color={config.text}>
        {children}
      </Typography>
    </Wrapper>
  );
};

const Wrapper = styled("div")<{
  $backgroundColor: string;
  $borderColor: string;
}>(({ theme, $backgroundColor, $borderColor }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.row,
  alignItems: css.alignItems.center,
  gap: theme.spacing.smallest,
  padding: `${theme.spacing.small}px ${theme.spacing.normal}px`,
  backgroundColor: $backgroundColor,
  borderRadius: theme.radius.small,
  border: `1px solid ${$borderColor}`
}));

const IconWrapper = styled("div")(() => ({
  display: css.display.flex,
  alignItems: css.alignItems.center,
  flexShrink: 0
}));
