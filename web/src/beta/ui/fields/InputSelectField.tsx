import {
  Selector,
  SelectorProps,
  TextInput,
  TextInputProps
} from "@reearth/beta/lib/reearth-ui";
import { styled } from "@reearth/services/theme";
import { FC, useState } from "react";

import CommonField, { CommonFieldProps } from "./CommonField";

export type InputFieldProps = CommonFieldProps &
  Pick<
    TextInputProps,
    "value" | "placeholder" | "onChange" | "onBlur" | "disabled" | "appearance"
  > &
  Pick<SelectorProps, "displayValue"> & {
    options?: { label?: string; value: string }[];
  };

const InputSelectField: FC<InputFieldProps> = ({
  title,
  description,
  placeholder,
  onBlur,
  options,
  displayValue
}) => {
  // const [selectValue, setSelectValue] = useState<string | undefined>(undefined);
  const [inputValue, setInputValue] = useState<string | undefined>(undefined);

  const handleOnBlur = () => {
    if (onBlur && typeof inputValue === "string") {
      onBlur(inputValue);
    }
  };

  const handleOnChangeSelect = (value: string | string[]) => {
    if (typeof value === "string" && onBlur) {
      setInputValue("${" + value + "}");
      onBlur("${" + value + "}");
    }
  };

  return (
    <CommonField title={title} description={description}>
      <FieldsWrapper>
        <InputWrapper>
          <TextInput
            placeholder={placeholder}
            onBlur={handleOnBlur}
            onChange={setInputValue}
            value={inputValue}
          />
        </InputWrapper>

        <SelectWrapper>
          <Selector
            options={options ?? []}
            displayValue={displayValue}
            onChange={handleOnChangeSelect}
          />
        </SelectWrapper>
      </FieldsWrapper>
    </CommonField>
  );
};
export default InputSelectField;

const FieldsWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  gap: `${theme.spacing.smallest}px`,
  paddingRight: `${theme.spacing.normal}px`,
  alignItems: "center"
}));

const InputWrapper = styled("div")(() => ({
  flex: "1"
}));

const SelectWrapper = styled("div")(() => ({
  width: "38px"
}));
