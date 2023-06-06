import { Meta, Story } from "@storybook/react";

import Navigator, { Props } from ".";

export default {
  component: Navigator,
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

export const Normal: Story<Props> = ({ ...args }) => <Navigator {...args} degree={0} />;
