import { useState, useCallback, useEffect, FC } from "react";

import { fonts, styled } from "@reearth/services/theme";

export type NumberInputProps = {
  value?: number;
  size?: "normal" | "small";
  disabled?: boolean;
  placeholder?: string;
  appearance?: "readonly";
  unit?: string;
  onChange?: (value?: number | string) => void;
  onBlur?: (value?: number | string) => void;
};

export const NumberInput: FC<NumberInputProps> = ({
  value,
  size = "normal",
  disabled,
  placeholder,
  appearance,
  unit,
  onChange,
  onBlur,
}) => {
  const [currentValue, setCurrentValue] = useState<number | string | undefined>(value);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const currentValue = e.currentTarget.value;
      const numericValue = currentValue.replace(/\D/g, ""); // Remove non-numeric characters
      setCurrentValue(numericValue);
      onChange?.(parseFloat(numericValue));
    },
    [onChange],
  );

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    onBlur?.(currentValue);
  }, [onBlur, currentValue]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  return (
    <Wrapper size={size} status={isFocused ? "active" : "default"}>
      <StyledInput
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={currentValue}
        disabled={disabled}
        placeholder={placeholder}
        appearance={appearance}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
      />
      {unit && <UnitWrapper> {unit}</UnitWrapper>}
    </Wrapper>
  );
};

const Wrapper = styled("div")<{
  size: "normal" | "small";
  status: "default" | "active";
}>(({ size, theme, status }) => {
  return {
    border:
      status === "active" ? `1px solid ${theme.select.main}` : `1px solid ${theme.outline.weak}`,
    borderRadius: theme.radius.small,
    background: theme.bg[1],
    display: "flex",
    gap: theme.spacing.smallest,
    alignItems: "center",
    padding:
      size === "small"
        ? `0 ${theme.spacing.smallest}px`
        : `${theme.spacing.smallest}px ${theme.spacing.small}px`,
    boxShadow: theme.shadow.input,
  };
});

const StyledInput = styled("input")<{
  disabled?: boolean;
  appearance?: "readonly";
}>(({ theme, disabled, appearance }) => ({
  outline: "none",
  border: "none",
  background: "none",
  color: disabled && appearance !== "readonly" ? theme.content.weaker : theme.content.main,
  flex: 1,
  cursor: disabled || appearance === "readonly" ? "not-allowed" : "auto",
  fontSize: fonts.sizes.body,
  lineHeight: `${fonts.lineHeights.body}px`,
  textOverflow: "ellipsis",
  overflow: "hidden",
  "::placeholder": {
    color: theme.content.weak,
  },
}));

const UnitWrapper = styled("div")(({ theme }) => ({
  color: theme.content.weak,
  fontSize: fonts.sizes.body,
  lineHeight: `${fonts.lineHeights.body}px`,
}));
