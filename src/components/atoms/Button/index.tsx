import React from "react";
import Icon from "@reearth/components/atoms/Icon";
import Text from "@reearth/components/atoms/Text";
import { styled } from "@reearth/theme";
import { metricsSizes } from "@reearth/theme/metrics";

export type Type = "primary" | "secondary" | "danger";

export interface Props {
  className?: string;
  large?: boolean;
  type?: "reset" | "button" | "submit" | undefined;
  buttonType?: Type;
  disabled?: boolean;
  text?: string;
  icon?: string;
  iconRight?: boolean;
  margin?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const Button: React.FC<Props> = ({
  className,
  children,
  large,
  type,
  buttonType,
  disabled,
  text,
  icon,
  iconRight,
  margin,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const hasText = !!text || !!children;
  const iSize = large ? "16px" : "12px";

  const WrappedIcon = icon ? (
    <IconWrapper text={hasText} iconRight={iconRight} large={large}>
      <Icon icon={icon} size={iSize} />
    </IconWrapper>
  ) : null;

  return (
    <StyledButton
      className={className}
      large={large}
      type={type}
      buttonType={buttonType}
      text={hasText}
      disabled={disabled}
      margin={margin}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}>
      {!iconRight && WrappedIcon}
      {large ? (
        <Text size="m" weight="bold" customColor>
          {text}
        </Text>
      ) : (
        <Text size="xs" customColor>
          {text}
        </Text>
      )}
      {children}
      {iconRight && WrappedIcon}
    </StyledButton>
  );
};

type ButtonProps = {
  large?: boolean;
  buttonType?: Type;
  text?: boolean;
  disabled?: boolean;
  margin?: string;
};

const StyledButton = styled.button<ButtonProps>`
  border-radius: ${({ large }) => (large ? "8px" : "6px")};
  border-style: solid;
  border-width: 1px;
  border-color: ${({ buttonType, disabled, theme }) =>
    buttonType === "danger"
      ? disabled
        ? theme.buttonDanger.disabled
        : theme.buttonDanger.color
      : buttonType === "secondary"
      ? disabled
        ? theme.buttonSecondary.disabled
        : theme.buttonSecondary.color
      : disabled
      ? theme.buttonPrimary.disabled
      : theme.buttonPrimary.color};
  background: inherit;
  color: ${({ buttonType, disabled, theme }) =>
    buttonType === "danger"
      ? disabled
        ? theme.buttonDanger.disabled
        : theme.buttonDanger.color
      : buttonType === "secondary"
      ? disabled
        ? theme.buttonSecondary.disabled
        : theme.buttonSecondary.color
      : disabled
      ? theme.buttonPrimary.disabled
      : theme.buttonPrimary.color};
  padding: ${({ large }) =>
    large
      ? `${metricsSizes["s"]}px ${metricsSizes["2xl"]}px`
      : `${metricsSizes["xs"]}px ${metricsSizes["xl"]}px`};
  margin: ${({ margin }) => margin || `${metricsSizes["m"]}px`};
  user-select: none;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  justify-content: center;
  align-items: center;
  display: flex;
  align-items: center;
  &:hover {
    background: ${({ buttonType, disabled, theme }) =>
      disabled
        ? "inherit"
        : buttonType === "danger"
        ? theme.buttonDanger.bgHover
        : buttonType === "secondary"
        ? theme.buttonSecondary.bgHover
        : theme.buttonPrimary.bgHover};
    color: ${({ buttonType, disabled, theme }) =>
      buttonType === "danger"
        ? disabled
          ? theme.buttonDanger.disabled
          : theme.buttonDanger.colorHover
        : buttonType === "secondary"
        ? disabled
          ? theme.buttonSecondary.disabled
          : theme.buttonSecondary.colorHover
        : disabled
        ? theme.buttonPrimary.disabled
        : theme.buttonPrimary.colorHover};
  }
`;

const IconWrapper = styled.span<{ text: boolean; iconRight?: boolean; large?: boolean }>`
  display: inline-flex;
  align-items: center;
  user-select: none;
  margin-left: ${({ text, iconRight, large }) =>
    text && iconRight ? (large ? "12px" : "8px") : "none"};
  margin-right: ${({ text, iconRight, large }) =>
    text && !iconRight ? (large ? "12px" : "8px") : "none"};
`;

export default Button;
