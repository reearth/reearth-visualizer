import React from "react";
import { Meta, Story } from "@storybook/react";
import Location, { Props } from ".";

export default {
  title: "molecules/Visualizer/Block/Location",
  component: Location,
  argTypes: {
    onClick: { action: "onClick" },
    onChange: { action: "onChange" },
  },
} as Meta;

const Template: Story<Props> = args => <Location {...args} />;

export const Default = Template.bind({});
Default.args = {
  block: { id: "", property: { default: { location: { lat: 0, lng: 0 } } } },
  isSelected: false,
  isBuilt: false,
  isEditable: false,
};

export const Title = Template.bind({});
Title.args = {
  block: { id: "", property: { default: { location: { lat: 0, lng: 0 }, title: "Location" } } },
  isSelected: false,
  isBuilt: false,
  isEditable: false,
};

export const NoLocation = Template.bind({});
NoLocation.args = {
  isSelected: false,
  isBuilt: false,
  isEditable: true,
};
