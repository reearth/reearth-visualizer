import {
  NumberInput,
  NumberInputProps,
  Typography
} from "@reearth/beta/lib/reearth-ui";
import CommonField, {
  CommonFieldProps
} from "@reearth/beta/ui/fields/CommonField";
import { styled, useTheme } from "@reearth/services/theme";
import { FC, useCallback, useEffect, useState } from "react";


type commonTurple = [number, number, number];
export type TripletInputFieldProps = CommonFieldProps &
  Omit<NumberInputProps, "onBlur" | "onChange" | "placeholder" | "value"> & {
    values: commonTurple;
    placeholders?: [string, string, string];
    content?: [string, string, string];
    onChange?: (values: commonTurple) => void;
    onBlur?: (values: commonTurple) => void;
  };

const TripletInputField: FC<TripletInputFieldProps> = ({
  title,
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

  useEffect(() => {
    setInputValues(values);
  }, [values]);

  const handleChange = useCallback(
    (index: number, value?: number) => {
      if (value === undefined || Number.isNaN(value)) return;
      const newValues = [...inputValues] as commonTurple;
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
    <CommonField title={title} description={description}>
      <Wrapper>
        {inputValues.map((value, index) => (
          <InputWrapper key={index}>
            <NumberInput
              value={value}
              placeholder={placeholders?.[index]}
              onChange={(newValue) => handleChange(index, newValue)}
              onBlur={handleBlur}
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

export default TripletInputField;

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
  width: "100%"
}));
