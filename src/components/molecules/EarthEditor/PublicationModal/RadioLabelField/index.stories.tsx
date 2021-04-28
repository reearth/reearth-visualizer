import React from "react";
import { Meta } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import RadioLabelField, { RadioLabelFieldProps } from ".";

const items: RadioLabelFieldProps["items"] = [
  { label: "デフォルトドメイン", value: "default" },
  { label: "カスタムドメイン", value: "custom" },
];

export default {
  title: "molecules/EarthEditor/PublicationModal/RadioLabelField",
  component: RadioLabelField,
} as Meta;

export const Default = () => (
  <RadioLabelField selectedValue="default" items={items} onChange={action("onchange")} />
);
