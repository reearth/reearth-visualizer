import { FC, ReactNode, useEffect, useState } from "react";

import { styled } from "@reearth/services/theme";

import { Icon } from "../Icon";
import { Typography } from "../Typography";

export type CollapseProps = {
  title?: string;
  background?: string;
  headerBg?: string;
  size?: "normal" | "small";
  collapsed?: boolean;
  children: ReactNode;
};

export const Collapse: FC<CollapseProps> = ({
  title,
  background,
  headerBg,
  size = "normal",
  collapsed,
  children,
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(collapsed ?? false);

  useEffect(() => {
    setIsCollapsed(collapsed ?? false);
  }, [collapsed]);

  return (
    <StyledWrapper background={background}>
      <StyledHeader
        onClick={() => setIsCollapsed(!isCollapsed)}
        isCollapsed={isCollapsed}
        size={size}
        headerBg={headerBg}>
        <Typography size="body">{title}</Typography>
        <IconWrapper isCollapsed={isCollapsed}>
          <Icon size="small" icon="triangle" />
        </IconWrapper>
      </StyledHeader>
      {!isCollapsed && <ChildWrapper size={size}>{children}</ChildWrapper>}
    </StyledWrapper>
  );
};

const StyledWrapper = styled("div")<{
  background?: string;
}>(({ background, theme }) => ({
  backgroundColor: background ? background : `${theme.bg[1]}`,
  borderRadius: `${theme.radius.small}px`,
}));

const StyledHeader = styled("div")<{
  size?: "normal" | "small";
  headerBg?: string;
  isCollapsed?: boolean;
}>(({ headerBg, size, isCollapsed, theme }) => ({
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
  cursor: "pointer",
  backgroundColor: headerBg ?? "",
}));

const ChildWrapper = styled("div")<{
  size?: "normal" | "small";
}>(({ size, theme }) => ({
  padding: size === "normal" ? `${theme.spacing.normal}px` : `${theme.spacing.small}px`,
}));

const IconWrapper = styled("div")<{
  isCollapsed?: boolean;
}>(({ isCollapsed }) => ({
  rotate: isCollapsed ? "0deg" : "-90deg",
  transition: "rotate 0.2s ease-in",
}));
