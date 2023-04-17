import RCSlider from "rc-slider";
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";

import Flex from "@reearth/components/atoms/Flex";
import theme, { styled, metrics } from "@reearth/theme";
import { metricsSizes } from "@reearth/theme/metrics";

import { FieldProps } from "../types";

export type Props = FieldProps<number> & {
  min?: number;
  max?: number;
  step?: number;
};

const inputRegex = /^\d+\.\d{2,}$/;

const SliderField: React.FC<Props> = ({
  value,
  linked,
  overridden,
  disabled,
  onChange,
  min,
  max,
  step,
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [sliderValue, setSliderValue] = useState(value);
  const isEditing = useRef(false);
  const isDirty = useRef(false);

  const calculatedStep = step ? step : max ? max / 10 : 0.1;

  const opacityMarkers = useMemo(
    () => ({
      [min ?? 0]: min ?? 0,
      [max ? max / 2 : 0.5]: max ? max / 2 : 0.5,
      [max ?? 1]: max ?? 1,
    }),
    [max, min],
  );

  useEffect(() => {
    isDirty.current = false;
    setInputValue(value);
    setSliderValue(value);
  }, [value]);

  const handleChange = useCallback(
    (newValue: string) => {
      if (!onChange || !isEditing.current || !isDirty.current) return;
      if (newValue === "") {
        onChange(undefined);
        isDirty.current = false;
      } else {
        const floatValue = parseFloat(newValue);
        if (
          (typeof max === "number" && isFinite(max) && floatValue > max) ||
          (typeof min === "number" && isFinite(min) && floatValue < min)
        ) {
          setInputValue(value);
          isDirty.current = false;
          return;
        }
        if (!isNaN(floatValue)) {
          onChange(floatValue);
          isDirty.current = false;
        }
      }
    },
    [onChange, min, max, value],
  );

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.currentTarget;

    if (inputRegex.test(target.value)) return;

    setInputValue(target.valueAsNumber);
    isDirty.current = isEditing.current;
  }, []);

  const handleSliderChange = useCallback((value: number) => {
    setInputValue(value);
    setSliderValue(value);
    isDirty.current = isEditing.current;
  }, []);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleChange(e.currentTarget.value);
      }
    },
    [handleChange],
  );

  const handleFocus = useCallback(() => {
    isEditing.current = true;
  }, []);

  const handleBlur = useCallback(
    (e: React.SyntheticEvent<HTMLInputElement>) => {
      handleChange(e.currentTarget.value);
      isEditing.current = false;
    },
    [handleChange],
  );

  return (
    <Wrapper>
      <InputWrapper justify="end">
        <StyledInput
          type="number"
          value={inputValue}
          disabled={disabled}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onFocus={handleFocus}
          onBlur={handleBlur}
          min={min}
          max={max}
          step={calculatedStep}
          linked={linked}
          overridden={overridden}
          inactive={!!disabled}
        />
      </InputWrapper>
      <Flex justify="center">
        <div style={{ width: "90%" }}>
          <StyledSlider
            value={sliderValue}
            min={min}
            max={max}
            step={calculatedStep}
            marks={opacityMarkers}
            onAfterChange={onChange}
            onChange={handleSliderChange}
            dotStyle={{ display: "none" }}
            trackStyle={{
              backgroundColor: theme.properties.focusBorder,
              height: 8,
              marginTop: 1,
              marginLeft: 1,
              borderRadius: "15px",
            }}
            handleStyle={{
              border: "none",
              height: 16,
              width: 16,
              marginTop: -3,
              backgroundColor: theme.properties.focusBorder,
              boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
            }}
            railStyle={{
              backgroundColor: "inherit",
              border: `1px solid ${theme.main.border}`,
              height: 10,
              borderRadius: "15px",
            }}
          />
        </div>
      </Flex>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  text-align: center;
  width: 100%;
`;

const InputWrapper = styled(Flex)`
  margin-bottom: 6px;
`;

type InputProps = Pick<Props, "linked" | "overridden"> & { inactive: boolean };

const StyledInput = styled.input<InputProps>`
  border: 1px solid ${props => props.theme.properties.border};
  background: ${props => props.theme.properties.bg};
  width: 25px;
  height: ${metrics.propertyTextInputHeight - 7}px;
  padding-left: ${metricsSizes.s}px;
  padding-right: ${metricsSizes.s}px;
  outline: none;
  color: ${({ inactive, linked, overridden, theme }) =>
    overridden
      ? theme.main.warning
      : linked
      ? theme.main.link
      : inactive
      ? theme.text.pale
      : theme.properties.contentsText};

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
  }
  &[type="number"] {
    -moz-appearance: textfield;
  }

  &:focus-within {
    border-color: ${({ theme }) => theme.properties.contentsText};
  }
`;

const StyledSlider = styled(RCSlider)`
  .rc-slider-mark-text {
    color: ${({ theme }) => theme.properties.text};
  }

  .rc-slider-mark-text-active {
    color: ${({ theme }) => theme.text.pale};
  }
`;

export default SliderField;
