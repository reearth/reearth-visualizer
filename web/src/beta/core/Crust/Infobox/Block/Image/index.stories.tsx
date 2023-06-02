import { Meta, Story } from "@storybook/react";

import Image, { Props } from ".";

export default {
  component: Image,
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

const Template: Story<Props> = args => (
  <div style={{ background: "#fff" }}>
    <Image {...args} />
  </div>
);

export const Default = Template.bind({});
Default.args = {
  block: { id: "", property: { image: `/sample.svg` } },
  isSelected: false,
  isBuilt: false,
  isEditable: false,
};

export const NoImage = Template.bind({});
NoImage.args = {
  isSelected: false,
  isBuilt: false,
  isEditable: true,
};

export const Title = Template.bind({});
Title.args = {
  block: {
    id: "",
    property: { image: `/sample.svg`, title: "Title" },
  },
  isSelected: false,
  isBuilt: false,
  isEditable: false,
};

export const FullSize = Template.bind({});
FullSize.args = {
  block: {
    id: "",
    property: { image: `/sample.svg`, fullSize: true },
  },
  isSelected: false,
  isBuilt: false,
  isEditable: false,
};

export const Cover = Template.bind({});
Cover.args = {
  block: {
    id: "",
    property: {
      image: `/sample.svg`,
      imageSize: "cover",
      title: "Title",
    },
  },
  isSelected: false,
  isBuilt: false,
  isEditable: false,
};

export const Contain = Template.bind({});
Contain.args = {
  block: {
    id: "",
    property: {
      image: `/sample.svg`,
      imageSize: "contain",
      title: "Title",
    },
  },
  isSelected: false,
  isBuilt: false,
  isEditable: false,
};

export const Position = Template.bind({});
Position.args = {
  block: {
    id: "",
    property: {
      image: `/sample.svg`,
      imageSize: "cover",
      title: "Title",
      imagePositionX: "left",
      imagePositionY: "top",
    },
  },
  isSelected: false,
  isBuilt: false,
  isEditable: false,
};
