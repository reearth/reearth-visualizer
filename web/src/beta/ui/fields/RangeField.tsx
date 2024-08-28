import {
  NumberInput,
  NumberInputProps,
  Typography,
} from "@reearth/beta/lib/reearth-ui";
import { styled, useTheme } from "@reearth/services/theme";
import { FC, useCallback, useEffect, useState } from "react";

import CommonField, { CommonFieldProps } from "./CommonField";

export type RangeFieldProps = CommonFieldProps &
  Omit<NumberInputProps, "onBlur" | "onChange" | "placeholder" | "value"> & {
    values: number[];
    placeholders?: [string, string];
    content?: [string, string];
    onChange?: (values: number[]) => void;
    onBlur?: (values: number[]) => void;
  };

const RangeField: FC<RangeFieldProps> = ({
  commonTitle,
  description,
  values,
  placeholders,
  content,
  onChange,
  onBlur,
  ...props
}) => {
  const [inputValues, setInputValues] = useState(values);

  const theme = useTheme();
  const handleChange = useCallback(() => {
    const newValues = [...inputValues];
    setInputValues(newValues);
    onChange?.(newValues);
  }, [inputValues, onChange]);

  const handleBlur = useCallback(() => {
    onBlur?.(inputValues);
  }, [inputValues, onBlur]);

  useEffect(() => {
    setInputValues(values);
  }, [values]);

  return (
    <CommonField commonTitle={commonTitle} description={description}>
      <Wrapper>
        <InputWrapper>
          <NumberInput
            value={inputValues[0]}
            placeholder={placeholders?.[0]}
            onChange={handleChange}
            onBlur={handleBlur}
            extendWidth
            {...props}
          />
          <Typography size="body" color={theme.content.weak}>
            {content?.[0]}
          </Typography>
        </InputWrapper>
        <Dash>~</Dash>
        <InputWrapper>
          <NumberInput
            value={inputValues[1]}
            placeholder={placeholders?.[1]}
            onChange={handleChange}
            onBlur={handleBlur}
            extendWidth
            {...props}
          />
          <Typography size="body" color={theme.content.weak}>
            {content?.[1]}
          </Typography>
        </InputWrapper>
      </Wrapper>
    </CommonField>
  );
};

export default RangeField;

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  gap: `${theme.spacing.smallest}px`,
  alignItems: "flex-start",
  width: "100%",
}));

const InputWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: theme.spacing.smallest,
  boxSizing: "border-box",
  width: "100%",
}));

const Dash = styled("span")(() => ({
  display: "flex",
  alignItems: "center",
}));
