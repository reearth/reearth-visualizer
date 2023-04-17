import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";

import { styled } from "@reearth/theme";

import RadioGroup from ".";

const items: { value: string; label: string }[] = [
  { value: "0", label: "A" },
  { value: "1", label: "B" },
  { value: "2", label: "C" },
];

const Radio = styled.div<{ value: string; label: string }>``;

export default {
  title: "atoms/RadioGroup",
  component: RadioGroup,
} as Meta;

export const Default = () => (
  <RadioGroup value="0" onChange={action("onchange")}>
    {items.map(({ value, label }) => (
      <Radio key={value} value={value} label={label}>
        {label}
      </Radio>
    ))}
  </RadioGroup>
);
