import { FC, useCallback, useState } from "react";

import { NumberInput } from "@reearth/beta/lib/reearth-ui";
import { styled } from "@reearth/services/theme";

import CommonField, { CommonFieldProps } from "./CommonField";

export type SpacingFieldProps = CommonFieldProps & {
  values?: [number, number, number, number];
  placeholders?: [string, string, string, string];
  disabled?: boolean;
  onChange?: (values: [number, number, number, number]) => void;
  onBlur?: (values: [number, number, number, number]) => void;
  unit?: string;
};

const SpacingField: FC<SpacingFieldProps> = ({
  commonTitle,
  description,
  values = [0, 0, 0, 0],
  placeholders = ["", "", "", ""],
  disabled,
  onChange,
  unit,
  onBlur,
}) => {
  const [inputValues, setInputValues] = useState<[number, number, number, number]>(values);

  const handleChange = useCallback(
    (index: number, value?: number) => {
      const newValues = [...inputValues] as [number, number, number, number];
      newValues[index] = value ?? 0;
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
          <NumberInput
            value={inputValues[0]}
            placeholder={placeholders[0]}
            disabled={disabled}
            onChange={value => handleChange(0, value)}
            onBlur={handleBlur}
            unit={unit}
          />
        </CenteredInput>
        <Row>
          <NumberInput
            value={inputValues[1]}
            placeholder={placeholders[1]}
            disabled={disabled}
            onChange={value => handleChange(1, value)}
            onBlur={handleBlur}
            unit={unit}
          />
          <NumberInput
            value={inputValues[2]}
            placeholder={placeholders[2]}
            disabled={disabled}
            onChange={value => handleChange(2, value)}
            onBlur={handleBlur}
            unit={unit}
          />
        </Row>
        <CenteredInput>
          <NumberInput
            value={inputValues[3]}
            placeholder={placeholders[3]}
            disabled={disabled}
            onChange={value => handleChange(3, value)}
            onBlur={handleBlur}
            unit={unit}
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
  gap: ${({ theme }) => theme.spacing.small}px;
`;

const CenteredInput = styled.div`
  display: flex;
  justify-content: center;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
`;
