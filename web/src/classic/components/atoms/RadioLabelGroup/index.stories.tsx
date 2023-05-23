import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";

import RadioLabel, { RadioLabelProps } from "../RadioLabel";

import RadioLabelGroup from ".";

const items: RadioLabelProps[] = [
  { label: "default", value: "default" },
  { label: "checked", value: "checked" },
];

export default {
  title: "atoms/RadioLabelGroup",
  component: RadioLabelGroup,
} as Meta;

export const Default = () => (
  <RadioLabelGroup selectedValue={"default"} onChange={action("onchange")}>
    {items.map(item => (
      <RadioLabel key={item.value} value={item.value} label={item.label} />
    ))}
  </RadioLabelGroup>
);
