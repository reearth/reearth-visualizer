import { Icon, IconName } from "@reearth/beta/lib/reearth-ui";
import Text from "@reearth/beta/ui/widgetui/Text";
import { styled } from "@reearth/services/theme";
import spacingSizes from "@reearth/services/theme/reearthTheme/common/spacing";
import { ReactNode, useMemo } from "react";

export type Type = "primary" | "secondary" | "danger";

export interface Props {
  className?: string;
  children?: ReactNode;
  size?: "medium" | "small";
  buttonType?: Type;
  disabled?: boolean;
  text?: string;
  icon?: IconName;
  iconPosition?: "left" | "right";
  margin?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const Button: React.FC<Props> = ({
  className,
  children,
  size = "medium",
  buttonType = "secondary",
  disabled,
  text,
  icon,
  iconPosition = icon ? "left" : undefined,
  margin,
  onClick,
  onMouseEnter,
  onMouseLeave
}) => {
  const hasText = useMemo(() => {
    return !!text || !!children;
  }, [children, text]);

  const iSize = useMemo(() => (size === "medium" ? 16 : 12), [size]);

  const WrappedIcon = useMemo(() => {
    return icon ? (
      <IconWrapper text={hasText} iconPosition={iconPosition} size={size}>
        <Icon icon={icon} size={iSize} />
      </IconWrapper>
    ) : null;
  }, [hasText, iSize, icon, iconPosition, size]);

  return (
    <StyledButton
      className={className}
      size={size}
      buttonType={buttonType}
      text={hasText}
      disabled={disabled}
      margin={margin}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {iconPosition === "left" && WrappedIcon}
      {size === "medium" ? (
        <Text size="body" customColor>
          {text}
        </Text>
      ) : (
        <Text size="footnote" customColor>
          {text}
        </Text>
      )}
      {children}
      {iconPosition === "right" && WrappedIcon}
    </StyledButton>
  );
};

type ButtonProps = {
  size?: Props["size"];
  buttonType?: Type;
  text?: boolean;
  disabled?: boolean;
  margin?: string;
};

const StyledButton = styled.button<ButtonProps>`
  border-radius: ${({ size }) => (size === "medium" ? "6px" : "4px")};
  border-style: solid;
  border-width: 1px;
  border-color: ${({ buttonType, disabled, theme }) =>
    disabled
      ? theme.content.weak
      : buttonType === "danger"
        ? theme.dangerous.main
        : buttonType === "primary"
          ? theme.primary.main
          : theme.secondary.main};
  background: inherit;
  color: ${({ buttonType, disabled, theme }) =>
    disabled
      ? theme.content.weak
      : buttonType === "danger"
        ? theme.dangerous.main
        : buttonType === "primary"
          ? theme.primary.main
          : theme.secondary.strong};
  &:active,
  &:hover {
    background: ${({ buttonType, disabled, theme }) =>
      disabled
        ? "inherit"
        : buttonType === "danger"
          ? theme.dangerous.main
          : buttonType === "primary"
            ? theme.primary.main
            : theme.secondary.main};
    color: ${({ disabled, theme }) =>
      disabled ? theme.content.weak : theme.content.withBackground};
  }
  padding: ${({ size }) =>
    size === "medium"
      ? `${spacingSizes["small"]}px ${spacingSizes["large"]}px`
      : `${spacingSizes["smallest"]}px ${spacingSizes["small"]}px`};
  margin: ${({ margin }) => margin};
  user-select: none;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  justify-content: center;
  align-items: center;
  display: flex;
  align-items: center;
  box-shadow: ${({ theme }) => theme.shadow.button};
  transition-property: color, background;
  transition-duration: 0.4s;
`;

const IconWrapper = styled.span<{
  text: boolean;
  iconPosition?: Props["iconPosition"];
  size?: Props["size"];
}>`
  display: inline-flex;
  align-items: center;
  user-select: none;
  margin-left: ${({ text, iconPosition, size }) =>
    text && iconPosition === "right"
      ? size === "medium"
        ? "8px"
        : "8px"
      : "none"};
  margin-right: ${({ text, iconPosition, size }) =>
    text && iconPosition === "left"
      ? size === "medium"
        ? "8px"
        : "8px"
      : "none"};
`;
export default Button;
