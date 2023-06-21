import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";

import FontFormatField from ".";

export default {
  title: "classic/molecules/EarthEditor/PropertyPane/PropertyField/TypographyField/FontFormatField",
  component: FontFormatField,
} as Meta;

export const Default = () => (
  <FontFormatField values={["bold", "italic"]} onChange={action("onchange")} />
);
export const Linked = () => (
  <FontFormatField values={["bold", "italic"]} linked onChange={action("onchange")} />
);
export const Overridden = () => (
  <FontFormatField values={["bold", "italic"]} overridden onChange={action("onchange")} />
);
export const Disabled = () => (
  <FontFormatField values={["bold", "italic"]} disabled onChange={action("onchange")} />
);
export const LinkedAndDisabled = () => (
  <FontFormatField values={["bold", "italic"]} linked disabled onChange={action("onchange")} />
);
export const OverriddenAndDisabled = () => (
  <FontFormatField values={["bold", "italic"]} overridden disabled onChange={action("onchange")} />
);
export const LinkedAndOverridden = () => (
  <FontFormatField values={["bold", "italic"]} linked overridden onChange={action("onchange")} />
);
export const LinkedAndOverriddenAndDisabled = () => (
  <FontFormatField
    values={["bold", "italic"]}
    linked
    overridden
    disabled
    onChange={action("onchange")}
  />
);
