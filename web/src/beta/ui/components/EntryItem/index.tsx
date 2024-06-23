import { FC, MouseEvent, ReactNode, useCallback, useEffect, useState } from "react";

import { Icon, IconButton, IconName, PopupMenu, PopupMenuItem } from "@reearth/beta/lib/reearth-ui";
import { styled } from "@reearth/services/theme";

export interface EntryItemProps {
  title: ReactNode;
  icon?: IconName;
  dragHandleClassName?: string;
  highlight?: boolean;
  disableHover?: boolean;
  optionsMenu?: PopupMenuItem[];
  optionsMenuWidth?: number;
  hoverActions?: ReactNode[];
  onClick?: (e: MouseEvent) => void;
}

export const EntryItem: FC<EntryItemProps> = ({
  title,
  icon,
  dragHandleClassName,
  highlight,
  disableHover,
  optionsMenu,
  optionsMenuWidth,
  hoverActions,
  onClick,
}) => {
  const [hovered, setHovered] = useState(false);
  const handleMouseEnter = useCallback(() => {
    if (!disableHover) {
      setHovered(true);
    }
  }, [disableHover]);
  const handleMouseLeave = useCallback(() => {
    setHovered(false);
  }, []);

  useEffect(() => {
    if (disableHover) {
      setHovered(false);
    }
  }, [disableHover]);

  const handleOptionsClick = useCallback((e: MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <Wrapper
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      hovered={hovered}
      highlight={highlight}>
      <MainContent className={dragHandleClassName} asDragHandle={!!dragHandleClassName}>
        {icon && (
          <IconWrapper>
            <Icon icon={icon} size="small" />
          </IconWrapper>
        )}
        {typeof title === "string" ? <Title>{title}</Title> : title}
      </MainContent>
      <Actions>
        <HoverActions>{hovered && hoverActions}</HoverActions>
        {optionsMenu && (
          <OptionsWrapper onClick={handleOptionsClick}>
            <PopupMenu
              label={<IconButton icon="dotsThreeVertical" size="small" appearance="simple" />}
              placement="bottom-start"
              menu={optionsMenu}
              width={optionsMenuWidth}
            />
          </OptionsWrapper>
        )}
      </Actions>
    </Wrapper>
  );
};

const Wrapper = styled("div")<{ hovered?: boolean; highlight?: boolean }>(
  ({ theme, hovered, highlight }) => ({
    position: "relative",
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing.smallest,
    borderRadius: theme.radius.small,
    backgroundColor: "transparent",
    minHeight: 28,
    cursor: "pointer",
    ...(hovered && {
      backgroundColor: theme.bg[1],
    }),
    ...(highlight && {
      backgroundColor: theme.primary.weak,
    }),
    ["&:active"]: {
      backgroundColor: highlight
        ? theme.primary.main
        : hovered
        ? theme.relative.light
        : "transparent",
    },
  }),
);

const MainContent = styled("div")<{ asDragHandle?: boolean }>(({ theme, asDragHandle }) => ({
  flex: 1,
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.smallest,
  overflow: "hidden",
  textOverflow: "ellipsis",
  ...(asDragHandle && {
    cursor: "pointer",
  }),
}));

const Title = styled("div")(({ theme }) => ({
  width: "100%",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  color: theme.content.main,
  fontSize: theme.fonts.sizes.body,
  fontWeight: theme.fonts.weight.regular,
}));

const Actions = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.smallest,
}));

const HoverActions = styled("div")(({ theme }) => ({
  display: "flex",
  flexShrink: 0,
  gap: theme.spacing.smallest,
}));

const OptionsWrapper = styled("div")(() => ({
  flexShrink: 0,
}));

const IconWrapper = styled("div")(() => ({
  height: 12,
  flexShrink: 0,
  fontSize: 0,
}));
