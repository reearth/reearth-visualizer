import React, { useState, useEffect, useCallback, useRef } from "react";

import Flex from "@reearth/components/atoms/Flex";
import Text from "@reearth/components/atoms/Text";
import { styled, metrics } from "@reearth/theme";
import { metricsSizes } from "@reearth/theme/metrics";

import { FieldProps } from "../types";

export type Props = FieldProps<number> & {
  suffix?: string;
  range?: boolean;
  min?: number;
  max?: number;
};

const NumberField: React.FC<Props> = ({
  value,
  name,
  suffix,
  linked,
  overridden,
  disabled,
  onChange,
  // range,
  min,
  max,
}) => {
  const [innerValue, setInnerValue] = useState(typeof value === "number" ? value + "" : "");
  const isEditing = useRef(false);
  const isDirty = useRef(false);

  useEffect(() => {
    isDirty.current = false;
    setInnerValue(typeof value === "number" ? value + "" : "");
  }, [value]);

  const callChange = useCallback(
    (newValue: string) => {
      if (!onChange || !isEditing.current || !isDirty.current) return;
      if (newValue === "") {
        onChange(null);
        isDirty.current = false;
      } else {
        const floatValue = parseFloat(newValue);
        if (
          (typeof max === "number" && isFinite(max) && floatValue > max) ||
          (typeof min === "number" && isFinite(min) && floatValue < min)
        ) {
          setInnerValue(value || value === 0 ? value + "" : "");
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

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInnerValue(e.currentTarget.value);
    isDirty.current = isEditing.current;
  }, []);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        callChange(e.currentTarget.value);
      }
    },
    [callChange],
  );

  const handleFocus = useCallback(() => {
    isEditing.current = true;
  }, []);

  const handleBlur = useCallback(
    (e: React.SyntheticEvent<HTMLInputElement>) => {
      callChange(e.currentTarget.value);
      isEditing.current = false;
    },
    [callChange],
  );

  return (
    <Wrapper>
      <FormWrapper align="center" linked={linked} overridden={overridden} inactive={!!disabled}>
        <StyledInput
          type="number"
          value={innerValue ?? ""}
          disabled={disabled}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          onFocus={handleFocus}
          onBlur={handleBlur}
          min={min}
          max={max}
          step="any"
        />
        {suffix && (
          <Text size="xs" customColor otherProperties={{ userSelect: "none" }}>
            {suffix}
          </Text>
        )}
      </FormWrapper>
      <Text size="xs">{name}</Text>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  text-align: center;
  width: 100%;
`;

type FormProps = Pick<Props, "linked" | "overridden"> & { inactive: boolean };

const FormWrapper = styled(Flex)<FormProps>`
  border: 1px solid ${props => props.theme.properties.border};
  width: 100%;
  box-sizing: border-box;
  height: ${metrics.propertyTextInputHeight}px;
  padding-left: ${metricsSizes.s}px;
  padding-right: ${metricsSizes.s}px;
  color: ${({ inactive, linked, overridden, theme }) =>
    overridden
      ? theme.main.warning
      : linked
      ? theme.main.link
      : inactive
      ? theme.text.pale
      : theme.properties.contentsText};
  &:focus-within {
    border-color: ${({ theme }) => theme.properties.contentsText};
  }
`;

const StyledInput = styled.input`
  display: block;
  border: none;
  background: ${props => props.theme.properties.bg};
  outline: none;
  color: inherit;
  width: 100%;
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
  }
  &[type="number"] {
    -moz-appearance: textfield;
  }
`;

export default NumberField;
