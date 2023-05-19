import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react";

import FontSizeField from ".";

storiesOf("molecules/EarthEditor/PropertyPane/PropertyField/TypographyField/FontSizeField", module)
  .add("default", () => <FontSizeField onChange={action("onchange")} />)
  .add("selected", () => <FontSizeField value={10} onChange={action("onchange")} />);
