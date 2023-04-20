import { Meta, Story } from "@storybook/react";

import Video, { Props } from ".";

export default {
  component: Video,
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

const Template: Story<Props> = args => <Video {...args} />;

export const Default = Template.bind({});
Default.args = {
  block: { id: "", property: { url: "https://www.youtube.com/watch?v=oUFJJNQGwhk" } },
  isSelected: false,
  isBuilt: false,
  isEditable: false,
};

export const Title = Template.bind({});
Title.args = {
  block: {
    id: "",
    property: { url: "https://www.youtube.com/watch?v=oUFJJNQGwhk", title: "Video" },
  },
  isSelected: false,
  isBuilt: false,
  isEditable: false,
};

export const NoVideo = Template.bind({});
NoVideo.args = {
  isSelected: false,
  isBuilt: false,
  isEditable: true,
};
