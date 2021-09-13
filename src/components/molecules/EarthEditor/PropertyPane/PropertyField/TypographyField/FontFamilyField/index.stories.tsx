import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import React from "react";

import { colors } from "@reearth/theme";

import FontFamilyField from ".";

export default {
  title: "molecules/EarthEditor/PropertyPane/PropertyField/TypographyField/FontFamilyField",
  component: FontFamilyField,
} as Meta;

export const Default = () => <FontFamilyField onChange={action("onchange")} />;
export const Selected = () => (
  <FontFamilyField value="Comic Sans MS" onChange={action("onchange")} />
);
export const Linked = () => (
  <FontFamilyField
    value="Comic Sans MS"
    color={colors.dark.primary.main}
    onChange={action("onchange")}
  />
);
export const Overridden = () => (
  <FontFamilyField
    value="Tahoma"
    color={colors.dark.functional.attention}
    onChange={action("onchange")}
  />
);
