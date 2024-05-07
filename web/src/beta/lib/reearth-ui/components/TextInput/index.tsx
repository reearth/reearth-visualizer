import { FC, useCallback, useEffect, useState, type ChangeEvent } from "react";

import { styled } from "@reearth/services/theme";

export type TextInputProps = {
  value?: string;
  placeholder?: string;
  size?: "normal" | "small";
  disabled?: boolean;
  onChange?: (text: string) => void;
  onBlur?: (text: string) => void;
};

export const TextInput: FC<TextInputProps> = ({
  value,
  placeholder,
  size = "normal",
  disabled,
  onChange,
  onBlur,
}) => {
  const [currentValue, setCurrentValue] = useState(value ?? "");

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
    onChange?.(currentValue);
    onBlur?.(currentValue);
  }, [currentValue, onChange, onBlur]);

  return (
    <Wrapper size={size}>
      <StyledInput
        value={currentValue}
        placeholder={placeholder}
        disabled={disabled}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      {/* TODO: support optional actions */}
    </Wrapper>
  );
};

const Wrapper = styled("div")<{ size: "normal" | "small" }>(({ size, theme }) => ({
  border: `1px solid ${theme.outline.weak}`,
  borderRadius: "4px", // TODO: use theme value
  background: theme.bg[1],
  transition: "all 0.3s", // TODO: use theme value
  display: "flex",
  padding:
    size === "small"
      ? `${theme.spacing.micro}px ${theme.spacing.smallest}px`
      : `${theme.spacing.smallest}px ${theme.spacing.small}px`,
}));

const StyledInput = styled("input")(({ theme, disabled }) => ({
  outline: "none",
  border: "none",
  background: "none",
  color: theme.content.main,
  // ...theme.typography.body, TODO: update theme
  // padding: "4px 8px", // TODO: use theme value
  flex: 1,
  opacity: disabled ? 0.6 : 1, // TODO: use theme value
  pointerEvents: disabled ? "none" : "inherit",
  colorScheme: "dark", // TODO: use theme value
  ":focus": {
    borderColor: theme.outline.main,
  },
}));
