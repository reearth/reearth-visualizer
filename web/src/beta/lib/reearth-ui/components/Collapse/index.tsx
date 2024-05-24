import { FC, ReactNode, useState } from "react";

import { styled } from "@reearth/services/theme";

import { Icon } from "../Icon";

export type CollapseProps = {
  title?: string;
  background?: string;
  children: ReactNode;
};

export const Collapse: FC<CollapseProps> = ({ title, background, children }) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  return (
    <StyledWrapper background={background}>
      <StyledHeader onClick={() => setIsCollapsed(!isCollapsed)}>
        {title}
        <IconWrapper isCollapsed={isCollapsed}>
          <Icon size="small" icon="triangle" />
        </IconWrapper>
      </StyledHeader>
      {!isCollapsed && <ChildWrapper>{children}</ChildWrapper>}
    </StyledWrapper>
  );
};

const StyledWrapper = styled("div")<{
  background?: string;
}>(({ background, theme }) => ({
  backgroundColor: background ? background : `${theme.bg[1]}`,
  borderRadius: `${theme.radius.small}px`,
}));

const StyledHeader = styled("div")(({ theme }) => ({
  display: "flex",
  padding: `${theme.spacing.small}px`,
  justifyContent: "space-between",
  alignItems: "center",
  color: `${theme.content.main}`,
  cursor: "pointer",
}));

const ChildWrapper = styled("div")(({ theme }) => ({
  padding: `${theme.spacing.normal}px`,
}));

const IconWrapper = styled("div")<{
  isCollapsed?: boolean;
}>(({ isCollapsed }) => ({
  rotate: isCollapsed ? "0deg" : "-90deg",
  transition: "rotate 0.2s ease-in",
}));
