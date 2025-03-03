import {
  Selector,
  SelectorProps,
  TextInput,
  TextInputProps
} from "@reearth/beta/lib/reearth-ui";
import { styled } from "@reearth/services/theme";
import { FC, useEffect, useState } from "react";

import CommonField, { CommonFieldProps } from "./CommonField";

export type PropertySelectorProps = CommonFieldProps &
  Pick<
    TextInputProps,
    "value" | "placeholder" | "onChange" | "onBlur" | "disabled" | "appearance"
  > &
  // Note: temporary passinng [displayLabel] [menuWidth] [displayWidth] as props since it's difficult to support auto resize on current Selector component
  Pick<SelectorProps, "displayLabel"> & {
    options?: { label?: string; value: string }[];
    menuWidth?: number;
    displayWidth?: number;
  };

const PropertySelectorField: FC<PropertySelectorProps> = ({
  value,
  title,
  description,
  placeholder,
  onBlur,
  options,
  displayLabel,
  displayWidth,
  menuWidth
}) => {
  const [inputValue, setInputValue] = useState<string | undefined>(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

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

        <SelectWrapper displayWidth={displayWidth}>
          <Selector
            // Note: value will not match since the input will have ${} but it's okey
            value={inputValue}
            options={options ?? []}
            displayLabel={displayLabel}
            onChange={handleOnChangeSelect}
            menuWidth={menuWidth}
          />
        </SelectWrapper>
      </FieldsWrapper>
    </CommonField>
  );
};
export default PropertySelectorField;

const FieldsWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  gap: `${theme.spacing.smallest}px`,
  paddingRight: `${theme.spacing.normal}px`,
  alignItems: "center"
}));

const InputWrapper = styled("div")(() => ({
  flex: "1"
}));

const SelectWrapper = styled("div")(
  ({ displayWidth }: { displayWidth: number | undefined }) => ({
    width: `${displayWidth}px`
  })
);
