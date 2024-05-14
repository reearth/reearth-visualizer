import { FC, useCallback, useEffect, useState, ChangeEvent } from "react";

import { fonts, styled } from "@reearth/services/theme";

export type TextInputProps = {
  value?: string;
  placeholder?: string;
  size?: "normal" | "small";
  disabled?: boolean;
  appearance?: "readonly" | "present";
  actions?: FC[];
  onChange?: (text: string) => void;
  onBlur?: (text: string) => void;
};

export const TextInput: FC<TextInputProps> = ({
  value,
  placeholder,
  size = "normal",
  disabled,
  appearance,
  actions,
  onChange,
  onBlur,
}) => {
  const [currentValue, setCurrentValue] = useState(value ?? "");
  const [isFocused, setIsFocused] = useState(false);
  const readOnly = appearance === "readonly" || (appearance === "present" && !disabled);

  useEffect(() => {
    setCurrentValue(value ?? "");
  }, [value]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const newValue = e.currentTarget.value;
      if (newValue === undefined) return;
      setCurrentValue(newValue ?? "");
      onChange?.(currentValue);
    },
    [currentValue, onChange],
  );

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    onBlur?.(currentValue);
  }, [currentValue, onBlur]);

  const handleFocus = useCallback(() => {
    if (readOnly) return;
    setIsFocused(true);
  }, [readOnly]);

  return (
    <Wrapper size={size} appearance={appearance} status={isFocused ? "active" : "default"}>
      <StyledInput
        value={currentValue}
        placeholder={placeholder}
        disabled={disabled}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        appearance={appearance}
        readOnly={readOnly}
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
}>(({ size, theme, appearance, status }) => {
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
    background: theme.bg[1],
    display: "flex",
    gap: theme.spacing.smallest,
    alignItems: "center",
    padding:
      size === "small"
        ? `${theme.spacing.micro}px ${theme.spacing.smallest}px`
        : `${theme.spacing.smallest}px ${theme.spacing.small}px`,
    boxShadow: theme.shadow.input,
  };
});

const StyledInput = styled("input")<{
  disabled?: boolean;
  appearance?: "readonly" | "present";
}>(({ theme, disabled, appearance }) => ({
  outline: "none",
  border: "none",
  background: "none",
  color: disabled ? theme.content.weaker : theme.content.main,
  flex: 1,
  cursor: appearance === "readonly" ? "not-allowed" : disabled ? "not-allowed" : "auto",
  colorScheme: theme.colorSchema,
  "::placeholder": {
    color: theme.content.weak,
  },
  fontSize: fonts.sizes.body,
  lineHeight: `${fonts.lineHeights.body}px`,
  textOverflow: "ellipsis",
  overflow: "hidden",
}));

const ActionsWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.smallest,
  flexShrink: 0,
  padding: theme.spacing.micro,
  color: theme.content.weak,
}));
