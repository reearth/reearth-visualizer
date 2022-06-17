import { Meta, Story } from "@storybook/react";

import Modal, { Props } from ".";

export default {
  title: "atoms/Modal",
  component: Modal,
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

export const Default: Story<Props> = args => <Modal {...args} />;

Default.args = {
  title: "Title",
  size: "sm",
  isVisible: true,
};
