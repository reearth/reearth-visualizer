import { FC, useCallback, useState } from "react";

import { TextInput, Typography } from "@reearth/beta/lib/reearth-ui";
import { styled } from "@reearth/services/theme";

import CommonField, { CommonFieldProps } from "./CommonField";

export type TwinInputFieldProps = CommonFieldProps & {
  values?: [string, string];
  placeholders?: [string, string];
  disabled?: boolean;
  onChange?: (values: [string, string]) => void;
  onBlur?: (values: [string, string]) => void;
  content?: [string, string];
};

const TwinInputField: FC<TwinInputFieldProps> = ({
  commonTitle,
  description,
  values = ["", ""],
  placeholders = ["", ""],
  disabled,
  onChange,
  onBlur,
  content = ["", ""],
}) => {
  const [inputValues, setInputValues] = useState<[string, string]>(values);

  const handleChange = useCallback(
    (index: number, value: string) => {
      const newValues = [...inputValues] as [string, string];
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
        <TextInputWrapper>
          <TextInput
            value={inputValues[0]}
            placeholder={placeholders[0]}
            disabled={disabled}
            onChange={value => handleChange(0, value)}
            onBlur={handleBlur}
          />
          <Content size="footnote">{content[0]}</Content>
        </TextInputWrapper>
        <TextInputWrapper>
          <TextInput
            value={inputValues[1]}
            placeholder={placeholders[1]}
            disabled={disabled}
            onChange={value => handleChange(1, value)}
            onBlur={handleBlur}
          />
          <Content size="footnote">{content[1]}</Content>
        </TextInputWrapper>
      </InputWrapper>
    </CommonField>
  );
};

export default TwinInputField;

const InputWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  gap: `${theme.spacing.smallest}px`,
}));

const Content = styled(Typography)`
  color: ${({ theme }) => theme.content.weak};
`;

const TextInputWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: `${theme.spacing.smallest}px`,
}));
