import { FC } from "react";
import { Link } from "react-router-dom";

import { IconName, Icon, Typography } from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";

export type SidebarMenuItemProps = {
  text?: string;
  icon?: IconName;
  path?: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
};

export const DEFAULT_SIDEBAR_WIDTH = 213;

export const SidebarMenuItem: FC<SidebarMenuItemProps> = ({
  icon,
  text,
  active,
  disabled,
  path,
  onClick,
}) => {
  const theme = useTheme();
  return (
    <StyledLinkButton to={path || ""} disabled={disabled}>
      <MenuWrapper active={active} disabled={disabled} onClick={onClick}>
        {icon && (
          <Icon
            icon={icon}
            size="normal"
            color={active ? theme.content.main : theme.content.weak}
          />
        )}
        <Typography size="body" color={disabled ? theme.content.weak : theme.content.main}>
          {text}
        </Typography>
      </MenuWrapper>
    </StyledLinkButton>
  );
};

const StyledLinkButton = styled(Link)<{ disabled?: boolean }>(({ disabled }) => ({
  pointerEvents: disabled ? "none" : "auto",
  textDecoration: "none",
}));

const MenuWrapper = styled("div")<{ active?: boolean; disabled?: boolean }>(
  ({ active, theme, disabled }) => ({
    display: "flex",
    alignItems: "center",
    alignSelf: "stretch",
    gap: theme.spacing.small,
    background: active ? theme.select.main : "",
    borderRadius: active ? theme.radius.small : "",
    padding: theme.spacing.small,
    cursor: disabled ? "default" : "pointer",
    ["&:hover"]: {
      background: active ? theme.select.main : theme.bg[2],
      borderRadius: theme.radius.small,
    },
  }),
);

export const SidebarWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  padding: `0 ${theme.spacing.smallest}px`,
  flex: 1,
  justifyContent: "space-between",
}));

export const SidebarSection = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.small,
}));

export const SidebarVersion: FC = () => {
  const theme = useTheme();
  const t = useT();
  return (
    <Version>
      <Typography size="body" color={theme.content.weak}>
        {t(`Version ${__APP_VERSION__}`)}
      </Typography>
    </Version>
  );
};

const Version = styled("div")(({ theme }) => ({
  padding: theme.spacing.small,
}));
