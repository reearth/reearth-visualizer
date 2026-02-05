import {
  NumberInput,
  NumberInputProps,
  Typography
} from "@reearth/app/lib/reearth-ui";
import CommonField, {
  CommonFieldProps
} from "@reearth/app/ui/fields/CommonField";
import { styled, useTheme } from "@reearth/services/theme";
import { FC, useCallback, useEffect, useState } from "react";

type CommonTuple = [number, number, number, number];

export type QuartetInputFieldProps = CommonFieldProps &
  Omit<NumberInputProps, "onBlur" | "onChange" | "placeholder" | "value"> & {
    values: CommonTuple;
    placeholders?: [string, string, string, string];
    content?: [string, string, string, string];
    onChange?: (values: CommonTuple) => void;
    onBlur?: (values: CommonTuple) => void;
  };

const QuartetInputField: FC<QuartetInputFieldProps> = ({
  title,
  description,
  values,
  placeholders,
  content,
  onChange,
  onBlur,
  ...props
}) => {
  const [inputValues, setInputValues] = useState<CommonTuple>(values);

  const theme = useTheme();

  const handleChange = useCallback(
    (index: number, newValue: number | undefined) => {
      if (newValue !== undefined) {
        const newValues = [...inputValues] as CommonTuple;
        newValues[index] = newValue;
        setInputValues(newValues);
        onChange?.(newValues);
      }
    },
    [inputValues, onChange]
  );

  const handleBlur = useCallback(() => {
    onBlur?.(inputValues);
  }, [inputValues, onBlur]);

  useEffect(() => {
    setInputValues(values);
  }, [values]);

  return (
    <CommonField
      title={title}
      description={description}
      data-testid="quartetinputfield-commonfield"
    >
      <Wrapper data-testid="quartetinputfield-wrapper">
        {inputValues.map((value, index) => (
          <InputWrapper
            key={index}
            data-testid={`quartetinputfield-inputwrapper-${index}`}
          >
            <NumberInput
              value={value}
              placeholder={placeholders?.[index]}
              onChange={(newValue) => handleChange(index, newValue)}
              onBlur={handleBlur}
              extendWidth
              {...props}
              data-testid={`quartetinputfield-input-${index}`}
            />
            <Typography
              size="body"
              color={theme.content.weak}
              data-testid={`quartetinputfield-content-${index}`}
            >
              {content?.[index]}
            </Typography>
          </InputWrapper>
        ))}
      </Wrapper>
    </CommonField>
  );
};

export default QuartetInputField;

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
