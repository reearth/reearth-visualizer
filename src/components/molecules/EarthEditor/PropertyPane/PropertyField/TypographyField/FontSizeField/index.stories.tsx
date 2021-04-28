import React from "react";
import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";

import FontSizeField from ".";

storiesOf("molecules/EarthEditor/PropertyPane/PropertyField/TypographyField/FontSizeField", module)
  .add("default", () => <FontSizeField onChange={action("onchange")} />)
  .add("linked", () => <FontSizeField linked onChange={action("onchange")} />)
  .add("overridden", () => <FontSizeField overridden onChange={action("onchange")} />)
  .add("disabled", () => <FontSizeField disabled onChange={action("onchange")} />)
  .add("linked & disabled", () => <FontSizeField linked disabled onChange={action("onchange")} />)
  .add("overridden & disabled", () => (
    <FontSizeField overridden disabled onChange={action("onchange")} />
  ))
  .add("linked & overridden", () => (
    <FontSizeField linked overridden onChange={action("onchange")} />
  ))
  .add("linekd & overridden & disabled", () => (
    <FontSizeField linked overridden disabled onChange={action("onchange")} />
  ));
