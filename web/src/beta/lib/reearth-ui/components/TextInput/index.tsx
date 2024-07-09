import { FC, useCallback, useEffect, useState, ChangeEvent } from "react";

import { fonts, styled } from "@reearth/services/theme";

export type TextInputProps = {
  value?: string;
  maxLength?: number;
  placeholder?: string;
  size?: "normal" | "small";
  disabled?: boolean;
  appearance?: "readonly" | "present";
  extendWidth?: boolean;
  autoFocus?: boolean;
  actions?: FC[];
  leftAction?: FC[];
  onChange?: (text: string) => void;
  onBlur?: (text: string) => void;
};

export const TextInput: FC<TextInputProps> = ({
  value,
  maxLength,
  placeholder,
  size = "normal",
  disabled,
  appearance,
  extendWidth,
  actions,
  leftAction,
  autoFocus,
  onChange,
  onBlur,
}) => {
  const [currentValue, setCurrentValue] = useState(value ?? "");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setCurrentValue(value ?? "");
  }, [value]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const newValue = e.currentTarget.value;
      setCurrentValue(newValue ?? "");
      onChange?.(newValue);
    },
    [onChange],
  );

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    onBlur?.(currentValue);
  }, [currentValue, onBlur]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  return (
    <Wrapper
      size={size}
      appearance={appearance}
      extendWidth={extendWidth}
      status={isFocused || autoFocus ? "active" : "default"}>
      {leftAction && (
        <ActionsWrapper>
          {leftAction.map((Action, i) => (
            <Action key={i} />
          ))}
        </ActionsWrapper>
      )}
      <StyledInput
        value={currentValue}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        appearance={appearance}
        autoFocus={autoFocus}
      />
      {actions && (
        <ActionsWrapper>
          {actions.map((Action, i) => (
            <Action key={i} />
          ))}
        </ActionsWrapper>
      )}
    </Wrapper>
  );
};

const Wrapper = styled("div")<{
  size: "normal" | "small";
  appearance?: "readonly" | "present";
  status: "default" | "active";
  extendWidth?: boolean;
}>(({ size, theme, appearance, status, extendWidth }) => {
  const borderStyle =
    appearance === "present"
      ? status === "default"
        ? `1px solid transparent`
        : `1px solid ${theme.select.main}`
      : status === "active"
      ? `1px solid ${theme.select.main}`
      : `1px solid ${theme.outline.weak}`;

  return {
    border: borderStyle,
    borderRadius: theme.radius.small,
    background: appearance === "present" ? "" : theme.bg[1],
    display: "flex",
    flex: 1,
    gap: `${theme.spacing.smallest}px`,
    alignItems: "center",
    padding:
      size === "small"
        ? `0 ${theme.spacing.smallest}px`
        : `${theme.spacing.smallest}px ${theme.spacing.small}px`,
    boxShadow: theme.shadow.input,
    width: !extendWidth ? "" : "100%",
  };
});

const StyledInput = styled("input")<{
  disabled?: boolean;
  appearance?: "readonly" | "present";
}>(({ theme, disabled, appearance }) => ({
  outline: "none",
  border: "none",
  background: "none",
  flex: 1,
  color:
    disabled && appearance !== "present" && appearance !== "readonly"
      ? theme.content.weaker
      : theme.content.main,
  cursor: disabled || appearance === "readonly" ? "not-allowed" : "auto",
  colorScheme: theme.colorSchema,
  fontSize: fonts.sizes.body,
  lineHeight: `${fonts.lineHeights.body}px`,
  textOverflow: "ellipsis",
  pointerEvents: disabled ? "none" : "inherit",
  width: "100%",
  overflow: "hidden",
  "::placeholder": {
    color: theme.content.weak,
  },
}));

const ActionsWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: `${theme.spacing.smallest}px`,
  flexShrink: 0,
}));
