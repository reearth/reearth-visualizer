import { FC, useCallback, useState } from "react";

import { TextInput } from "@reearth/beta/lib/reearth-ui";
import { styled } from "@reearth/services/theme";

import CommonField, { CommonFieldProps } from "./CommonField";

export type SpacingFieldProps = CommonFieldProps & {
  values?: [string, string, string, string];
  placeholders?: [string, string, string, string];
  disabled?: boolean;
  onChange?: (values: [string, string, string, string]) => void;
  onBlur?: (values: [string, string, string, string]) => void;
};

const SpacingField: FC<SpacingFieldProps> = ({
  commonTitle,
  description,
  values = ["", "", "", ""],
  placeholders = ["", "", "", ""],
  disabled,
  onChange,
  onBlur,
}) => {
  const [inputValues, setInputValues] = useState<[string, string, string, string]>(values);

  const handleChange = useCallback(
    (index: number, value: string) => {
      const newValues = [...inputValues] as [string, string, string, string];
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
        <CenteredInput>
          <TextInput
            value={inputValues[0]}
            placeholder={placeholders[0]}
            disabled={disabled}
            onChange={value => handleChange(0, value)}
            onBlur={handleBlur}
          />
        </CenteredInput>
        <Row>
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
        </Row>
        <CenteredInput>
          <TextInput
            value={inputValues[3]}
            placeholder={placeholders[3]}
            disabled={disabled}
            onChange={value => handleChange(3, value)}
            onBlur={handleBlur}
          />
        </CenteredInput>
      </InputWrapper>
    </CommonField>
  );
};

export default SpacingField;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.small};
`;

const CenteredInput = styled.div`
  display: flex;
  justify-content: center;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
`;
