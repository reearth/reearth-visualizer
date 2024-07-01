import { FC, useCallback, useState } from "react";

import { TextInput, Typography } from "@reearth/beta/lib/reearth-ui";
import { styled } from "@reearth/services/theme";

import CommonField, { CommonFieldProps } from "./CommonField";

export type TripletInputFieldProps = CommonFieldProps & {
  values?: [string, string, string];
  placeholders?: [string, string, string];
  disabled?: boolean;
  onChange?: (values: [string, string, string]) => void;
  onBlur?: (values: [string, string, string]) => void;
  content?: [string, string, string];
};

const TripletInputField: FC<TripletInputFieldProps> = ({
  commonTitle,
  description,
  values = ["", "", ""],
  placeholders = ["", "", ""],
  disabled,
  onChange,
  onBlur,
  content = ["", "", ""],
}) => {
  const [inputValues, setInputValues] = useState<[string, string, string]>(values);

  const handleChange = useCallback(
    (index: number, value: string) => {
      const newValues = [...inputValues] as [string, string, string];
      newValues[index] = value;
      setInputValues(newValues);
      onChange?.(newValues);
    },
    [inputValues, onChange],
  );

  const handleBlur = useCallback(() => {
    onBlur?.(inputValues);
  }, [inputValues, onBlur]);

  return (
    <CommonField commonTitle={commonTitle} description={description}>
      <InputWrapper>
        {inputValues.map((value, index) => (
          <TextInputWrapper key={index}>
            <TextInput
              value={value}
              placeholder={placeholders[index]}
              disabled={disabled}
              onChange={value => handleChange(index, value)}
              onBlur={handleBlur}
            />
            <Content size="footnote">{content[index]}</Content>
          </TextInputWrapper>
        ))}
      </InputWrapper>
    </CommonField>
  );
};

export default TripletInputField;

const InputWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  gap: `${theme.spacing.smallest}px`,
}));

const Content = styled(Typography)(({ theme }) => ({
  color: `${theme.content.weak}`,
}));

const TextInputWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: `${theme.spacing.smallest}px`,
}));
