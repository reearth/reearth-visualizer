import { Meta, Story } from "@storybook/react";
import React from "react";

import Video, { Props } from ".";

export default {
  title: "molecules/Visualizer/Block/Video",
  component: Video,
  argTypes: {
    onClick: { action: "onClick" },
    onChange: { action: "onChange" },
  },
} as Meta;

const Template: Story<Props> = args => <Video {...args} />;

export const Default = Template.bind({});
Default.args = {
  block: { id: "", property: { default: { url: "https://www.youtube.com/watch?v=oUFJJNQGwhk" } } },
  isSelected: false,
  isBuilt: false,
  isEditable: false,
};

export const Title = Template.bind({});
Title.args = {
  block: {
    id: "",
    property: { default: { url: "https://www.youtube.com/watch?v=oUFJJNQGwhk", title: "Video" } },
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
