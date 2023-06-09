import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";

import darkColors from "@reearth/services/theme/darkTheme/colors";

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
    color={darkColors.primary.main}
    onChange={action("onchange")}
  />
);
export const Overridden = () => (
  <FontFamilyField
    value="Tahoma"
    color={darkColors.functional.attention}
    onChange={action("onchange")}
  />
);
