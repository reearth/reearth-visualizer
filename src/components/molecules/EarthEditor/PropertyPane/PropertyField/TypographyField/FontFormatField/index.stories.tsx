import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react";
import React from "react";

import FontFormatField from ".";

storiesOf(
  "molecules/EarthEditor/PropertyPane/PropertyField/TypographyField/FontFormatField",
  module,
)
  .add("default", () => (
    <FontFormatField values={["bold", "italic"]} onChange={action("onchange")} />
  ))
  .add("linked", () => (
    <FontFormatField values={["bold", "italic"]} linked onChange={action("onchange")} />
  ))
  .add("overridden", () => (
    <FontFormatField values={["bold", "italic"]} overridden onChange={action("onchange")} />
  ))
  .add("disabled", () => (
    <FontFormatField values={["bold", "italic"]} disabled onChange={action("onchange")} />
  ))
  .add("linked & disabled", () => (
    <FontFormatField values={["bold", "italic"]} linked disabled onChange={action("onchange")} />
  ))
  .add("overridden & disabled", () => (
    <FontFormatField
      values={["bold", "italic"]}
      overridden
      disabled
      onChange={action("onchange")}
    />
  ))
  .add("linked & overridden", () => (
    <FontFormatField values={["bold", "italic"]} linked overridden onChange={action("onchange")} />
  ))
  .add("linekd & overridden & disabled", () => (
    <FontFormatField
      values={["bold", "italic"]}
      linked
      overridden
      disabled
      onChange={action("onchange")}
    />
  ));
