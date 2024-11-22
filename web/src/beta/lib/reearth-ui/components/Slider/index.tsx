import { styled } from "@reearth/services/theme";
import RCSlider from "rc-slider";
import { FC, useCallback, useEffect, useMemo, useState } from "react";

import "rc-slider/assets/index.css";

const SliderWithTooltip = RCSlider.createSliderWithTooltip(RCSlider);

export type SliderProps = {
  value: number | undefined;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  onChange?: (value: number) => void;
  onChangeComplete?: (value: number) => void;
};

const getCalculatedStep = (min?: number, max?: number, step?: number) => {
  if (step !== undefined) return step;
  const getPrecision = (num?: number) =>
    num ? num.toString().split(".")[1]?.length || 0 : 0;

  const precision = Math.max(getPrecision(min), getPrecision(max));
  return precision > 0 ? Math.pow(10, -precision) : 0.1;
};

export const Slider: FC<SliderProps> = ({
  value,
  min,
  max,
  step,
  disabled,
  onChange,
  onChangeComplete
}) => {
  const calculatedStep = useMemo(
    () => getCalculatedStep(min, max, step as number),
    [min, max, step]
  );
  const [currentValue, setCurrentValue] = useState(value);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  const handleChange = useCallback(
    (val: number) => {
      setCurrentValue(val);
      onChange?.(val);
    },
    [onChange]
  );

  return (
    <SliderStyled disabled={!!disabled}>
      <SliderWithTooltip
        value={currentValue}
        min={min}
        max={max}
        disabled={disabled}
        step={calculatedStep}
        onChange={handleChange}
        onAfterChange={onChangeComplete}
      />
    </SliderStyled>
  );
};

const SliderStyled = styled("div")<{ disabled: boolean }>(
  ({ disabled, theme }) => ({
    width: "100%",
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
    },
    ".rc-slider-handle, .rc-slider-tooltip-inner": {
      transition: "none !important"
    }
  })
);
