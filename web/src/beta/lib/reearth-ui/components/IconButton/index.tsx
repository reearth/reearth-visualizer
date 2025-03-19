import { styled } from "@reearth/services/theme";
import { FC, MouseEvent, useCallback } from "react";

import { IconName, Icon, IconProps } from "../Icon";
import Tooltip from "../Tooltip";

export type IconButtonProps = {
  icon: IconName;
  size?: "normal" | "small" | "smallest" | "medium" | "large";
  appearance?: "primary" | "secondary" | "dangerous" | "simple";
  active?: boolean;
  disabled?: boolean;
  className?: string;
  hasBorder?: boolean;
  iconRotate?: string;
  iconColor?: string;
  stopPropagationOnClick?: boolean;
  onClick?: (e: MouseEvent) => void;
} & Pick<IconProps, "placement" | "tooltipText">;

export const IconButton: FC<IconButtonProps> = ({
  appearance = "secondary",
  icon,
  disabled,
  size = "normal",
  active,
  className,
  iconRotate,
  iconColor,
  stopPropagationOnClick,
  hasBorder,
  tooltipText,
  placement,
  onClick
}) => {
  const handleClick = useCallback(
    (e: MouseEvent) => {
      if (stopPropagationOnClick) e.stopPropagation();
      if (disabled) return;
      onClick?.(e);
    },
    [disabled, stopPropagationOnClick, onClick]
  );
  const iconButtonComponent = (
    <StyledButton
      className={className}
      disabled={disabled}
      appearance={appearance}
      size={size}
      active={active}
      iconRotate={iconRotate}
      onClick={handleClick}
      hasBorder={hasBorder}
    >
      <Icon icon={icon} color={iconColor} />
    </StyledButton>
  );

  return tooltipText ? (
    <Tooltip
      type="custom"
      text={tooltipText}
      placement={placement}
      offset={5}
      triggerComponent={iconButtonComponent}
    />
  ) : (
    iconButtonComponent
  );
};

const StyledButton = styled("button")<{
  size: "normal" | "small" | "smallest" | "medium" | "large";
  appearance: "primary" | "secondary" | "dangerous" | "simple";
  active?: boolean;
  iconRotate?: string;
  hasBorder?: boolean;
}>(({ appearance, size, active, iconRotate, theme, hasBorder }) => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  border: hasBorder ? `1px solid ${theme.outline.weak}` : "none",
  flexShrink: 0,
  width:
    size === "smallest"
      ? "16px"
      : size === "small"
        ? "20px"
        : size === "medium"
          ? "28px"
          : size === "large"
            ? "36px"
            : "24px",
  height:
    size === "smallest"
      ? "16px"
      : size === "small"
        ? "20px"
        : size === "medium"
          ? "28px"
          : size === "large"
            ? "36px"
            : "24px",
  borderRadius:
    size === "small" ? `${theme.radius.small}px` : `${theme.radius.normal}px`,
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
    width:
      size === "small" || size === "smallest"
        ? "12px"
        : size === "large"
          ? "20px"
          : "16px",
    height:
      size === "small" || size === "smallest"
        ? "12px"
        : size === "large"
          ? "20px"
          : "16px",
    transform: iconRotate ? `rotate(${iconRotate})` : "none",
    transition: "transform 0.1s"
  },
  ["&:hover"]: {
    color: `${theme.content.withBackground}`,
    backgroundColor: active
      ? `${theme["primary"].weak}`
      : appearance === "simple"
        ? "transparent"
        : `${theme[appearance].weak}`
  },
  ["&:active"]: {
    color: `${theme.content.withBackground}`,
    backgroundColor:
      appearance === "simple" ? "transparent" : `${theme[appearance].main}`,
    boxShadow: "none"
  },
  ["&:disabled"]: {
    borderColor: "transparent",
    color: `${theme.content.weaker}`,
    backgroundColor: appearance !== "simple" ? `${theme.bg[1]}` : "transparent",
    boxShadow: "none",
    cursor: "not-allowed"
  }
}));
