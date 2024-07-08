import { FC } from "react";

import { styled } from "@reearth/services/theme";

export type RadioProps = {
  value?: string;
  label?: string;
  disabled?: boolean;
  checked?: boolean;
  onChange?: (value: string) => void;
};

export const Radio: FC<RadioProps> = ({ value, label, disabled, checked, onChange }) => {
  const handleChange = () => {
    if (disabled) return;
    onChange?.(value || "");
  };

  return (
    <RadioWrapper>
      <RadioInput
        type="radio"
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={handleChange}
      />
      <RadioButton checked={checked} disabled={disabled} onClick={handleChange}>
        {checked && !disabled && <RadioIndicator checked={checked} />}
      </RadioButton>
      {label && <RadioLabel disabled={disabled}>{label}</RadioLabel>}
    </RadioWrapper>
  );
};

const RadioWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing.smallest,
}));

const RadioIndicator = styled("div")<{ checked?: boolean }>(({ checked, theme }) => ({
  width: "6px",
  height: "6px",
  borderRadius: "50%",
  background: checked ? theme.select.main : theme.content.main,
}));

const RadioLabel = styled("div")<{ disabled?: boolean }>(({ disabled, theme }) => ({
  color: disabled ? theme.content.weak : theme.content.main,
  fontSize: theme.fonts.sizes.body,
  fontWeight: theme.fonts.weight.regular,
  minWidth: "40px",
  cursor: disabled ? "not-allowed" : "pointer",
  flexGrow: 1,
}));

const RadioInput = styled("input")(() => ({
  position: "absolute",
  opacity: 0,
  width: 0,
  height: 0,
}));

const RadioButton = styled("div")<{ checked?: boolean; disabled?: boolean }>(
  ({ checked, disabled, theme }) => ({
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    border: disabled
      ? `1px solid ${theme.content.weak}`
      : checked
      ? `1px solid ${theme.select.main}`
      : `1px solid ${theme.content.main}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: disabled ? "not-allowed" : "pointer",
  }),
);
