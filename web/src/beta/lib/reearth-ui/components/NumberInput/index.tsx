import { useState, useCallback, useEffect, FC, ChangeEvent } from "react";

import { fonts, styled } from "@reearth/services/theme";

export type NumberInputProps = {
  value?: number | string;
  size?: "normal" | "small";
  disabled?: boolean;
  placeholder?: string;
  appearance?: "readonly";
  extendWidth?: boolean;
  unit?: string;
  min?: number;
  max?: number;
  onChange?: (value?: number) => void;
  onBlur?: (value?: number) => void;
};

export const NumberInput: FC<NumberInputProps> = ({
  value,
  size = "normal",
  disabled,
  placeholder,
  appearance,
  extendWidth,
  unit,
  min,
  max,
  onChange,
  onBlur,
}) => {
  const [currentValue, setCurrentValue] = useState<string>(value?.toString() ?? "");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setCurrentValue(value?.toString() ?? "");
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
        onChange?.(currentValue === "" ? undefined : parseFloat(validatedValue));
      }
    },
    [max, min, onChange],
  );

  const handleBlur = useCallback(() => {
    let value = currentValue;
    if (typeof value === "string") {
      value = value.replace(/^(-?)0+(?=\d)/, "$1");
      if (/^-?\d+(\.\d+)?$/.test(value)) {
        value = Number(value).toString();
      }
    }
    setCurrentValue(value);
    setIsFocused(false);
    onBlur?.(parseFloat(value));
  }, [onBlur, currentValue]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  return (
    <Wrapper size={size} status={isFocused ? "active" : "default"} extendWidth={extendWidth}>
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
  extendWidth?: boolean;
}>(({ size, theme, status, extendWidth }) => {
  return {
    border:
      status === "active" ? `1px solid ${theme.select.main}` : `1px solid ${theme.outline.weak}`,
    borderRadius: theme.radius.small,
    background: theme.bg[1],
    display: "flex",
    flex: 1,
    gap: theme.spacing.smallest,
    alignItems: "center",
    padding:
      size === "small"
        ? `0 ${theme.spacing.smallest}px`
        : `${theme.spacing.smallest}px ${theme.spacing.small}px`,
    boxShadow: theme.shadow.input,
    width: !extendWidth ? "" : "100%",
    boxSizing: "border-box",
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
  pointerEvents: disabled ? "none" : "inherit",
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
