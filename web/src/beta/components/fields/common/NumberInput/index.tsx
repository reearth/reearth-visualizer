import { useState, useCallback, useRef, useEffect } from "react";

import Text from "@reearth/beta/components/Text";
import { useT } from "@reearth/services/i18n";
import { useNotification } from "@reearth/services/state";
import { styled, useTheme } from "@reearth/services/theme";
import { metricsSizes } from "@reearth/services/theme/reearthTheme/common/metrics";

export type Props = {
  className?: string;
  value?: number;
  inputDescription?: string;
  suffix?: string;
  min?: number;
  max?: number;
  disabled?: boolean;
  placeholder?: string;
  expandWithContent?: boolean;
  onChange?: (value?: number | undefined) => void;
};

const NumberInput: React.FC<Props> = ({
  className,
  value,
  inputDescription,
  suffix,
  min,
  max,
  disabled = false,
  placeholder,
  expandWithContent,
  onChange,
}) => {
  const [innerValue, setInnerValue] = useState<number | undefined>(value);
  const [, setNotification] = useNotification();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const isEditing = useRef(false);
  const t = useT();

  const theme = useTheme();

  useEffect(() => {
    setInnerValue(value);
  }, [value]);

  useEffect(() => {
    // Calculate and set the minimum width for the input field
    if (inputRef.current && expandWithContent) {
      const minWidth = Math.max(metricsSizes.xs, inputRef.current.value.length * 10);
      inputRef.current.style.width = `${minWidth}px`;
    }
  }, [expandWithContent]);

  const handleValueChange = useCallback(
    (newValue: number | undefined) => {
      if (!onChange || isEditing.current === undefined) {
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
    const newValue = e.currentTarget.value;
    const parsedValue = parseFloat(newValue);
    if (!isNaN(parsedValue)) {
      setInnerValue(parsedValue);
    } else {
      setInnerValue(undefined);
    }
    e.currentTarget.value = parsedValue.toString();
    const minWidth = Math.max(metricsSizes.xs, newValue.length * 10);
    e.currentTarget.style.width = `${minWidth}px`;
  }, []);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        const newValue = parseFloat(e.currentTarget.value) ?? value;

        handleValueChange(isNaN(newValue) ? undefined : newValue);
      }
    },
    [value, handleValueChange],
  );

  const handleFocus = useCallback(() => {
    isEditing.current = true;
  }, []);

  const handleBlur = useCallback(
    (e: React.SyntheticEvent<HTMLInputElement>) => {
      const newValue = parseFloat(e.currentTarget.value) ?? value;
      handleValueChange(newValue);
      isEditing.current = false;
    },
    [value, handleValueChange],
  );

  return (
    <Wrapper className={className}>
      <InputWrapper inactive={!!disabled} expandWithContent={expandWithContent}>
        <StyledInput
          ref={inputRef}
          type="number"
          step="any"
          value={innerValue}
          disabled={disabled}
          min={min}
          max={max}
          placeholder={placeholder}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        {suffix && (
          <TextWrapper
            size="footnote"
            color={theme.content.weak}
            otherProperties={{ userSelect: "none" }}>
            {suffix}
          </TextWrapper>
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
  text-align: center;
  min-width: 0;
`;

const InputWrapper = styled.div<{ inactive: boolean; expandWithContent?: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background: ${({ theme }) => theme.bg[1]};
  border: 1px solid ${({ theme }) => theme.outline.weak};
  border-radius: 4px;
  padding: ${metricsSizes.xs}px ${metricsSizes.s}px;
  gap: 12px;
  box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.25) inset;
  color: ${({ inactive, theme }) => (inactive ? theme.content.weak : theme.content.main)};
  ${({ expandWithContent }) => expandWithContent && "min-width: min-content;"}

  :focus-within {
    border-color: ${({ theme }) => theme.select.main};
  }
`;

const StyledInput = styled.input`
  display: block;
  border: none;
  background: ${({ theme }) => theme.bg[1]};
  outline: none;
  color: inherit;
  min-width: 0;

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
  }
  &[type="number"] {
    -moz-appearance: textfield;
  }
`;

const TextWrapper = styled(Text)`
  flex-shrink: 0;
`;

export default NumberInput;
