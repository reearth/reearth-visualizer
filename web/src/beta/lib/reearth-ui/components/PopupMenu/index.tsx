import {
  Popup,
  Icon,
  IconName,
  PopupProps
} from "@reearth/beta/lib/reearth-ui";
import { styled, useTheme } from "@reearth/services/theme";
import { FC, ReactNode, useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

const MULTLEVEL_OFFSET = 12;
const DEFAULT_OFFSET = 4;
const DEFAULT_MENU_WIDTH = 190;

export type CustomSubMenu = {
  title: string;
  menuItem: PopupMenuItem;
};

type Accumulator = Record<string, PopupMenuItem[]>;

export type PopupMenuItem = {
  customSubMenuLabel?: string;
  customSubMenuOrder?: number;
  icon?: IconName;
  id: string;
  hasCustomSubMenu?: boolean;
  hasBorderBottom?: boolean;
  onClick?: (id: string) => void;
  path?: string;
  personal?: boolean;
  selected?: boolean;
  subItem?: PopupMenuItem[];
  title?: string;
  disabled?: boolean;
};

export type PopupMenuProps = {
  label?: string | ReactNode;
  icon?: IconName;
  iconColor?: string;
  menu: PopupMenuItem[];
  nested?: boolean;
  width?: number;
  extendTriggerWidth?: boolean;
  extendContentWidth?: boolean;
  size?: "small" | "normal";
  placement?: PopupProps["placement"];
  triggerOnHover?: boolean;
  openMenu?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export const PopupMenu: FC<PopupMenuProps> = ({
  label,
  menu,
  nested,
  width,
  extendTriggerWidth,
  extendContentWidth,
  placement,
  triggerOnHover,
  iconColor,
  icon,
  openMenu = false,
  size = "normal",
  onOpenChange
}) => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    setOpen(openMenu);
  }, [openMenu]);

  const handlePopOver = useCallback(
    (state?: boolean) => {
      if (state === undefined) {
        setOpen(!open);
        onOpenChange?.(!open);
      } else {
        setOpen(state);
        onOpenChange?.(state);
      }
    },
    [onOpenChange, open]
  );

  const renderSingleItem = (item: PopupMenuItem, index: number) => {
    const {
      icon,
      id,
      hasBorderBottom,
      onClick,
      path,
      selected,
      subItem,
      title,
      disabled
    } = item;

    return (
      <Item
        hasBorderBottom={!!hasBorderBottom}
        key={index}
        size={size}
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          onClick?.(id);
          handlePopOver(false);
        }}
      >
        {icon && (
          <IconWrapper>
            <Icon
              icon={icon}
              size="small"
              color={iconColor ? iconColor : theme.content.weak}
            />
          </IconWrapper>
        )}
        <SubItem>
          {subItem ? (
            <PopupMenu label={title} menu={subItem} width={width} nested />
          ) : path ? (
            <StyledLink to={disabled ? "" : path}>
              <TitleWrapper disabled={disabled}>{title}</TitleWrapper>
            </StyledLink>
          ) : (
            <TitleWrapper disabled={disabled}>{title}</TitleWrapper>
          )}
          {selected && (
            <IconWrapper>
              <Icon icon="check" size="small" color={theme.content.main} />
            </IconWrapper>
          )}
        </SubItem>
      </Item>
    );
  };

  const renderSubMenuItems = (subMenuItems: PopupMenuItem[]) => {
    const groups = subMenuItems
      .sort((a, b) => {
        if (
          a.customSubMenuOrder !== undefined &&
          b.customSubMenuOrder !== undefined
        ) {
          return a.customSubMenuOrder - b.customSubMenuOrder;
        }
        return 0;
      })
      .reduce((acc: Accumulator, obj: PopupMenuItem) => {
        const key = obj["customSubMenuLabel"] as string;

        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(obj);
        return acc;
      }, {} as Accumulator);

    const customSubMenu = Object.values(groups) as PopupMenuItem[][];

    return (
      <PopupMenuWrapper width={width} nested={nested}>
        {customSubMenu.map((item, index) => (
          <Group key={index}>
            <SubMenuHeader>
              {customSubMenu[index][0].customSubMenuLabel}
            </SubMenuHeader>
            {item.map((subItem, subIndex) =>
              renderSingleItem(subItem, subIndex)
            )}
          </Group>
        ))}
      </PopupMenuWrapper>
    );
  };

  const renderMenuItems = (menuItems: PopupMenuItem[]) => {
    return (
      <PopupMenuWrapper
        width={width}
        nested={nested}
        extendContentWidth={extendContentWidth}
      >
        {menuItems.map((item, index) => {
          return renderSingleItem(item, index);
        })}
      </PopupMenuWrapper>
    );
  };

  const renderTrigger = () => {
    return typeof label === "string" ? (
      <LabelWrapper size={size} nested={!!nested}>
        {icon && <Icon icon={icon} size="small" />}
        <Label nested={!!nested}>{label}</Label>
        <Icon
          color={theme.content.weak}
          icon={nested ? "caretRight" : "caretDown"}
          size="small"
        />
      </LabelWrapper>
    ) : label ? (
      label
    ) : icon ? (
      <Icon icon={icon} size="small" />
    ) : null;
  };

  return (
    <Popup
      open={open}
      placement={
        placement ? placement : nested ? "right-start" : "bottom-start"
      }
      offset={nested ? MULTLEVEL_OFFSET : DEFAULT_OFFSET}
      onOpenChange={handlePopOver}
      triggerOnHover={triggerOnHover || nested ? true : false}
      extendTriggerWidth={extendTriggerWidth || nested ? true : false}
      extendContentWidth={extendContentWidth}
      autoClose
      trigger={
        <TriggerWrapper onClick={() => handlePopOver()} nested={nested}>
          {renderTrigger()}
        </TriggerWrapper>
      }
    >
      {nested && !!menu.find((item) => item.hasCustomSubMenu)
        ? renderSubMenuItems(menu)
        : renderMenuItems(menu)}
    </Popup>
  );
};

