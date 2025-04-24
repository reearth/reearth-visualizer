import { IconName, Icon, Typography } from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";
import { FC, ReactNode, useState } from "react";
import { Link } from "react-router-dom";

export type SidebarMenuItemProps = {
  id?: string;
  text?: string | ReactNode;
  icon?: IconName;
  path?: string;
  active?: boolean;
  disabled?: boolean;
  tileComponent?: ReactNode;
  subItem?: SidebarMenuItemProps[];
  openSubItem?: boolean;
  onClick?: () => void;
};

export const DEFAULT_SIDEBAR_WIDTH = 213;

export const SidebarMenuItem: FC<SidebarMenuItemProps> = ({
  icon,
  text,
  active,
  disabled,
  path,
  tileComponent,
  subItem,
  openSubItem = false,
  onClick
}) => {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState<boolean>(openSubItem);

  const Content = (
    <MenuWrapper
      active={subItem ? false : active}
      disabled={disabled}
      onClick={subItem ? () => setIsOpen(!isOpen) : onClick}
      data-testid="sidebar-menu"
    >
      <Info>
        {icon && (
          <Icon
            icon={icon}
            size="normal"
            color={active ? theme.content.main : theme.content.weak}
          />
        )}
        <Typography
          size="body"
          color={disabled ? theme.content.weak : theme.content.main}
        >
          {text}
        </Typography>
      </Info>
      {subItem && (
        <Icon
          icon={isOpen ? "caretUp" : "caretDown"}
          color={disabled ? theme.content.weaker : theme.content.main}
        />
      )}
      {tileComponent && <Tile>{tileComponent}</Tile>}
    </MenuWrapper>
  );

  if (subItem) {
    return (
      <>
        {Content}
        {isOpen && (
          <SubMenu>
            {subItem.map((t) => (
              <SidebarMenuItem
                key={t.id}
                path={t.path}
                text={t.text}
                active={t.active}
                icon={t.icon}
                subItem={t.subItem}
              />
            ))}
          </SubMenu>
        )}
      </>
    );
  }

  return (
    <StyledLinkButton to={path || ""} disabled={disabled}>
      {Content}
    </StyledLinkButton>
  );
};

const StyledLinkButton = styled(Link)<{ disabled?: boolean }>(
  ({ disabled }) => ({
    pointerEvents: disabled ? "none" : "auto",
    textDecoration: "none"
  })
);

const MenuWrapper = styled("div")<{ active?: boolean; disabled?: boolean }>(
  ({ active, theme, disabled }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    alignSelf: "stretch",
    gap: theme.spacing.small,
    background: active ? theme.select.main : "",
    borderRadius: active ? theme.radius.small : "",
    padding: theme.spacing.small,
    cursor: disabled ? "default" : "pointer",
    "&:hover": {
      background: active ? theme.select.main : theme.bg[2],
      borderRadius: theme.radius.small
    }
  })
);

const Info = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.small
}));

const Tile = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.small,
  flexShrink: 0
}));

const SubMenu = styled("div")(({ theme }) => ({
  padding: `${theme.spacing.smallest}px ${theme.spacing.smallest}px ${theme.spacing.smallest}px ${theme.spacing.super}px`,
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.smallest
}));

export const SidebarWrapper = styled("div")(() => ({
  display: "flex",
  flexDirection: "column",
  flex: 1,
  justifyContent: "space-between",
  maxHeight: "100vh",
  minHeight: 542
}));

export const SidebarButtonsWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  gap: theme.spacing.smallest,
  padding: `0 ${theme.spacing.smallest}px`
}));

export const SidebarMainSection = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.smallest,
  flex: 1
}));

export const SidebarFooterSection = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.smallest,
  flexShrink: 0
}));

export const SidebarDivider = styled("div")(({ theme }) => ({
  height: "1px",
  backgroundColor: theme.outline.weaker,
  margin: `0 ${theme.spacing.smallest}px`,
  flexShrink: 0
}));

export const SidebarVersion: FC = () => {
  const theme = useTheme();
  const t = useT();
  return (
    <Version>
      <Typography size="body" color={theme.content.weak}>
        {`${t(`Version`)} ${__APP_VERSION__}`}
      </Typography>
    </Version>
  );
};

const Version = styled("div")(({ theme }) => ({
  padding: `${theme.spacing.smallest}px ${theme.spacing.normal}px ${theme.spacing.small}px`
}));
