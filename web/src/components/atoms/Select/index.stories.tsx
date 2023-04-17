import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";

import Select from ".";

const items: { value: string; label: string }[] = [
  { value: "0", label: "120" },
  { value: "1", label: "2000" },
];

export default {
  title: "atoms/Select",
  component: Select,
} as Meta;

export const Default = () => (
  <Select value="0" onChange={action("onchange")}>
    {items.map(({ value, label }) => (
      <li key={value} value={value}>
        {label}
      </li>
    ))}
  </Select>
);
