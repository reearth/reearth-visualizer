import {
  Icon,
  IconButton,
  IconName,
  PopupMenu,
  PopupMenuItem
} from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import {
  FC,
  MouseEvent,
  ReactNode,
  useCallback,
  useEffect,
  useState
} from "react";

export interface EntryItemAction {
  comp: ReactNode;
  keepVisible?: boolean;
}
export interface EntryItemProps {
  title: ReactNode;
  icon?: IconName;
  dragHandleClassName?: string;
  highlighted?: boolean;
  disableHover?: boolean;
  optionsMenu?: PopupMenuItem[];
  optionsMenuWidth?: number;
  actions?: EntryItemAction[];
  onClick?: (e: MouseEvent) => void;
}

export const EntryItem: FC<EntryItemProps> = ({
  title,
  icon,
  dragHandleClassName,
  highlighted,
  disableHover,
  optionsMenu,
  optionsMenuWidth,
  actions,
  onClick
}) => {
  const t = useT();
  const [hovered, setHovered] = useState(false);
  const handleMouseEnter = useCallback(() => {
    if (!disableHover) {
      setHovered(true);
    }
  }, [disableHover]);
  const handleMouseLeave = useCallback(() => {
    setHovered(false);
  }, []);

  // disable hover is used for fix this issue:
  // https://stackoverflow.com/questions/11989289/css-html5-hover-state-remains-after-drag-and-drop
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
      highlight={highlighted}
      smallPaddingRight={!!optionsMenu}
    >
      <MainContent
        className={dragHandleClassName}
        asDragHandle={!!dragHandleClassName}
      >
        {icon && (
          <IconWrapper>
            <Icon icon={icon} size="small" />
          </IconWrapper>
        )}
        {typeof title === "string" ? <Title>{title}</Title> : title}
      </MainContent>
      <Actions>
        {actions?.map(
          (a) => (highlighted || hovered || a.keepVisible) && a.comp
        )}
        {!!optionsMenu && (
          <OptionsWrapper onClick={handleOptionsClick}>
            <PopupMenu
              label={
                <IconButton
                  icon="dotsThreeVertical"
                  size="small"
                  appearance="simple"
                  placement="top"
                  tooltipText={t("More")}
                />
              }
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

const Wrapper = styled("div", {
  shouldForwardProp: (prop) =>
    !["smallPaddingRight", "hovered", "highlight"].includes(prop)
})<{
  hovered?: boolean;
  highlight?: boolean;
  smallPaddingRight?: boolean;
}>(({ theme, hovered, highlight, smallPaddingRight }) => ({
  position: "relative",
  boxSizing: "border-box",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: smallPaddingRight
    ? `${theme.spacing.smallest}px ${theme.spacing.smallest}px ${theme.spacing.smallest}px ${theme.spacing.small}px`
    : `${theme.spacing.smallest}px ${theme.spacing.small}px`,
  borderRadius: theme.radius.small,
  backgroundColor: "transparent",
  minHeight: 28,
  flex: 1,
  minWidth: 0,
  cursor: "pointer",
  ...(hovered && {
    backgroundColor: theme.bg[1]
  }),
  ...(highlight && {
    backgroundColor: theme.select.main
  }),
  ["&:active"]: {
    backgroundColor: highlight
      ? theme.select.strong
      : hovered
        ? theme.relative.light
        : "transparent"
  }
}));

const MainContent = styled("div", {
  shouldForwardProp: (prop) => prop !== "asDragHandle"
})<{ asDragHandle?: boolean }>(({ theme, asDragHandle }) => ({
  flex: 1,
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.smallest,
  overflow: "hidden",
  textOverflow: "ellipsis",
  ...(asDragHandle && {
    cursor: "pointer"
  })
}));

const Title = styled("div")(({ theme }) => ({
  width: "100%",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  color: theme.content.main,
  fontSize: theme.fonts.sizes.body,
  fontWeight: theme.fonts.weight.regular
}));

const Actions = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.smallest
}));

const OptionsWrapper = styled("div")(() => ({
  flexShrink: 0
}));

const IconWrapper = styled("div")(({ theme }) => ({
  height: 12,
  flexShrink: 0,
  fontSize: 0,
  color: theme.content.main
}));
