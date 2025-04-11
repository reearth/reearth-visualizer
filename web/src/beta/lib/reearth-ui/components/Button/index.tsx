import { styled } from "@reearth/services/theme";
import { FC, MouseEvent, ReactNode } from "react";

import { IconName, Icon, IconProps } from "../Icon";

export type ButtonProps = {
  appearance?: "primary" | "secondary" | "dangerous" | "simple";
  disabled?: boolean;
  size?: "normal" | "small";
  iconButton?: boolean;
  icon?: IconName;
  iconRight?: IconName;
  iconColor?: string;
  title?: string;
  extendWidth?: boolean;
  minWidth?: number;
  background?: string;
  tileComponent?: ReactNode;
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  onMouseEnter?: (e: MouseEvent<HTMLElement>) => void;
  onMouseLeave?: (e: MouseEvent<HTMLElement>) => void;
} & Pick<IconProps, "placement" | "tooltipText">;

export const Button: FC<ButtonProps> = ({
  appearance = "secondary",
  icon,
  disabled,
  size = "normal",
  iconButton,
  title,
  iconRight,
  iconColor,
  extendWidth,
  minWidth,
  background,
  tileComponent,
  tooltipText,
  placement,
  onClick,
  onMouseEnter,
  onMouseLeave
}) => {
  return (
    <StyledButton
      disabled={disabled}
      appearance={appearance}
      size={size}
      iconbutton={iconButton ? "true" : "false"}
      extendwidth={extendWidth ? "true" : "false"}
      minwidth={minWidth}
      background={background}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {icon && (
        <Icon
          icon={icon}
          color={iconColor}
          tooltipText={tooltipText}
          placement={placement}
        />
      )}
      {!iconButton && title}
      {iconRight && <Icon icon={iconRight} />}
      {tileComponent}
    </StyledButton>
  );
};

const StyledButton = styled("button")<{
  size: "normal" | "small";
  appearance: "primary" | "secondary" | "dangerous" | "simple";
  iconbutton?: "true" | "false";
  extendwidth?: "true" | "false";
  minwidth?: number;
  background?: string;
}>(
  ({
    appearance,
    size,
    iconbutton,
    extendwidth,
    minwidth,
    background,
    theme
  }) => ({
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: `${theme.spacing.small}px`,
    border:
      appearance === "simple"
        ? "none"
        : `1px solid ${
            appearance === "secondary"
              ? `${theme.outline.weak}`
              : appearance === "primary"
                ? `${theme.primary.main}`
                : `${theme.dangerous.main}`
          }`,
    fontSize: `${theme.fonts.sizes.body}px`,
    padding:
      size === "small"
        ? iconbutton === "true"
          ? `${theme.spacing.micro}px`
          : `${theme.spacing.smallest}px ${theme.spacing.small}px`
        : iconbutton
          ? `${theme.spacing.small}px`
          : `${theme.spacing.small}px ${theme.spacing.large}px`,
    borderRadius:
      size === "small" ? `${theme.radius.small}px` : `${theme.radius.normal}px`,
    color:
      appearance === "primary"
        ? `${theme.primary.main}`
        : appearance === "dangerous"
          ? `${theme.dangerous.main}`
          : `${theme.content.main}`,
    backgroundColor:
      background && appearance !== "simple" && iconbutton === "true"
        ? background
        : appearance === "simple"
          ? "transparent"
          : `${theme.bg[1]}`,
    width: extendwidth === "false" ? "fit-content" : "100%",
    minWidth: minwidth ? `${minwidth}px` : "",
    boxShadow: appearance === "simple" ? "none" : theme.shadow.button,
    ["&:hover"]:
      background && appearance !== "simple" && iconbutton === "true"
        ? {}
        : {
            borderColor: "transparent",
            color: `${theme.content.withBackground}`,
            backgroundColor:
              appearance === "simple"
                ? "transparent"
                : `${theme[appearance].weak}`
          },
    ["&:active"]: {
      borderColor: "transparent",
      color: `${theme.content.withBackground}`,
      backgroundColor:
        background && appearance !== "simple" && iconbutton === "true"
          ? background
          : appearance === "simple"
            ? "transparent"
            : `${theme[appearance].main}`,
      boxShadow: "none"
    },
    ["&:disabled"]: {
      cursor: "not-allowed",
      borderColor: "transparent",
      color: `${theme.content.weaker}`,
      backgroundColor:
        appearance !== "simple" ? `${theme.bg[1]}` : "transparent",
      border:
        appearance === "simple"
          ? `1px solid transparent`
          : `1px solid ${theme.content.weaker}`,
      boxShadow: "none"
    },
    ["& svg"]: {
      width: iconbutton === "true" && size === "small" ? "12px" : "16px",
      height: iconbutton === "true" && size === "small" ? "12px" : "16px"
    }
  })
);
