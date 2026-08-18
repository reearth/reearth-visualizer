import { Popup, Icon, IconName, PopupProps, Typography } from "@reearth/app/lib/reearth-ui";
import { styled, useTheme } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC, ReactNode, useCallback, useEffect, useState } from "react";
import { Link } from "react-router";

const MULTILEVEL_OFFSET = 12;
const DEFAULT_OFFSET = 4;
const DEFAULT_MIN_WIDTH = 140;
const DEFAULT_MAX_WIDTH = 280;

export type PopupMenuItem = {
  id: string;
  title?: string;
  icon?: IconName;
  iconColor?: string;
  color?: string;
  customIcon?: ReactNode;
  iconPosition?: "left" | "right";
  hasBorderBottom?: boolean;
  onClick?: (id: string) => void;
  path?: string;
  personal?: boolean;
  selected?: boolean;
  subItem?: PopupMenuItem[];
  disabled?: boolean;
  tileComponent?: ReactNode;
  dataTestid?: string;
  /** When true, renders this item as a non-interactive group header label. */
  isHeader?: boolean;
  /** When true, pins this item to a footer section below the scrollable list. */
  hasFooter?: boolean;
};

export type PopupMenuProps = {
  label?: string | ReactNode;
  icon?: IconName;
  iconColor?: string;
  menu: PopupMenuItem[];
  nested?: boolean;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  extendTriggerWidth?: boolean;
  extendContentWidth?: boolean;
  size?: "small" | "normal";
  placement?: PopupProps["placement"];
  triggerOnHover?: boolean;
  openMenu?: boolean;
  onOpenChange?: (open: boolean) => void;
  dataTestid?: string;
  ariaLabelledby?: string;
};

