import { Icon, IconName } from "@reearth/app/lib/reearth-ui";
import { styled } from "@reearth/services/theme";
import { FC, ReactNode } from "react";

export type TreeItemType = {
  id: string;
  label: string;
  areaCode: string;
};

export type TreeItemProps = {
  id: string;
  label: string;
  icon?: IconName;
  level?: number;
  selected?: boolean;
  children?: ReactNode;
  onClick?: (id: string) => void;
};

const TreeItem: FC<TreeItemProps> = ({
  id,
  label,
  icon,
  level = 0,
  selected,
  onClick,
  children
}) => {
  return (
    <>
      <Content
        level={level}
        onClick={() => onClick && onClick(id)}
        selected={selected}
      >
        {icon && <StyledIcon icon={icon} />}
        {label}
      </Content>
      {children}
    </>
  );
};

export default TreeItem;

const Content = styled("div")<{
  level: number;
  selected?: boolean;
  disabled?: boolean;
  hasChildren?: boolean;
}>(({ theme, selected, disabled, level }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.smallest,
  cursor: disabled ? "not-allowed" : "pointer",
  padding: `${theme.spacing.smallest}px`,
  paddingLeft: `${level * 20 + theme.spacing.small}px`,
  borderRadius: theme.radius.small,
  backgroundColor: selected ? theme.select.main : "transparent",
  color: selected ? theme.content.withBackground : theme.content.main,
  userSelect: "none",
  fontSize: theme.fonts.sizes.body,

  "&:hover":
    !disabled && !selected
      ? {
          backgroundColor: theme.bg[2]
        }
      : {},

  "&:focus": {
    outline: `2px solid ${theme.primary.main}`,
    outlineOffset: "2px"
  }
}));

const StyledIcon = styled(Icon)(() => ({
  flexShrink: 0
}));
