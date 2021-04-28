import React from "react";
import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";

import FontFamilyField from ".";

storiesOf(
  "molecules/EarthEditor/PropertyPane/PropertyField/TypographyField/FontFamilyField",
  module,
)
  .add("default", () => <FontFamilyField onChange={action("onchange")} />)
  .add("linked", () => <FontFamilyField linked onChange={action("onchange")} />)
  .add("overridden", () => <FontFamilyField overridden onChange={action("onchange")} />)
  .add("disabled", () => <FontFamilyField disabled onChange={action("onchange")} />)
  .add("linked & disabled", () => <FontFamilyField linked disabled onChange={action("onchange")} />)
  .add("overridden & disabled", () => (
    <FontFamilyField overridden disabled onChange={action("onchange")} />
  ))
  .add("linked & overridden", () => (
    <FontFamilyField linked overridden onChange={action("onchange")} />
  ))
  .add("linekd & overridden & disabled", () => (
    <FontFamilyField linked overridden disabled onChange={action("onchange")} />
  ));
