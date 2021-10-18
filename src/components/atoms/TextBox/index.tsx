import React, { useEffect, useState, useCallback, useRef } from "react";

import Flex from "@reearth/components/atoms/Flex";
import { styled, metrics } from "@reearth/theme";
import fonts from "@reearth/theme/fonts";
import { metricsSizes } from "@reearth/theme/metrics";

export type Props = {
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  type?: "text" | "password";
  multiline?: boolean;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  throttle?: boolean;
  throttleTimeout?: number;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  floatedTextColor?: string;
  doesChangeEveryTime?: boolean;
};

const TextBox: React.FC<Props> = ({
  className,
  value,
  onChange,
  disabled,
  type = "text",
  multiline,
  prefix,
  suffix,
  placeholder,
  throttle,
  throttleTimeout: throttleTimeout = 3000,
  color,
  backgroundColor,
  borderColor,
  floatedTextColor,
  doesChangeEveryTime = false,
}) => {
  const isDirty = useRef(false);
  const [innerValue, setInnerValue] = useState(value);
  const [rows, setRows] = useState(5);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const newValue = e.currentTarget.value;
      isDirty.current = value !== newValue;
      setInnerValue(newValue);
      doesChangeEveryTime && onChange?.(newValue);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [value],
  );

  const handleChangeTextArea = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      handleChange(e);
      if (textAreaRef.current) {
        const lines = e.target.value.split("\n").length;
        setRows(lines > 20 ? 20 : lines < 5 ? 5 : lines);
      }
    },
    [handleChange],
  );

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (onChange && e.key === "Enter" && isDirty.current) {
        onChange(e.currentTarget.value);
      }
    },
    [onChange],
  );

  const handleBlur = useCallback(
    (e: React.SyntheticEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (onChange && isDirty.current) {
        onChange(e.currentTarget.value);
      }
    },
    [onChange],
  );

  useEffect(() => {
    isDirty.current = false;
    setInnerValue(value);
  }, [value]);

  useEffect(() => {
    if (throttle && onChange && isDirty.current) {
      const timeout = setTimeout(() => {
        onChange(innerValue ?? "");
      }, throttleTimeout);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [innerValue, onChange, throttle, throttleTimeout]);

  return (
    <div className={className}>
      <FormWrapper align="center">
        {prefix && (
          <FloatedText floatedTextColor={floatedTextColor} color={color}>
            {prefix}
          </FloatedText>
        )}
        {multiline ? (
          <StyledTextarea
            ref={textAreaRef}
            value={innerValue ?? ""}
            onChange={handleChangeTextArea}
            onBlur={handleBlur}
            color={color}
            backgroundColor={backgroundColor}
            disabled={disabled}
            placeholder={placeholder}
            rows={rows}
          />
        ) : (
          <StyledInput
            value={innerValue ?? ""}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            onBlur={handleBlur}
            color={color}
            type={type}
            backgroundColor={backgroundColor}
            disabled={disabled}
            placeholder={placeholder}
            borderColor={borderColor}
          />
        )}
        {suffix && (
          <FloatedText floatedTextColor={floatedTextColor} color={color}>
            {suffix}
          </FloatedText>
        )}
      </FormWrapper>
    </div>
  );
};

type InputProps = Pick<Props, "color" | "backgroundColor" | "borderColor" | "floatedTextColor">;

const FormWrapper = styled(Flex)<InputProps>`
  box-sizing: border-box;
`;

const StyledInput = styled.input<InputProps>`
  outline: none;
  border: solid 1px;
  border-color: ${({ borderColor, theme }) => borderColor || theme.properties.border};
  background-color: ${({ backgroundColor, theme }) => backgroundColor || theme.properties.bg};
  color: ${({ color, theme }) => color || theme.properties.contentsText};
  height: ${metrics.propertyTextInputHeight}px;
  padding-left: ${metricsSizes.xs}px;
  padding-right: ${metricsSizes.xs}px;
  width: 100%;

  &:focus {
    border-color: ${({ theme }) => theme.properties.focusBorder};
  }
`;

const StyledTextarea = styled.textarea<InputProps>`
  display: block;
  outline: none;
  border: solid 1px;
  border-color: ${({ borderColor, theme }) => borderColor || theme.properties.border};
  background-color: ${({ backgroundColor, theme }) => backgroundColor || theme.properties.bg};
  color: ${({ color, theme }) => color || theme.properties.contentsText};
  width: 100%;
  padding: ${metricsSizes.xs}px;
  margin-top: ${metricsSizes.s}px;
  height: ${metrics.propertyTextareaHeight}px;
  min-height: ${metrics.propertyTextInputHeight}px;

  &:focus {
    border-color: ${({ theme }) => theme.properties.focusBorder};
  }
`;

const FloatedText = styled.span<InputProps>`
  color: ${({ color, floatedTextColor, theme }) =>
    floatedTextColor ||
    theme.properties.contentsFloatText ||
    color ||
    theme.properties.contentsText};
  font-size: ${fonts.sizes.s}px;
  user-select: none;
`;

export default TextBox;
