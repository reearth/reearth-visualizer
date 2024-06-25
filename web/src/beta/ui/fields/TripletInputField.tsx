import { FC, useCallback, useState } from "react";

import { TextInput } from "@reearth/beta/lib/reearth-ui";
import { styled } from "@reearth/services/theme";

import CommonField, { CommonFieldProps } from "./CommonField";

export type TripletInputFieldProps = CommonFieldProps & {
  values?: [string, string, string];
  placeholders?: [string, string, string];
  disabled?: boolean;
  onChange?: (values: [string, string, string]) => void;
  onBlur?: (values: [string, string, string]) => void;
};

const TripletInputField: FC<TripletInputFieldProps> = ({
  title,
  description,
  values = ["", "", ""],
  placeholders = ["", "", ""],
  disabled,
  onChange,
  onBlur,
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
        <TextInput
          value={inputValues[2]}
          placeholder={placeholders[2]}
          disabled={disabled}
          onChange={value => handleChange(2, value)}
          onBlur={handleBlur}
        />
      </InputWrapper>
    </CommonField>
  );
};

export default TripletInputField;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.small};
`;
