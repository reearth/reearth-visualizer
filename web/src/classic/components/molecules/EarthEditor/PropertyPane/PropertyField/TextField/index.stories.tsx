import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";

import TextField from ".";

export default {
  title: "molecules/EarthEditor/PropertyPane/PropertyField/TextField",
  component: TextField,
} as Meta;

export const Default = () => <TextField name="title" value="value" onChange={action("onchange")} />;
export const Linked = () => (
  <TextField name="title" value="value" onChange={action("onchange")} linked />
);
export const Overridden = () => (
  <TextField name="title" value="value" onChange={action("onchange")} overridden />
);
export const Inactive = () => (
  <TextField name="title" value="value" onChange={action("onchange")} disabled />
);
export const Multiline = () => (
  <TextField name="title" value="value" onChange={action("onchange")} multiline />
);
