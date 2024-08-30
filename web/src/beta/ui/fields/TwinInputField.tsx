import {
  NumberInput,
  NumberInputProps,
  Typography
} from "@reearth/beta/lib/reearth-ui";
import { styled, useTheme } from "@reearth/services/theme";
import { FC, useCallback, useEffect, useState } from "react";

import CommonField, { CommonFieldProps } from "./CommonField";

type commonTupleProps = [number, number];
export type TwinInputFieldProps = CommonFieldProps &
  Omit<NumberInputProps, "onBlur" | "onChange" | "placeholder" | "value"> & {
    values: commonTupleProps;
    placeholders?: [string, string];
    content?: [string, string];
    onChange?: (values: commonTupleProps) => void;
    onBlur?: (values: commonTupleProps) => void;
  };

const TwinInputField: FC<TwinInputFieldProps> = ({
  commonTitle,
  description,
  values,
  placeholders,
  content,
  onChange,
  onBlur,
  ...props
}) => {
  const [inputValues, setInputValues] = useState<commonTupleProps>(values);
  const theme = useTheme();

  useEffect(() => {
    setInputValues(values);
  }, [values]);

  const handleChange = useCallback(
    (index: number, value?: number) => {
      if (value === undefined || Number.isNaN(value)) return;
      const newValues = [...inputValues] as commonTupleProps;
      newValues[index] = value;
      setInputValues(newValues);
      onChange?.(newValues);
    },
    [inputValues, onChange]
  );

  const handleBlur = useCallback(() => {
    onBlur?.(inputValues);
  }, [inputValues, onBlur]);

  return (
    <CommonField commonTitle={commonTitle} description={description}>
      <Wrapper>
        {inputValues.map((value, index) => (
          <InputWrapper key={index}>
            <NumberInput
              value={value}
              onChange={(newValue) => handleChange(index, newValue)}
              onBlur={handleBlur}
              placeholder={placeholders?.[index]}
              extendWidth
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

export default TwinInputField;

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
  width: "100%",
  boxSizing: "border-box"
}));
