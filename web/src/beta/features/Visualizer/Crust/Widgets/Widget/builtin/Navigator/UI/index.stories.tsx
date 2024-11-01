import { Meta, StoryFn } from "@storybook/react";

import Navigator, { Props } from ".";

export default {
  component: Navigator,
  parameters: { actions: { argTypesRegex: "^on.*" } }
} as Meta;

export const Normal: StoryFn<Props> = ({ ...args }) => (
  <Navigator {...args} degree={0} />
);
