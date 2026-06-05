import { Typography } from "@reearth/app/lib/reearth-ui";
import { styled, useTheme } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC, ReactNode } from "react";

export type BadgeVariant = "info" | "warning" | "success" | "error";

export type BadgeProps = {
  children: ReactNode;
  variant?: BadgeVariant;
  "data-testid"?: string;
};

const Badge: FC<BadgeProps> = ({ children, variant = "info", ...props }) => {
  const theme = useTheme();

  const colors = {
    info: {
      bg: theme.primary.weakest,
      border: theme.primary.weak,
      text: theme.primary.main
    },
    warning: {
      bg: theme.warning.weakest,
      border: theme.warning.weak,
      text: theme.warning.main
    },
    success: {
      bg: theme.success.weakest,
      border: theme.success.weak,
      text: theme.success.main
    },
    error: {
      // dangerous doesn't have weakest, use weak with reduced opacity effect
      bg: theme.dangerous.weak,
      border: theme.dangerous.weak,
      text: theme.dangerous.main
    }
  };

  const variantColors = colors[variant];

  return (
    <Wrapper
      $backgroundColor={variantColors.bg}
      $borderColor={variantColors.border}
      data-testid={props["data-testid"] || "badge"}
    >
      <Typography size="footnote" color={variantColors.text}>
        {children}
      </Typography>
    </Wrapper>
  );
};

export default Badge;

const Wrapper = styled("div")<{
  $backgroundColor: string;
  $borderColor: string;
}>(({ theme, $backgroundColor, $borderColor }) => ({
  display: css.display.inlineFlex,
  alignItems: css.alignItems.center,
  padding: `${theme.spacing.micro}px ${theme.spacing.smallest}px`,
  backgroundColor: $backgroundColor,
  borderRadius: theme.radius.small,
  border: `1px solid ${$borderColor}`,
  whiteSpace: "nowrap"
}));
