import { styled } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC, useEffect, useState } from "react";

export type SwitcherProps = {
  value?: boolean;
  disabled?: boolean;
  onChange?: (value: boolean) => void;
  ariaLabel?: string;
  dataTestid?: string;
};

export const Switcher: FC<SwitcherProps> = ({
  value,
  disabled,
  onChange,
  ariaLabel,
  dataTestid
}) => {
  const [isOn, setIsOn] = useState(!!value);

  const handleClick = () => {
    if (disabled) return;
    const newValue = !isOn;
    setIsOn(newValue);
    onChange?.(newValue);
  };

  useEffect(() => {
    setIsOn(!!value);
  }, [value]);

  return (
    <SwitcherContainer
      onClick={handleClick}
      isOn={isOn}
      disabled={disabled}
      role="switch"
      aria-checked={isOn}
      aria-label={ariaLabel}
      data-testid={dataTestid || "switcher"}
    >
      <SwitcherCircle isOn={isOn} disabled={disabled} />
    </SwitcherContainer>
  );
};

const SwitcherContainer = styled.div<{ isOn: boolean; disabled?: boolean }>(
  ({ isOn, theme, disabled }) => ({
    width: "24px",
    height: "14px",
    borderRadius: theme.radius.large,
    backgroundColor: disabled
      ? theme.outline.weaker
      : isOn
        ? theme.primary.main
        : theme.outline.weaker,
    display: css.display.flex,
    alignItems: css.alignItems.center,
    boxShadow: theme.shadow.input,
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "background-color 0.3s",
    padding: "1px",
    boxSizing: css.boxSizing.borderBox
  })
);

const SwitcherCircle = styled.div<{ isOn: boolean; disabled?: boolean }>(
  ({ isOn, theme, disabled }) => ({
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    backgroundColor: disabled
      ? theme.outline.weak
      : theme.content.withBackground,
    transition: "transform 0.3s",
    transform: isOn ? "translateX(10px)" : "translateX(0)"
  })
);
