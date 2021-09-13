import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import React from "react";

import RadioField from ".";

const items: { key: string; label?: string; icon?: string }[] = [
  { key: "0", label: "left", icon: "alignLeft" },
  { key: "1", label: "center", icon: "alignCenter" },
  { key: "2", label: "right", icon: "alignRight" },
];

export default {
  title: "molecules/EarthEditor/PropertyPane/PropertyField/RadioField",
  component: RadioField,
} as Meta;

export const Default = () => <RadioField value="0" items={items} onChange={action("onchange")} />;
export const Linked = () => (
  <RadioField value="0" items={items} linked onChange={action("onchange")} />
);
export const Overridden = () => (
  <RadioField value="0" items={items} overridden onChange={action("onchange")} />
);
export const Disabled = () => (
  <RadioField value="0" items={items} disabled onChange={action("onchange")} />
);
