import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";

import ColorField from ".";

export default {
  title: "molecules/EarthEditor/PropertyPane/PropertyField/ColorField",
  component: ColorField,
} as Meta;

export const Default = () => <ColorField onChange={action("onchange")} />;
