import { Radio } from "@reearth/beta/lib/reearth-ui";
import { styled } from "@reearth/services/theme";
import { FC, ReactNode, useCallback, useEffect, useState } from "react";

export type RadioGroupProps = {
  layout?: "vertical" | "horizontal";
  value?: string;
  options?: { value: string; label?: string; children?: ReactNode }[];
  onChange?: (value: string) => void;
  ariaLabelledby?: string;
  dataTestid?: string;
};

export const RadioGroup: FC<RadioGroupProps> = ({
  layout = "horizontal",
  value,
  options,
  onChange,
  ariaLabelledby,
  dataTestid
}) => {
  const [currentValue, setCurrentValue] = useState(value);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  const handleValueChange = useCallback(
    (newValue: string) => {
      if (newValue === currentValue) return;
      setCurrentValue(newValue);
      onChange?.(newValue);
    },
    [onChange, currentValue]
  );

  return (
    <RadioGroupWrapper
      layout={layout}
      role="radiogroup"
      aria-labelledby={ariaLabelledby}
      data-testid={dataTestid}
    >
      {options?.map((option, index) => (
        <Radio
          key={index}
          value={option.value}
          label={option.label}
          checked={option.value === currentValue}
          content={option.children}
          onChange={handleValueChange}
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
    width: "100%"
  })
);
