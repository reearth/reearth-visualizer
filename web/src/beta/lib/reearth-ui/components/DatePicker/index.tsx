import { FC, useCallback, useEffect, useState, ChangeEvent } from "react";

import { fonts, styled } from "@reearth/services/theme";

export type DatePickerProps = {
  value?: string;
  disabled?: boolean;
  size?: "normal" | "small";
  onChange?: (text: string) => void;
  onBlur?: (text: string) => void;
};

export const DatePicker: FC<DatePickerProps> = ({ value, disabled, onChange, onBlur }) => {
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
    <Wrapper status={isFocused ? "active" : "default"}>
      <StyledInput
        value={currentValue}
        disabled={disabled}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        type="date"
      />
    </Wrapper>
  );
};

const Wrapper = styled("div")<{
  status: "default" | "active";
}>(({ theme, status }) => {
  return {
    border:
      status === "active" ? `1px solid ${theme.select.main}` : `1px solid ${theme.outline.weak}`,
    borderRadius: theme.radius.small,
    background: theme.bg[1],
    display: "flex",
    gap: `${theme.spacing.smallest}px`,
    alignItems: "center",
    boxShadow: theme.shadow.input,
  };
});

const StyledInput = styled("input")<{
  disabled?: boolean;
}>(({ theme, disabled }) => ({
  outline: "none",
  border: "none",
  background: "none",
  flex: 1,
  color: disabled ? theme.content.weaker : theme.content.main,
  cursor: disabled ? "not-allowed" : "auto",
  colorScheme: theme.colorSchema,
  fontSize: fonts.sizes.body,
  lineHeight: `${fonts.lineHeights.body}px`,
  padding: `${theme.spacing.smallest}px ${theme.spacing.small}px`,
  "::placeholder": {
    color: theme.content.weak,
  },
}));
