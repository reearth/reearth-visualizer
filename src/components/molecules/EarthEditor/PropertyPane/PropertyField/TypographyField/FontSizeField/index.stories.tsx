import React from "react";
import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";

import FontSizeField from ".";

storiesOf("molecules/EarthEditor/PropertyPane/PropertyField/TypographyField/FontSizeField", module)
  .add("default", () => <FontSizeField onChange={action("onchange")} />)
  .add("selected", () => <FontSizeField value={10} onChange={action("onchange")} />);
