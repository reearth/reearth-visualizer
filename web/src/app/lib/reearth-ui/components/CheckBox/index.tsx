import { Icon } from "@reearth/app/lib/reearth-ui/components/Icon/index";
import { styled, useTheme } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC, useEffect, useState } from "react";

export type CheckBoxProps = {
  value?: boolean;
  disabled?: boolean;
  onChange?: (value: boolean) => void;
  ariaLabel?: string;
  dataTestid?: string;
};

export const CheckBox: FC<CheckBoxProps> = ({
  value,
  disabled,
  onChange,
  ariaLabel,
  dataTestid
}) => {
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
      aria-label={ariaLabel}
      data-testid={dataTestid}
    >
      {isChecked && (
        <Icon
          icon="check"
          size="large"
          color={disabled ? theme.content.weak : theme.content.main}
          aria-hidden="true"
        />
      )}
    </BoxField>
  );
};

const BoxField = styled("div")<{ disabled?: boolean }>(
  ({ disabled, theme }) => ({
    display: css.display.flex,
    alignItems: css.alignItems.center,
    justifyContent: css.justifyContent.center,
    boxSizing: css.boxSizing.borderBox,
    width: "16px",
    height: "16px",
    border: `1px solid ${theme.outline.weak}`,
    borderRadius: "4px",
    cursor: disabled ? "not-allowed" : "pointer"
  })
);
