import { NumberInput, NumberInputProps } from "@reearth/app/lib/reearth-ui";
import CommonField, {
  CommonFieldProps
} from "@reearth/app/ui/fields/CommonField";
import { styled } from "@reearth/services/theme";
import { FC, useCallback, useMemo, useState } from "react";

export type SpacingValues = {
  top: number;
  left: number;
  right: number;
  bottom: number;
};

export type SpacingFieldProps = CommonFieldProps &
  Pick<NumberInputProps, "max" | "min" | "disabled"> & {
    value?: SpacingValues;
    onChange?: (values: SpacingValues) => void;
    onBlur?: (values: SpacingValues) => void;
  };

const spacingPosition = ["top", "left", "right", "bottom"];

const SpacingField: FC<SpacingFieldProps> = ({
  title,
  description,
  value,
  onChange,
  onBlur,
  ...props
}) => {
  const [spacingValues, setSpacingValues] = useState<SpacingValues>(
    value || { top: 0, left: 0, right: 0, bottom: 0 }
  );

  const processedSpacingValues = useMemo(
    () =>
      spacingPosition.map(
        (position) => spacingValues[position as keyof SpacingValues]
      ),
    [spacingValues]
  );

  const handleChange = (position: keyof SpacingValues, newValue?: number) => {
    const updatedValues = { ...spacingValues, [position]: newValue };
    setSpacingValues(updatedValues);
    onChange?.(updatedValues);
  };

  const handleBlur = useCallback(() => {
    onBlur?.(spacingValues);
  }, [onBlur, spacingValues]);

  const renderInputs = () => {
    return spacingPosition.map((position, index) => (
      <CenteredInput
        key={index}
        position={position}
        data-testid={`spacingfield-input-${position}`}
      >
        <NumberInput
          value={processedSpacingValues[index]}
          onChange={(value) =>
            handleChange(position as keyof SpacingValues, value)
          }
          onBlur={handleBlur}
          unit="px"
          {...props}
          data-testid={`spacingfield-numberinput-${position}`}
        />
      </CenteredInput>
    ));
  };

  return (
    <CommonField
      title={title}
      description={description}
      data-testid="spacingfield-commonfield"
    >
      <InputWrapper data-testid="spacingfield-inputwrapper">
        {renderInputs()}
      </InputWrapper>
    </CommonField>
  );
};

export default SpacingField;

const InputWrapper = styled("div")(({ theme }) => ({
  display: "grid",
  gridTemplateAreas: `
    ". top ."
    "left . right"
    ". bottom ."
  `,
  gap: `${theme.spacing.smallest}px`,
  height: "97px",
  width: "100%",
  position: "relative",
  border: `1px dashed ${theme.outline.weak}`
}));

const CenteredInput = styled("div")<{ position: string }>(({ position }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gridArea: position
}));
