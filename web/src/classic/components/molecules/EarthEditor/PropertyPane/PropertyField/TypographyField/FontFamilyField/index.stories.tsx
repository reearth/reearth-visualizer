import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";

import FontFamilyField from ".";

export default {
  title: "classic/molecules/EarthEditor/PropertyPane/PropertyField/TypographyField/FontFamilyField",
  component: FontFamilyField,
} as Meta;

export const Default = () => <FontFamilyField onChange={action("onchange")} />;
export const Selected = () => (
  <FontFamilyField value="Comic Sans MS" onChange={action("onchange")} />
);
export const Linked = () => (
  <FontFamilyField value="Comic Sans MS" color={"#00A0E8"} onChange={action("onchange")} />
);
export const Overridden = () => (
  <FontFamilyField value="Tahoma" color={"#CFBF01"} onChange={action("onchange")} />
);