export const PopupMenu: FC<PopupMenuProps> = ({
  label,
  menu,
  nested,
  width,
  minWidth,
  maxWidth,
  extendTriggerWidth,
  extendContentWidth,
  placement,
  triggerOnHover,
  iconColor,
  icon,
  openMenu = false,
  size = "normal",
  onOpenChange,
  dataTestid,
  ariaLabelledby
}) => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    setOpen(openMenu);
  }, [openMenu]);

  const handlePopOver = useCallback(
    (state?: boolean) => {
      const next = state ?? !open;
      setOpen(next);
      onOpenChange?.(next);
    },
    [onOpenChange, open]
  );

  const renderItem = (item: PopupMenuItem, index: number) => {
    if (item.isHeader) {
      return (
        <GroupHeaderWrapper key={item.id}>
          {item.icon && (
            <Icon icon={item.icon} size="normal" color={item.iconColor ? item.iconColor : theme.content.weak} />
          )}
          <Typography size="footnote" color={item.color ? item.color : theme.content.weak}>{item.title}</Typography>
        </GroupHeaderWrapper>
      );
    }

    const {
      icon,
      iconColor: itemIconColor,
      color: itemColor,
      customIcon,
      iconPosition = "left",
      id,
      hasBorderBottom,
      onClick,
      path,
      selected,
      subItem,
      title,
      disabled,
      dataTestid: itemTestid,
      tileComponent
    } = item;

    const resolvedIconColor = itemIconColor ?? iconColor ?? theme.content.weak;
    const titleContent = (
      <TitleWrapper
        disabled={disabled}
        flex={!!tileComponent}
        itemColor={itemColor}
      >
        {title}
        {tileComponent}
      </TitleWrapper>
    );

    return (
      <Item
        hasBorderBottom={!!hasBorderBottom}
        key={id}
        size={size}
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          onClick?.(id);
          handlePopOver(false);
        }}
        role="menuitem"
        aria-checked={selected ? "true" : undefined}
        data-testid={itemTestid ? `${itemTestid}-item-${index}` : undefined}
      >
        {icon && iconPosition === "left" && (
          <IconWrapper>
            <Icon icon={icon} size="small" color={resolvedIconColor} />
          </IconWrapper>
        )}
        {customIcon && <IconWrapper>{customIcon}</IconWrapper>}
        <ItemContent>
          {subItem ? (
            <PopupMenu
              label={title}
              menu={subItem}
              width={width}
              minWidth={minWidth}
              maxWidth={maxWidth}
              nested
              dataTestid={itemTestid ? `${itemTestid}-submenu-${index}` : undefined}
              ariaLabelledby={ariaLabelledby}
            />
          ) : path ? (
            <StyledLink to={disabled ? "" : path}>{titleContent}</StyledLink>
          ) : (
            titleContent
          )}
          {selected && (
            <IconWrapper>
              <Icon icon="check" size="small" color={theme.content.main} />
            </IconWrapper>
          )}
          {icon && iconPosition === "right" && (
            <IconWrapper>
              <Icon icon={icon} size="small" color={resolvedIconColor} />
            </IconWrapper>
          )}
        </ItemContent>
      </Item>
    );
  };

  const renderContent = () => {
    const footerItems = menu.filter(item => item.hasFooter);
    const mainItems = menu.filter(item => !item.hasFooter);
    const hasFooter = footerItems.length > 0;

    return (
      <PopupMenuWrapper
        width={width}
        nested={nested}
        extendContentWidth={extendContentWidth}
        hasFooter={hasFooter}
        role="menu"
        aria-labelledby={ariaLabelledby}
        aria-orientation="vertical"
        data-testid={dataTestid}
      >
        {hasFooter ? (
          <SubMenuScrollable>
            {mainItems.map((item, index) => renderItem(item, index))}
          </SubMenuScrollable>
        ) : (
          mainItems.map((item, index) => renderItem(item, index))
        )}
        {hasFooter && (
          <SubMenuFooter>
            {footerItems.map((item, index) => renderItem(item, index))}
          </SubMenuFooter>
        )}
      </PopupMenuWrapper>
    );
  };

  const renderTrigger = () => {
    if (typeof label === "string") {
      return (
        <LabelWrapper size={size} nested={!!nested}>
          {icon && <Icon icon={icon} size="small" aria-hidden="true" />}
          <Label nested={!!nested}>{label}</Label>
          <Icon
            color={theme.content.weak}
            icon={nested ? "caretRight" : "caretDown"}
            size="small"
          />
        </LabelWrapper>
      );
    }
    if (label) return label;
    if (icon) return <Icon icon={icon} size="small" aria-hidden="true" />;
    return null;
  };

  return (
    <Popup
      open={open}
      placement={placement ?? (nested ? "right-start" : "bottom-start")}
      offset={nested ? MULTILEVEL_OFFSET : DEFAULT_OFFSET}
      onOpenChange={handlePopOver}
      triggerOnHover={!!(triggerOnHover || nested)}
      extendTriggerWidth={!!(extendTriggerWidth || nested)}
      extendContentWidth={extendContentWidth}
      autoClose
      trigger={
        <TriggerWrapper
          onClick={() => handlePopOver()}
          nested={nested}
          data-testid={dataTestid ? `${dataTestid}-trigger` : undefined}
          aria-expanded={open}
        >
          {renderTrigger()}
        </TriggerWrapper>
      }
    >
      {renderContent()}
    </Popup>
  );
};

const TriggerWrapper = styled("div")<{ nested?: boolean }>(({ nested, theme }) => ({
  cursor: css.cursor.pointer,
  display: css.display.flex,
  gap: theme.spacing.smallest,
  alignItems: css.alignItems.center,
  justifyContent: nested ? "space-between" : "normal"
}));

const PopupMenuWrapper = styled("div", {
  shouldForwardProp: (prop) => prop !== "hasFooter"
})<{
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  nested?: boolean;
  extendContentWidth?: boolean;
  hasFooter?: boolean;
}>(({ width, minWidth, maxWidth, nested, extendContentWidth, hasFooter, theme }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  gap: `${theme.spacing.micro}px`,
  padding: `${theme.spacing.micro}px`,
  backgroundColor: theme.bg[1],
  boxShadow: theme.shadow.popup,
  borderRadius: `${theme.radius.small}px`,
  border: `1px solid ${theme.outline.weaker}`,
  width: extendContentWidth ? "100%" : width ? `${width}px` : "fit-content",
  minWidth: `${minWidth ?? DEFAULT_MIN_WIDTH}px`,
  maxWidth: maxWidth ? `${maxWidth}px` : width ? undefined : `${DEFAULT_MAX_WIDTH}px`,
  maxHeight: "250px",
  overflowY: hasFooter ? css.overflow.hidden : css.overflow.auto,
  boxSizing: css.boxSizing.borderBox,
  margin: nested ? "-7px 0 0 2px" : "inherit",
  ...theme.scrollBar
}));

