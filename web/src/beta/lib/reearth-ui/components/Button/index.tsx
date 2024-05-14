import { FC, useCallback, useState } from "react";

import { styled } from "@reearth/services/theme";

export type ButtonProps = {
  appearance?: "primary" | "secondary" | "dangerous" | "simple";
  disabled?: boolean;
  size?: "normal" | "small";
  iconButton?: boolean;
  icon?: string; // TODO: Icon Name, Use Icon Component
  title?: string;
  onClick?: () => void;
};

export const Button: FC<ButtonProps> = ({
  appearance = "secondary",
  icon = "",
  disabled = false,
  size = "normal",
  iconButton = false,
  title = "",
  onClick,
}) => {
  const [isMouseOver, setIsMouseOver] = useState<boolean>(false);
  const [isActive, setIsActive] = useState<boolean>(false);

  const handleButtonClick = useCallback(() => {
    if (onClick) onClick();
  }, [onClick]);

  return (
    <StyledButton
      disabled={disabled}
      appearance={appearance}
      size={size}
      hover={isMouseOver}
      active={isActive}
      iconButton={iconButton}
      onMouseOver={() => setIsMouseOver(true)}
      onMouseLeave={() => setIsMouseOver(false)}
      onMouseDown={() => setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
      onClick={handleButtonClick}>
      {/* TODD: Use Icon Component based on icon */}
      {iconButton && icon}
      {title}
    </StyledButton>
  );
};

const StyledButton = styled("button")<{
  size: "normal" | "small";
  appearance: "primary" | "secondary" | "dangerous" | "simple";
  hover: boolean;
  active: boolean;
  disabled: boolean;
  iconButton: boolean;
}>(({ disabled, appearance, size, hover, active, theme }) => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: `${theme.spacing.small}`,
  border:
    appearance === "simple"
      ? "none"
      : disabled
      ? `1px solid ${theme.content.weaker}`
      : `1px solid ${
          active || hover
            ? "transparent"
            : appearance === "secondary"
            ? theme.outline.weak
            : appearance === "primary"
            ? theme.primary.main
            : theme.dangerous.main
        }`,
  padding:
    size === "small"
      ? `${theme.spacing.smallest}px ${theme.spacing.small}px`
      : `${theme.spacing.small}px ${theme.spacing.large}px`,
  borderRadius: size === "small" ? `${theme.spacing.smallest}px` : "6px",
  color: disabled
    ? `${theme.content.weaker}`
    : hover
    ? `${theme.content.withBackground}`
    : appearance === "primary"
    ? `${theme.primary.main}`
    : appearance === "dangerous"
    ? `${theme.dangerous.main}`
    : `${theme.content.main}`,
  backgroundColor:
    appearance !== "simple"
      ? disabled
        ? `${theme.bg[1]}`
        : `${!hover ? theme.bg[1] : theme[appearance][`${active ? "main" : "weak"}`]}`
      : "transparent",
  width: "fit-content",
}));
