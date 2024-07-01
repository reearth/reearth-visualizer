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

  const renderInputs = () => {
    return inputValues.map((inputValue, index) => (
      <NumberInput
        key={index}
        value={inputValue}
        placeholder={placeholders[index]}
        disabled={disabled}
        onChange={value => handleChange(index, value)}
        onBlur={handleBlur}
        unit={unit}
      />
    ));
  };

  return (
    <CommonField commonTitle={commonTitle} description={description}>
      <InputWrapper>
        <CenteredInput>{renderInputs()[0]}</CenteredInput>
        <Row>{renderInputs().slice(1, 3)}</Row>
        <CenteredInput>{renderInputs()[3]}</CenteredInput>
      </InputWrapper>
    </CommonField>
  );
};

export default SpacingField;

const InputWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: `${theme.spacing.smallest}px`,
}));

const CenteredInput = styled.div`
  display: flex;
  justify-content: center;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
`;