const TriggerWrapper = styled("div")<{ nested?: boolean }>(
  ({ nested, theme }) => ({
    cursor: "pointer",
    display: "flex",
    gap: theme.spacing.smallest,
    alignItems: "center",
    justifyContent: nested ? "space-between" : "normal"
  })
);

const PopupMenuWrapper = styled("div")<{
  width?: number;
  nested?: boolean;
  extendContentWidth?: boolean;
}>(({ width, nested, extendContentWidth, theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: `${theme.spacing.micro}px`,
  padding: `${theme.spacing.micro}px`,
  backgroundColor: `${theme.bg[1]}`,
  boxShadow: `${theme.shadow.popup}`,
  borderRadius: `${theme.radius.small}px`,
  border: `1px solid ${theme.outline.weaker}`,
  width: extendContentWidth
    ? "100%"
    : width
      ? `${width}px`
      : DEFAULT_MENU_WIDTH,
  maxHeight: "250px",
  overflowY: "auto",
  boxSizing: "border-box",
  margin: nested ? "-7px 0 0 2px" : "inherit",
  ["::-webkit-scrollbar"]: {
    width: "8px",
    height: "8px"
  },
  ["::-webkit-scrollbar-track"]: {
    background: theme.relative.darker,
    borderRadius: "10px"
  },
  ["::-webkit-scrollbar-thumb"]: {
    background: theme.relative.light,
    borderRadius: "4px"
  },
  ["::-webkit-scrollbar-thumb:hover"]: {
    background: theme.relative.lighter
  }
}));

const Item = styled("div")<{
  hasBorderBottom: boolean;
  size?: "small" | "normal";
  disabled?: boolean;
}>(({ hasBorderBottom, size, disabled, theme }) => ({
  display: "flex",
  gap: theme.spacing.small,
  alignItems: "center",
  padding:
    size === "small"
      ? `${theme.spacing.micro}px ${theme.spacing.smallest}px`
      : `${theme.spacing.smallest}px ${theme.spacing.small}px`,
  borderRadius: `${theme.radius.smallest}px`,
  borderBottom: hasBorderBottom ? `1px solid ${theme.outline.weaker}` : "",
  cursor: disabled ? "default" : "pointer",
  backgroundColor: "transparent",
  "&:hover": {
    backgroundColor: `${theme.bg[2]}`
  }
}));

const StyledLink = styled(Link)(() => ({
  textDecoration: "none",
  width: "100%"
}));

const IconWrapper = styled("div")(() => ({
  flexGrow: 0,
  flexShrink: 0
}));
const SubMenuHeader = styled("div")(({ theme }) => ({
  color: theme.content.weak,
  fontSize: "11px",
  fontWeight: 400,
  lineHeight: "16px",
  padding: `${theme.spacing.smallest}px ${theme.spacing.small}px  0 ${theme.spacing.small}px`
}));

const SubItem = styled("div")(() => ({
  display: "flex",
  justifyContent: "space-between",
  justifyItems: "center",
  flexGrow: 1,
  alignItems: "center"
}));

const Label = styled("p")<{ nested: boolean }>(({ nested, theme }) => ({
  padding: "0px 4px 0px 0px",
  fontSize: theme.fonts.sizes.body,
  flex: 1,
  color: nested ? theme.content.main : theme.content.weak,
  fontWeight: nested ? "normal" : "bold"
}));

const LabelWrapper = styled("div")<{
  size?: "small" | "normal";
  nested: boolean;
}>(({ size, nested, theme }) => ({
  display: "flex",
  padding: nested
    ? "0px"
    : size === "small"
      ? `${theme.spacing.micro}px ${theme.spacing.small}px`
      : `${theme.spacing.smallest}px ${theme.spacing.small}px`,
  borderRadius: "4px",
  flex: 1,
  alignItems: "center",
  "&:hover": {
    background: theme.bg[2],
    p: {
      color: theme.content.main
    }
  }
}));

const Group = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: `${theme.spacing.micro}px`
}));

const TitleWrapper = styled("div")<{ disabled?: boolean }>(
  ({ theme, disabled }) => ({
    fontSize: theme.fonts.sizes.body,
    color: disabled ? theme.content.weak : theme.content.main,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: 160
  })
);
