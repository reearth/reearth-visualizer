import { styled } from "@reearth/services/theme";
import RCSlider from "rc-slider";
import { FC, useCallback, useEffect, useMemo, useState } from "react";

import "rc-slider/assets/index.css";

export type RangeSliderProps = {
  value: number[] | undefined;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  onChange?: (value: number[]) => void;
  onChangeComplete?: (value: number[]) => void;
  ariaLabel?: string;
  dataTestid?: string;
};

const calculateStep = (min?: number, max?: number, step?: number): number => {
  if (step != undefined) {
    return step;
  } else if (min !== undefined && max !== undefined) {
    const range = max - min;
    let calculatedStep = range / 10;
    if (range % calculatedStep !== 0) {
      const steps = Math.ceil(range / calculatedStep);
      calculatedStep = range / steps;
    }
    return calculatedStep;
  } else {
    return 1;
  }
};

export const RangeSlider: FC<RangeSliderProps> = ({
  value,
  min,
  max,
  step,
  disabled,
  onChange,
  onChangeComplete,
  ariaLabel,
  dataTestid
}) => {
  const calculatedStep = useMemo(
    () => calculateStep(min, max, step),
    [min, max, step]
  );
  const [currentValue, setCurrentValue] = useState<number[] | undefined>(value);

  useEffect(() => {
    if (Array.isArray(value) && value.length === 2) setCurrentValue(value);
  }, [value]);

  const handleChange = useCallback(
    (value: number | number[]) => {
      const arrValue = Array.isArray(value) ? value : [value];
      setCurrentValue(arrValue);
      onChange?.(arrValue);
    },
    [onChange]
  );

  const handleChangeComplete = useCallback(
    (value: number | number[]) => {
      const arrValue = Array.isArray(value) ? value : [value];
      onChangeComplete?.(arrValue);
    },
    [onChangeComplete]
  );

  return (
    <SliderStyled disabled={!!disabled} data-testid={dataTestid}>
      <RCSlider
        range
        value={currentValue}
        min={min}
        max={max}
        disabled={disabled}
        onChange={handleChange}
        onChangeComplete={handleChangeComplete}
        step={calculatedStep}
        aria-label={ariaLabel}
      />
    </SliderStyled>
  );
};

const SliderStyled = styled("div")<{ disabled: boolean }>(
  ({ disabled, theme }) => ({
    width: "100%",
    ".rc-slider": {
      padding: "3px 0"
    },
    ".rc-slider-disabled": {
      backgroundColor: "transparent",
      opacity: disabled ? 0.6 : 1,
      cursor: disabled ? "not-allowed" : "inherit"
    },
    ".rc-slider-rail": {
      height: "8px",
      backgroundColor: theme.outline.weaker,
      boxShadow: theme.shadow.input
    },
    ".rc-slider-handle": {
      backgroundColor: theme.item.default,
      border: theme.primary.weak,
      height: "12px",
      width: "12px",
      marginTop: "-2px"
    },
    ".rc-slider-track": {
      backgroundColor: theme.primary.weak,
      height: "8px"
    },
    ".rc-slider-tooltip-arrow": {
      backgroundColor: "transparent",
      borderTopColor: theme.bg[2],
      bottom: "2px",
      marginLeft: "-8px",
      borderWidth: "9px 8px 0"
    },
    ".rc-slider-tooltip-inner": {
      backgroundColor: theme.bg[2],
      color: theme.content.main,
      boxShadow: theme.shadow.button
    }
  })
);
