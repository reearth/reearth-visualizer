import { FC, useCallback, useEffect, useState } from "react";

import { NumberInput, NumberInputProps, Typography } from "@reearth/beta/lib/reearth-ui";
import { styled, useTheme } from "@reearth/services/theme";

import CommonField, { CommonFieldProps } from "./CommonField";

type commonTurple = [number, number, number, number];
export type TripletInputFieldProps = CommonFieldProps &
  Omit<NumberInputProps, "onBlur" | "onChange" | "placeholder" | "value"> & {
    values: commonTurple;
    placeholders?: [string, string, string, string];
    content?: [string, string, string, string];
    onChange?: (values: commonTurple) => void;
    onBlur?: (values: commonTurple) => void;
  };

const TripletInputField: FC<TripletInputFieldProps> = ({
  commonTitle,
  description,
  values,
  placeholders,
  content,
  onChange,
  onBlur,
  ...props
}) => {
  const [inputValues, setInputValues] = useState<commonTurple>(values);

  const theme = useTheme();
  const handleChange = useCallback(
    (index: number, value: number | string) => {
      const newValues = [...inputValues] as commonTurple;
      const parsedValue = value === "" ? 0 : Number(value);
      newValues[index] = isNaN(parsedValue) ? 0 : parsedValue;
      setInputValues(newValues);
      onChange?.(newValues);
    },
    [inputValues, onChange],
  );

  const handleBlur = useCallback(() => {
    onBlur?.(inputValues);
  }, [inputValues, onBlur]);

  useEffect(() => {
    setInputValues(values);
  }, [values]);

  return (
    <CommonField commonTitle={commonTitle} description={description}>
      <Wrapper>
        {inputValues.map((value, index) => (
          <InputWrapper key={index}>
            <NumberInput
              value={value}
              placeholder={placeholders?.[index]}
              onChange={value => handleChange(index, value as number)}
              onBlur={handleBlur}
              {...props}
            />
            <Typography size="body" color={theme.content.weak}>
              {content?.[index]}
            </Typography>
          </InputWrapper>
        ))}
      </Wrapper>
    </CommonField>
  );
};

export default TripletInputField;

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  gap: `${theme.spacing.smallest}px`,
  alignItems: "flex-start",
}));

const InputWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: theme.spacing.smallest,
}));
