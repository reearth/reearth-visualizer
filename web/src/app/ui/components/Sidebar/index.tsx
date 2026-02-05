import { IconName, Icon, Typography } from "@reearth/app/lib/reearth-ui";
import { useT } from "@reearth/services/i18n/hooks";
import { styled, useTheme } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC, ReactNode, useState } from "react";
import { Link } from "react-router";

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

export const SidebarMenuItem: FC<
  SidebarMenuItemProps & { "data-testid"?: string }
> = ({
  icon,
  text,
  active,
  disabled,
  path,
  tileComponent,
  subItem,
  openSubItem = false,
  onClick,
  "data-testid": dataTestId
}) => {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState<boolean>(openSubItem);

  const Content = (
    <MenuWrapper
      active={subItem ? false : active}
      disabled={disabled}
      onClick={subItem ? () => setIsOpen(!isOpen) : onClick}
      data-testid={dataTestId || "sidebar-menu"}
    >
      <Info data-testid={dataTestId ? `${dataTestId}-info` : undefined}>
        {icon && (
          <Icon
            icon={icon}
            size="normal"
            color={active ? theme.content.main : theme.content.weak}
            data-testid={dataTestId ? `${dataTestId}-icon` : undefined}
          />
        )}
        <Typography
          size="body"
          color={disabled ? theme.content.weak : theme.content.main}
          data-testid={dataTestId ? `${dataTestId}-text` : undefined}
        >
          {text}
        </Typography>
      </Info>
      {subItem && (
        <Icon
          icon={isOpen ? "caretUp" : "caretDown"}
          color={disabled ? theme.content.weaker : theme.content.main}
          data-testid={dataTestId ? `${dataTestId}-caret` : undefined}
        />
      )}
      {tileComponent && (
        <Tile data-testid={dataTestId ? `${dataTestId}-tile` : undefined}>
          {tileComponent}
        </Tile>
      )}
    </MenuWrapper>
  );

  if (subItem) {
    return (
      <>
        {Content}
        {isOpen && (
          <SubMenu
            data-testid={dataTestId ? `${dataTestId}-submenu` : undefined}
          >
            {subItem.map((t) => (
              <SidebarMenuItem
                key={t.id}
                path={t.path}
                text={t.text}
                active={t.active}
                icon={t.icon}
                subItem={t.subItem}
                data-testid={
                  dataTestId ? `${dataTestId}-subitem-${t.id}` : undefined
                }
              />
            ))}
          </SubMenu>
        )}
      </>
    );
  }

  return (
    <StyledLinkButton
      to={path || ""}
      disabled={disabled}
      data-testid={dataTestId ? `${dataTestId}-link` : undefined}
    >
      {Content}
    </StyledLinkButton>
  );
};

const StyledLinkButton = styled(
  ({
    disabled,
    to,
    children,
    ...props
  }: {
    disabled?: boolean;
    to: string;
    children?: React.ReactNode;
  }) => {
    const isExternal = /^https?:\/\//.test(to);
    if (isExternal) {
      return (
        <a href={to} target="_blank" rel="noopener noreferrer" {...props}>
          {children}
        </a>
      );
    }
    return (
      <Link to={to} {...props}>
        {children}
      </Link>
    );
  }
)<{ disabled?: boolean; to: string; children?: React.ReactNode }>(
  ({ disabled }) => ({
    pointerEvents: disabled ? "none" : "auto",
    textDecoration: css.textDecoration.none
  })
);

const MenuWrapper = styled("div")<{ active?: boolean; disabled?: boolean }>(
  ({ active, theme, disabled }) => ({
    display: css.display.flex,
    alignItems: css.alignItems.center,
    justifyContent: css.justifyContent.spaceBetween,
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
  display: css.display.flex,
  alignItems: css.alignItems.center,
  gap: theme.spacing.small
}));

const Tile = styled("div")(({ theme }) => ({
  display: css.display.flex,
  alignItems: css.alignItems.center,
  gap: theme.spacing.small,
  flexShrink: 0
}));

const SubMenu = styled("div")(({ theme }) => ({
  padding: `${theme.spacing.smallest}px ${theme.spacing.smallest}px ${theme.spacing.smallest}px ${theme.spacing.super}px`,
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  gap: theme.spacing.smallest
}));

export const SidebarWrapper = styled("div")(() => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  flex: 1,
  justifyContent: css.justifyContent.spaceBetween,
  maxHeight: "100vh",
  minHeight: 542
}));

export const SidebarButtonsWrapper = styled("div")(({ theme }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  justifyContent: css.justifyContent.spaceBetween,
  gap: theme.spacing.smallest,
  padding: `0 ${theme.spacing.smallest}px`
}));

export const SidebarMainSection = styled("div")(({ theme }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  gap: theme.spacing.smallest,
  flex: 1
}));

export const SidebarFooterSection = styled("div")(({ theme }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
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
