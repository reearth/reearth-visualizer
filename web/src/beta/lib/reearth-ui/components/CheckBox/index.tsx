import { Icon } from "@reearth/beta/lib/reearth-ui/components/Icon/index";
import { styled, useTheme } from "@reearth/services/theme";
import { FC, useEffect, useState } from "react";

export type CheckBoxProps = {
  value?: boolean;
  disabled?: boolean;
  onChange?: (value: boolean) => void;
};

export const CheckBox: FC<CheckBoxProps> = ({ value, disabled, onChange }) => {
  const [isChecked, setIsChecked] = useState(value);

  const theme = useTheme();

  const handleClick = () => {
    if (disabled) return;
    const newValue = !isChecked;
    setIsChecked(newValue);
    onChange?.(newValue);
  };

  useEffect(() => {
    setIsChecked(value);
  }, [value]);

  return (
    <BoxField
      onClick={handleClick}
      disabled={disabled}
      role="checkbox"
      aria-checked={isChecked}
    >
      {isChecked && (
        <Icon
          icon="check"
          size="large"
          color={disabled ? theme.content.weak : theme.content.main}
        />
      )}
    </BoxField>
  );
};

const BoxField = styled("div")<{ disabled?: boolean }>(
  ({ disabled, theme }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
    width: "16px",
    height: "16px",
    border: `1px solid ${theme.outline.weak}`,
    borderRadius: "4px",
    cursor: disabled ? "not-allowed" : "pointer"
  })
);
