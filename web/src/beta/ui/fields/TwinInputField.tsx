import { FC, useCallback, useState } from "react";

import { TextInput } from "@reearth/beta/lib/reearth-ui";
import { styled } from "@reearth/services/theme";

import CommonField, { CommonFieldProps } from "./CommonField";

export type TwinInputFieldProps = CommonFieldProps & {
  values?: [string, string];
  placeholders?: [string, string];
  disabled?: boolean;
  onChange?: (values: [string, string]) => void;
  onBlur?: (values: [string, string]) => void;
};

const TwinInputField: FC<TwinInputFieldProps> = ({
  title,
  description,
  values = ["", ""],
  placeholders = ["", ""],
  disabled,
  onChange,
  onBlur,
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
    <CommonField title={title} description={description}>
      <InputWrapper>
        <TextInput
          value={inputValues[0]}
          placeholder={placeholders[0]}
          disabled={disabled}
          onChange={value => handleChange(0, value)}
          onBlur={handleBlur}
        />
        <TextInput
          value={inputValues[1]}
          placeholder={placeholders[1]}
          disabled={disabled}
          onChange={value => handleChange(1, value)}
          onBlur={handleBlur}
        />
      </InputWrapper>
    </CommonField>
  );
};

export default TwinInputField;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.small};
`;
