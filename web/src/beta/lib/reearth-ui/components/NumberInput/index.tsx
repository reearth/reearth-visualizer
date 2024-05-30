import { useState, useCallback, useEffect, FC, ChangeEvent } from "react";

import { fonts, styled } from "@reearth/services/theme";

export type NumberInputProps = {
  value?: number;
  size?: "normal" | "small";
  disabled?: boolean;
  placeholder?: string;
  appearance?: "readonly";
  unit?: string;
  min?: number;
  max?: number;
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
  min,
  max,
  onChange,
  onBlur,
}) => {
  const [currentValue, setCurrentValue] = useState<number | string | undefined>(value);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const currentValue = e.currentTarget.value;
      if (/^-?\d*\.?\d*%?$/.test(currentValue)) {
        const numericValue = Number(currentValue);
        let validatedValue = currentValue;

        if (currentValue !== "") {
          if (min !== undefined && numericValue < min) {
            validatedValue = String(min);
          } else if (max !== undefined && numericValue > max) {
            validatedValue = String(max);
          } else {
            validatedValue = currentValue;
          }
        }

        setCurrentValue(validatedValue);
        onChange?.(validatedValue);
      }
    },
    [max, min, onChange],
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
  width: "100%",
}));

const UnitWrapper = styled("div")(({ theme }) => ({
  color: theme.content.weak,
  fontSize: fonts.sizes.body,
  lineHeight: `${fonts.lineHeights.body}px`,
}));
