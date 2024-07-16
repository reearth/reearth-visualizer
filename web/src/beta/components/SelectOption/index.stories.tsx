import { Meta } from "@storybook/react";

import { Option } from ".";

export default {
  title: "beta/components/SelectOption",
  component: Option,
} as Meta;

export const Default = () => (
  <Option value="value" label="label">
    Option
  </Option>
);
