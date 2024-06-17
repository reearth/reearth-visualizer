import { FC, ReactNode, useCallback, useEffect, useState } from "react";

import { styled } from "@reearth/services/theme";

import { Icon } from "../Icon";
import { Typography } from "../Typography";

export type CollapseProps = {
  title?: string;
  background?: string;
  headerBg?: string;
  size?: "normal" | "small";
  collapsed?: boolean;
  noPadding?: boolean;
  disabled?: boolean;
  children: ReactNode;
  onCollapse?: (collapsed: boolean) => void;
};

export const Collapse: FC<CollapseProps> = ({
  title,
  background,
  headerBg,
  size = "normal",
  collapsed,
  disabled,
  noPadding,
  children,
  onCollapse,
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(collapsed ?? false);

  useEffect(() => {
    setIsCollapsed(collapsed ?? false);
  }, [collapsed]);

  const handleCollapse = useCallback(() => {
    setIsCollapsed(!isCollapsed);
    onCollapse?.(!isCollapsed);
  }, [isCollapsed, onCollapse]);

  return (
    <StyledWrapper>
      <StyledHeader
        onClick={handleCollapse}
        isCollapsed={isCollapsed}
        size={size}
        headerBg={headerBg}
        disabled={disabled}>
        <Typography size="body">{title}</Typography>
        {!disabled && (
          <IconWrapper isCollapsed={isCollapsed}>
            <Icon size="small" icon="triangle" />
          </IconWrapper>
        )}
      </StyledHeader>
      {!isCollapsed && (
        <ChildWrapper size={size} background={background} noPadding={noPadding}>
          {children}
        </ChildWrapper>
      )}
    </StyledWrapper>
  );
};

const StyledWrapper = styled("div")<{
  background?: string;
}>(({ theme }) => ({
  borderRadius: `${theme.radius.small}px`,
  flex: 1,
}));

const StyledHeader = styled("div")<{
  size?: "normal" | "small";
  headerBg?: string;
  isCollapsed?: boolean;
  disabled?: boolean;
}>(({ headerBg, size, isCollapsed, disabled, theme }) => ({
  display: "flex",
  borderRadius: isCollapsed
    ? `${theme.radius.small}px`
    : `${theme.radius.small}px ${theme.radius.small}px 0px 0px`,
  padding:
    size === "normal"
      ? `${theme.spacing.small}px`
      : `${theme.spacing.smallest}px ${theme.spacing.small}px`,
  justifyContent: "space-between",
  alignItems: "center",
  color: `${theme.content.main}`,
  cursor: disabled ? "auto" : "pointer",
  pointerEvents: disabled ? "none" : "auto",
  backgroundColor: headerBg ?? "",
  fontSize: 0,
}));

const ChildWrapper = styled("div")<{
  size?: "normal" | "small";
  background?: string;
  noPadding?: boolean;
}>(({ size, background, noPadding, theme }) => ({
  backgroundColor: background ? background : `${theme.bg[1]}`,
  padding: noPadding
    ? 0
    : size === "normal"
    ? `${theme.spacing.normal}px`
    : `${theme.spacing.small}px`,
  flex: 1,
  display: "flex",
  flexDirection: "column",
  height: "100%",
}));

const IconWrapper = styled("div")<{
  isCollapsed?: boolean;
}>(({ isCollapsed }) => ({
  rotate: isCollapsed ? "0deg" : "-90deg",
  transition: "rotate 0.2s ease-in",
}));
