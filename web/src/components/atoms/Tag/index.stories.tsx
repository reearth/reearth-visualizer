import { Meta, Story } from "@storybook/react";

import Tag, { Props } from ".";

export default {
  title: "atoms/Tag",
  component: Tag,
} as Meta;

export const Default: Story<Props> = args => <Tag {...args} />;
export const Remove: Story<Props> = args => <Tag {...args} />;

Default.args = {
  icon: "cancel",
  onRemove: () => console.log("detatch!"),
  id: "tag",
  label: "tag",
};
Remove.args = {
  icon: "bin",
  onRemove: () => console.log("remove!"),
  id: "tag",
  label: "tag",
};
