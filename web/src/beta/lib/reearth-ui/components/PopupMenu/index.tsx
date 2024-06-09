import { FC, useCallback, useState } from "react";
import { Link } from "react-router-dom";

import { Popup, Icon, Typography, IconName } from "@reearth/beta/lib/reearth-ui";
import { styled, useTheme } from "@reearth/services/theme";

const MULTLEVEL_OFFSET = 6;
const DEFAULT_OFFSET = 4;
const DEFAULT_MENU_WIDTH = 180;

export type Items = {
  title?: string;
  path?: string;
  icon?: IconName;
  subItem?: Items[];
  onClick?: () => void;
};

export type PopupMenuProps = {
  label?: string;
  icon?: IconName;
  menu: Items[];
  nested?: boolean;
  width?: number;
};

export const PopupMenu: FC<PopupMenuProps> = ({ label, menu, nested, width, icon }) => {
  const [open, setOpen] = useState(false);
  const [hoveredItemIndex, setHoveredItemIndex] = useState<number | null>(null);
  const theme = useTheme();

  const handlePopOver = useCallback(() => setOpen(!open), [open]);

  const renderMenuItems = (menuItems: Items[]) => {
    return (
      <PopupMenuWrapper width={width}>
        {menuItems.map(({ title, path, icon, subItem, onClick }, index) => (
          <Item
            key={index}
            onMouseEnter={() => setHoveredItemIndex(index)}
            onMouseLeave={() => setHoveredItemIndex(null)}
            isHovered={hoveredItemIndex === index}
            onClick={onClick}>
            {icon && <Icon icon={icon} size="small" color={theme.content.weak} />}
            {subItem ? (
              <PopupMenu label={title} menu={subItem} width={width} nested />
            ) : path ? (
              <StyledLink to={path}>
                <Typography size="body">{title}</Typography>
              </StyledLink>
            ) : (
              <Typography size="body">{title}</Typography>
            )}
          </Item>
        ))}
      </PopupMenuWrapper>
    );
  };

  return (
    <Popup
      open={open}
      placement={nested ? "right-start" : "bottom-start"}
      offset={nested ? MULTLEVEL_OFFSET : DEFAULT_OFFSET}
      onOpenChange={handlePopOver}
      trigger={
        <TriggerWrapper onClick={handlePopOver} nested={nested}>
          {icon && <Icon icon={icon} size="small" />}
          {label && (
            <>
              <Typography size="body" weight="regular">
                {label}
              </Typography>
              <Icon
                color={theme.content.weak}
                icon={nested ? "caretRight" : "caretDown"}
                size="small"
              />
            </>
          )}
        </TriggerWrapper>
      }>
      {renderMenuItems(menu)}
    </Popup>
  );
};

const TriggerWrapper = styled("div")<{ nested?: boolean }>(({ nested, theme }) => ({
  cursor: "pointer",
  display: "flex",
  gap: theme.spacing.smallest,
  alignItems: "center",
  justifyContent: nested ? "space-between" : "normal",
}));

const PopupMenuWrapper = styled("div")<{ width?: number }>(({ width, theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: `${theme.spacing.micro}px`,
  padding: `${theme.spacing.micro}px`,
  backgroundColor: `${theme.bg[1]}`,
  boxShadow: `${theme.shadow.popup}`,
  borderRadius: `${theme.radius.small}px`,
  width: width ? `${width}px` : DEFAULT_MENU_WIDTH,
}));

const Item = styled("div")<{ isHovered?: boolean }>(({ theme, isHovered }) => ({
  display: "flex",
  gap: theme.spacing.smallest,
  alignItems: "center",
  padding: `${theme.spacing.micro}px ${theme.spacing.smallest}px`,
  borderRadius: `${theme.radius.smallest}px`,
  cursor: "pointer",
  backgroundColor: isHovered ? `${theme.bg[2]}` : "transparent",
  ["&:hover"]: {
    backgroundColor: `${theme.bg[2]}`,
  },
}));

const StyledLink = styled(Link)(() => ({
  textDecoration: "none",
}));
