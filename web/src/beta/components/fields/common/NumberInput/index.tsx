import React, { useState, useCallback, useRef, useEffect } from "react";

import Text from "@reearth/beta/components/Text";
import { useT } from "@reearth/services/i18n";
import { useNotification } from "@reearth/services/state";
import { styled, useTheme } from "@reearth/services/theme";
import { metricsSizes } from "@reearth/services/theme/reearthTheme/common/metrics";

export type Props = {
  className?: string;
  suffix?: string;
  min?: number;
  max?: number;
  disabled?: boolean;
  inputDescription?: string;
  value?: number;
  onChange?: (value?: number | undefined) => void;
};

const NumberInput: React.FC<Props> = ({
  className,
  value,
  inputDescription,
  suffix,
  onChange,
  min,
  max,
  disabled = false,
}) => {
  const [innerValue, setInnerValue] = useState<number | undefined>(value);
  const [, setNotification] = useNotification();

  const isEditing = useRef(false);
  const t = useT();

  const theme = useTheme();

  useEffect(() => {
    setInnerValue(value);
  }, [value]);

  const handleValueChange = useCallback(
    (newValue: number | undefined) => {
      if (!onChange || !isEditing.current) {
        return;
      }

      if (newValue === undefined) {
        setInnerValue(undefined);
        onChange(undefined);
      } else if (typeof max === "number" && isFinite(max) && newValue > max) {
        setNotification({ type: "warning", text: t("You have passed the maximum value.") });
        setInnerValue(undefined);
        onChange(undefined);
      } else if (typeof min === "number" && isFinite(min) && newValue < min) {
        setNotification({ type: "warning", text: t("You have passed the minimum value.") });
        setInnerValue(undefined);
        onChange(undefined);
      } else if (!isNaN(newValue)) {
        setInnerValue(newValue);
        onChange(newValue);
      }
    },
    [onChange, max, min, setNotification, t],
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.currentTarget.value);
    setInnerValue(newValue);
    const minWidth = Math.max(metricsSizes.xs, `${newValue}`.length * 10);
    e.currentTarget.style.width = `${minWidth}px`;
  }, []);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleValueChange(parseFloat(e.currentTarget.value));
      }
    },
    [handleValueChange],
  );

  const handleFocus = useCallback(() => {
    isEditing.current = true;
  }, []);

  const handleBlur = useCallback(
    (e: React.SyntheticEvent<HTMLInputElement>) => {
      handleValueChange(parseFloat(e.currentTarget.value));
      isEditing.current = false;
    },
    [handleValueChange],
  );

  return (
    <Wrapper>
      <InputWrapper inactive={!!disabled} className={className}>
        <StyledInput
          type="number"
          value={innerValue}
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
          <Text size="footnote" color={theme.content.weak} otherProperties={{ userSelect: "none" }}>
            {suffix}
          </Text>
        )}
      </InputWrapper>
      {inputDescription && (
        <Text size="footnote" color={theme.content.weak}>
          {inputDescription}
        </Text>
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
  text-align: center;
`;

const InputWrapper = styled.div<{ inactive: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  background: ${({ theme }) => theme.bg[1]};
  border: 1px solid ${({ theme }) => theme.outline.weak};
  border-radius: 4px;
  padding: ${metricsSizes.xs}px ${metricsSizes.s}px;
  gap: 12px;
  width: auto;
  min-width: min-content;
  max-width: 64px;
  color: ${({ inactive, theme }) => (inactive ? theme.content.weak : theme.content.main)};
  &:focus-within {
    border-color: ${({ theme }) => theme.select.main};
  }
  box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.25) inset;
`;

const StyledInput = styled.input`
  display: block;
  border: none;
  background: ${({ theme }) => theme.bg[1]};
  outline: none;
  color: inherit;
  width: 100%;
  max-width: 64px;
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
  }
  &[type="number"] {
    -moz-appearance: textfield;
  }
`;

export default NumberInput;
