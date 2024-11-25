import {
  NumberInput,
  NumberInputProps,
  Typography
} from "@reearth/beta/lib/reearth-ui";
import { styled, useTheme } from "@reearth/services/theme";
import { FC, useCallback, useEffect, useState } from "react";

import CommonField, { CommonFieldProps } from "./CommonField";

export type RangeFieldProps = CommonFieldProps &
  Omit<NumberInputProps, "onBlur" | "onChange" | "placeholder" | "value"> & {
    values: number[];
    placeholders?: [string, string];
    content?: [string, string];
    min?: number;
    max?: number;
    onChange?: (values: (number | undefined)[]) => void;
    onBlur?: (values: (number | undefined)[]) => void;
  };

const RangeField: FC<RangeFieldProps> = ({
  title,
  description,
  values,
  placeholders,
  content,
  min,
  max,
  onChange,
  onBlur,
  ...props
}) => {
  const [inputValues, setInputValues] = useState<(number | undefined)[]>(
    values ?? []
  );

  const theme = useTheme();
  const handleMinChange = useCallback(
    (value: number | undefined) => {
      const clampedValue =
        min !== undefined && value !== undefined && value < min ? min : value;
      setInputValues((prev) => {
        const next = [clampedValue ?? min, prev[1]];
        onChange?.(next);
        return next;
      });
    },
    [min, onChange]
  );

  const handleMaxChange = useCallback(
    (value: number | undefined) => {
      const clampedValue =
        max !== undefined && value !== undefined && value > max ? max : value;
      setInputValues((prev) => {
        const next = [prev[0], clampedValue ?? max];
        onChange?.(next);
        return next;
      });
    },
    [max, onChange]
  );

  const handleBlur = useCallback(() => {
    onBlur?.(inputValues);
  }, [inputValues, onBlur]);

  useEffect(() => {
    setInputValues(values);
  }, [values]);

  return (
    <CommonField title={title} description={description}>
      <Wrapper>
        <InputWrapper>
          <NumberInput
            value={inputValues[0]}
            placeholder={placeholders?.[0]}
            onChange={handleMinChange}
            onBlur={handleBlur}
            extendWidth
            {...props}
          />
          <Typography size="body" color={theme.content.weak}>
            {content?.[0]}
          </Typography>
        </InputWrapper>
        <Dash>~</Dash>
        <InputWrapper>
          <NumberInput
            value={inputValues[1]}
            placeholder={placeholders?.[1]}
            onChange={handleMaxChange}
            onBlur={handleBlur}
            extendWidth
            {...props}
          />
          <Typography size="body" color={theme.content.weak}>
            {content?.[1]}
          </Typography>
        </InputWrapper>
      </Wrapper>
    </CommonField>
  );
};

export default RangeField;

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  gap: `${theme.spacing.smallest}px`,
  alignItems: "flex-start",
  width: "100%"
}));

const InputWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: theme.spacing.smallest,
  boxSizing: "border-box",
  width: "100%"
}));

const Dash = styled("span")(() => ({
  display: "flex",
  alignItems: "center"
}));
