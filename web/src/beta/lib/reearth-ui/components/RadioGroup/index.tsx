import { FC, useCallback } from "react";

import { Radio } from "@reearth/beta/lib/reearth-ui";
import { styled } from "@reearth/services/theme";

export type RadioGroupProps = {
  layout?: "vertical" | "horizontal";
  checkedValue?: string;
  options?: { value: string; label?: string }[];
  onChange?: (value: string) => void;
};

export const RadioGroup: FC<RadioGroupProps> = ({
  layout = "horizontal",
  checkedValue,
  options,
  onChange,
}) => {
  const handleRadioChange = useCallback(
    (value: string) => {
      if (value === checkedValue) return;
      onChange?.(value);
    },
    [onChange, checkedValue],
  );

  return (
    <RadioGroupWrapper layout={layout}>
      {options?.map((option, index) => (
        <Radio
          key={index}
          value={option.value}
          label={option.label}
          checked={option.value === checkedValue}
          onChange={handleRadioChange}
        />
      ))}
    </RadioGroupWrapper>
  );
};

const RadioGroupWrapper = styled("div")<{ layout?: "vertical" | "horizontal" }>(
  ({ layout, theme }) => ({
    display: "flex",
    flexDirection: layout === "vertical" ? "column" : "row",
    gap: theme.spacing.normal,
  }),
);
