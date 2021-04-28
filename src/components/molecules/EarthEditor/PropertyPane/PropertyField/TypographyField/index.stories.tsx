import React from "react";
import { Meta } from "@storybook/react";
import { action } from "@storybook/addon-actions";

import TypographyField from ".";

export default {
  title: "molecules/EarthEditor/PropertyPane/PropertyField/TypographyField",
  component: TypographyField,
} as Meta;

export const Default = () => <TypographyField onChange={action("onchange")} />;
