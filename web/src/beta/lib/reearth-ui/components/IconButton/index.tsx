import { FC, MouseEvent } from "react";

import { styled } from "@reearth/services/theme";

import { IconName, Icon } from "../Icon";

export type IconButtonProps = {
  icon: IconName;
  size?: "normal" | "small" | "smallest" | "large";
  appearance?: "primary" | "secondary" | "dangerous" | "simple";
  active?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: (e: MouseEvent) => void;
};

export const IconButton: FC<IconButtonProps> = ({
  appearance = "secondary",
  icon,
  disabled,
  size = "normal",
  active,
  className,
  onClick,
}) => {
  return (
    <StyledButton
      className={className}
      disabled={disabled}
      appearance={appearance}
      size={size}
      active={active}
      onClick={onClick}>
      <Icon icon={icon} />
    </StyledButton>
  );
};

const StyledButton = styled("button")<{
  size: "normal" | "small" | "smallest" | "large";
  appearance: "primary" | "secondary" | "dangerous" | "simple";
  active?: boolean;
}>(({ appearance, size, active, theme }) => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  width:
    size === "smallest" ? "16px" : size === "small" ? "20px" : size === "large" ? "36px" : "24px",
  height:
    size === "smallest" ? "16px" : size === "small" ? "20px" : size === "large" ? "36px" : "24px",
  borderRadius: size === "small" ? `${theme.radius.small}px` : `${theme.radius.normal}px`,
  color: active
    ? `${theme.content.withBackground}`
    : appearance === "primary"
    ? `${theme.primary.main}`
    : appearance === "dangerous"
    ? `${theme.dangerous.main}`
    : `${theme.content.main}`,
  backgroundColor: active
    ? `${theme["primary"].weak}`
    : appearance === "simple"
    ? "transparent"
    : `${theme.bg[1]}`,
  boxShadow: appearance !== "simple" ? theme.shadow.button : "none",
  ["svg"]: {
    width: size === "small" || size === "smallest" ? "12px" : size === "large" ? "20px" : "16px",
    height: size === "small" || size === "smallest" ? "12px" : size === "large" ? "20px" : "16px",
  },
  ["&:hover"]: {
    color: `${theme.content.withBackground}`,
    backgroundColor: active
      ? `${theme["primary"].weak}`
      : appearance === "simple"
      ? "transparent"
      : `${theme[appearance].weak}`,
  },
  ["&:active"]: {
    color: `${theme.content.withBackground}`,
    backgroundColor: appearance === "simple" ? "transparent" : `${theme[appearance].main}`,
    boxShadow: "none",
  },
  ["&:disabled"]: {
    borderColor: "transparent",
    color: `${theme.content.weaker}`,
    backgroundColor: appearance !== "simple" ? `${theme.bg[1]}` : "transparent",
    boxShadow: "none",
    cursor: "not-allowed",
  },
}));
