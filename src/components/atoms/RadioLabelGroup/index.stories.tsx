import React from "react";
import { Meta } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import RadioLabelGroup from ".";
import RadioLabel, { RadioLabelProps } from "../RadioLabel";

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