const Item = styled("div")<{
  hasBorderBottom: boolean;
  size?: "small" | "normal";
  disabled?: boolean;
}>(({ hasBorderBottom, size, disabled, theme }) => ({
  display: css.display.flex,
  gap: theme.spacing.small,
  alignItems: css.alignItems.center,
  padding:
    size === "small"
      ? `${theme.spacing.micro}px ${theme.spacing.smallest}px`
      : `${theme.spacing.smallest}px ${theme.spacing.small}px`,
  borderRadius: `${theme.radius.smallest}px`,
  borderBottom: hasBorderBottom ? `1px solid ${theme.outline.weaker}` : "",
  cursor: disabled ? "default" : "pointer",
  backgroundColor: "transparent",
  "&:hover": {
    backgroundColor: theme.bg[2]
  }
}));

const StyledLink = styled(Link)(() => ({
  textDecoration: css.textDecoration.none,
  flex: 1,
  display: css.display.flex
}));

const IconWrapper = styled("div")(() => ({
  flexGrow: 0,
  flexShrink: 0,
  fontSize: 0
}));

const GroupHeaderWrapper = styled("div")(({ theme }) => ({
  display: css.display.flex,
  alignItems: css.alignItems.center,
  gap: `${theme.spacing.micro}px`,
  padding: `${theme.spacing.small}px ${theme.spacing.smallest}px 0 ${theme.spacing.small}px`
}));


const ItemContent = styled("div")(() => ({
  display: css.display.flex,
  justifyContent: css.justifyContent.spaceBetween,
  alignItems: css.alignItems.center,
  flexGrow: 1,
  overflow: css.overflow.hidden
}));

const Label = styled("p")<{ nested: boolean }>(({ nested, theme }) => ({
  padding: "0 4px 0 0",
  fontSize: theme.fonts.sizes.body,
  flex: 1,
  color: nested ? theme.content.main : theme.content.weak,
  fontWeight: nested ? "normal" : "bold",
  whiteSpace: css.whiteSpace.nowrap,
  overflow: css.overflow.hidden,
  textOverflow: css.textOverflow.ellipsis
}));

const LabelWrapper = styled("div")<{
  size?: "small" | "normal";
  nested: boolean;
}>(({ size, nested, theme }) => ({
  display: css.display.flex,
  gap: theme.spacing.smallest,
  alignItems: css.alignItems.center,
  padding: nested
    ? "0px"
    : size === "small"
      ? `${theme.spacing.micro}px ${theme.spacing.small}px`
      : `${theme.spacing.smallest}px ${theme.spacing.small}px`,
  borderRadius: "4px",
  flex: 1,
  overflow: css.overflow.hidden,
  "&:hover": {
    background: theme.bg[2],
    p: { color: theme.content.main }
  }
}));

const SubMenuScrollable = styled("div")(({ theme }) => ({
  overflowY: css.overflow.auto,
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  gap: `${theme.spacing.micro}px`,
  flex: 1,
  minHeight: 0,
  ...theme.scrollBar
}));

const SubMenuFooter = styled("div")(({ theme }) => ({
  borderTop: `1px solid ${theme.outline.weaker}`,
  paddingTop: `${theme.spacing.micro}px`,
  flexShrink: 0
}));

const TitleWrapper = styled("div", {
  shouldForwardProp: (prop) => prop !== "itemColor"
})<{ disabled?: boolean; flex?: boolean; itemColor?: string }>(
  ({ theme, disabled, flex, itemColor }) => ({
    fontSize: theme.fonts.sizes.body,
    color: itemColor ?? (disabled ? theme.content.weak : theme.content.main),
    whiteSpace: css.whiteSpace.nowrap,
    overflow: css.overflow.hidden,
    textOverflow: css.textOverflow.ellipsis,
    gap: theme.spacing.small,
    flex: 1,
    ...(flex
      ? { display: css.display.flex, alignItems: css.alignItems.center }
      : {})
  })
);
