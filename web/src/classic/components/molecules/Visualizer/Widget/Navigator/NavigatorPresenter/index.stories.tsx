import { Meta, Story } from "@storybook/react";

import Navigator, { Props } from ".";

export default {
  title: "atoms/Navigator",
  component: Navigator,
} as Meta;

export const Normal: Story<Props> = () => <Navigator degree={0} />;
