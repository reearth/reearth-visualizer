import { FC, useCallback, useEffect, useState } from "react";

import { Radio } from "@reearth/beta/lib/reearth-ui";
import { styled } from "@reearth/services/theme";

export type RadioGroupProps = {
  layout?: "vertical" | "horizontal";
  options?: { value: string; label?: string }[];
  onChange?: (value: string) => void;
};

export const RadioGroup: FC<RadioGroupProps> = ({ layout = "horizontal", options, onChange }) => {
  const [checkedValue, setCheckedValue] = useState("");

  useEffect(() => {
    if (options && options.length > 0 && !checkedValue) {
      setCheckedValue(options[0].value);
    }
  }, [options, checkedValue, onChange]);

  const handleRadioChange = useCallback(
    (newValue: string) => {
      if (newValue === checkedValue) return;
      setCheckedValue(newValue);
      onChange?.(newValue);
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
