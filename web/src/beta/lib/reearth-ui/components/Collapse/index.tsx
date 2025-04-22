import { styled } from "@reearth/services/theme";
import { FC, ReactNode, useCallback, useEffect, useState, useId } from "react";

import { Icon } from "../Icon";
import { Typography } from "../Typography";

export type CollapseProps = {
  title?: string;
  titleSuffix?: ReactNode;
  background?: string;
  headerBg?: string;
  size?: "normal" | "small" | "large";
  iconPosition?: "left" | "right";
  weight?: "medium" | "regular" | "bold";
  collapsed?: boolean;
  noPadding?: boolean;
  noShrink?: boolean;
  disabled?: boolean;
  actions?: ReactNode;
  children: ReactNode;
  onCollapse?: (collapsed: boolean) => void;
  id?: string;
  dataTestid?: string;
};

export const Collapse: FC<CollapseProps> = ({
  title,
  titleSuffix,
  background,
  headerBg,
  size = "normal",
  weight = "regular",
  iconPosition = "right",
  collapsed,
  disabled,
  noPadding,
  noShrink,
  actions,
  children,
  onCollapse,
  id,
  dataTestid
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(collapsed ?? false);

  const uniqueId = useId();
  const contentId = id || `${uniqueId}-content`;

  useEffect(() => {
    setIsCollapsed(collapsed ?? false);
  }, [collapsed]);

  const handleCollapse = useCallback(() => {
    if (disabled) return;
    setIsCollapsed(!isCollapsed);
    onCollapse?.(!isCollapsed);
  }, [disabled, isCollapsed, onCollapse]);

  return (
    <StyledWrapper
      isCollapsed={isCollapsed}
      noShrink={noShrink}
      data-testid={dataTestid}
    >
      <StyledHeader
        onClick={handleCollapse}
        isCollapsed={isCollapsed}
        size={size}
        headerBg={headerBg}
        iconPosition={iconPosition}
        disabled={disabled}
        aria-expanded={!isCollapsed}
        aria-controls={contentId}
      >
        <TitleWrapper>
          <Typography
            size="body"
            weight={weight}
            otherProperties={{
              whiteSpace: "nowrap"
            }}
          >
            {title}
          </Typography>
          {titleSuffix}
        </TitleWrapper>
        <ActionsWrapper>
          {actions}
          {!disabled && (
            <IconWrapper isCollapsed={isCollapsed} iconPosition={iconPosition}>
              <Icon size="small" icon="triangle" aria-hidden="true" />
            </IconWrapper>
          )}
        </ActionsWrapper>
      </StyledHeader>
      {!isCollapsed && (
        <ChildWrapper
          id={contentId}
          size={size}
          background={background}
          noPadding={noPadding}
        >
          {children}
        </ChildWrapper>
      )}
    </StyledWrapper>
  );
};

const StyledWrapper = styled("div")<{
  background?: string;
  isCollapsed?: boolean;
  noShrink?: boolean;
}>(({ theme, isCollapsed, noShrink }) => ({
  position: "relative",
  borderRadius: `${theme.radius.small}px`,
  flexGrow: isCollapsed ? 0 : 1,
  flexShrink: noShrink ? 0 : 1,
  display: "flex",
  flexDirection: "column",
  minHeight: 0
}));

const StyledHeader = styled("div")<{
  size?: "normal" | "small" | "large";
  headerBg?: string;
  isCollapsed?: boolean;
  iconPosition?: "left" | "right";
  disabled?: boolean;
}>(({ headerBg, size, isCollapsed, iconPosition, disabled, theme }) => ({
  display: "flex",
  flexDirection: iconPosition === "left" ? "row-reverse" : "row",
  borderRadius: isCollapsed
    ? `${theme.radius.small}px`
    : `${theme.radius.small}px ${theme.radius.small}px 0px 0px`,
  padding:
    size === "normal"
      ? `${theme.spacing.small}px`
      : size === "large"
        ? `${theme.spacing.large}px`
        : `${theme.spacing.smallest}px ${theme.spacing.small}px`,
  minHeight: size === "normal" ? "34px" : "28px",
  gap: iconPosition === "left" ? "8px" : "0px",
  justifyContent: iconPosition === "left" ? "flex-end" : "space-between",
  alignItems: "center",
  color: `${theme.content.main}`,
  cursor: disabled ? "auto" : "pointer",
  backgroundColor: headerBg ? headerBg : `${theme.bg[1]}`,
  fontSize: 0,
  boxSizing: "border-box"
}));

const TitleWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.small,
  overflow: "hidden"
}));

const ActionsWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.micro
}));

const ChildWrapper = styled("div")<{
  size?: "normal" | "small" | "large";
  background?: string;
  noPadding?: boolean;
}>(({ size, background, noPadding, theme }) => ({
  position: "relative",
  backgroundColor: background ? background : `${theme.bg[1]}`,
  padding: noPadding
    ? 0
    : size === "normal"
      ? `${theme.spacing.normal}px`
      : size === "large"
        ? `${theme.spacing.super}px`
        : `${theme.spacing.small}px`,
  borderRadius: `0px 0px ${theme.radius.small}px ${theme.radius.small}px`,
  flexGrow: 1,
  display: "flex",
  flexDirection: "column",
  overflowY: "auto",
  overflowX: "hidden"
}));

const IconWrapper = styled("div")<{
  isCollapsed?: boolean;
  iconPosition?: "left" | "right";
}>(({ isCollapsed, iconPosition }) => ({
  rotate:
    iconPosition === "left"
      ? isCollapsed
        ? "-180deg"
        : "-90deg"
      : isCollapsed
        ? "0deg"
        : "-90deg",
  transition: "rotate 0.2s ease-in",
  width: 16,
  height: 16,
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
}));
